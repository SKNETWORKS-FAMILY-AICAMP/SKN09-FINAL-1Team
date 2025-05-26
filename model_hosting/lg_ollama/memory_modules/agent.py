from typing import List, Literal
from langchain_core.messages import get_buffer_string
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from langchain_ollama import ChatOllama
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from transformers import AutoTokenizer

class State(MessagesState):
    recall_memories: List[str]

class MemoryAgent:
    def __init__(self, model_name: str = "qwen2.5", tokenizer_name: str = "BM-K/KoSimCSE-roberta"):
        """
        메모리 에이전트 초기화
        
        Args:
            model_name (str): 사용할 Ollama 모델 이름
            tokenizer_name (str): 사용할 토크나이저 모델 이름
        """
        self.model = ChatOllama(model=model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
        self.prompt = self._create_prompt()
        self.tools = None
        
    def _create_prompt(self) -> ChatPromptTemplate:
        """프롬프트 템플릿 생성"""
        return ChatPromptTemplate.from_messages([
            (
                "system",
                "You are a helpful assistant with advanced long-term memory"
                " capabilities. Powered by a stateless LLM, you must rely on"
                " external memory to store information between conversations."
                " Utilize the available memory tools to store and retrieve"
                " important details that will help you better attend to the user's"
                " needs and understand their context.\n\n"
                "Memory Usage Guidelines:\n"
                "1. Actively use memory tools (save_core_memory, save_recall_memory)"
                " to build a comprehensive understanding of the user.\n"
                "2. Make informed suppositions and extrapolations based on stored"
                " memories.\n"
                "3. Regularly reflect on past interactions to identify patterns and"
                " preferences.\n"
                "4. Update your mental model of the user with each new piece of"
                " information.\n"
                "5. Cross-reference new information with existing memories for"
                " consistency.\n"
                "6. Prioritize storing emotional context and personal values"
                " alongside facts.\n"
                "7. Use memory to anticipate needs and tailor responses to the"
                " user's style.\n"
                "8. Recognize and acknowledge changes in the user's situation or"
                " perspectives over time.\n"
                "9. Leverage memories to provide personalized examples and"
                " analogies.\n"
                "10. Recall past challenges or successes to inform current"
                " problem-solving.\n\n"
                "## Recall Memories\n"
                "Recall memories are contextually retrieved based on the current"
                " conversation:\n{recall_memories}\n\n"
                "## Instructions\n"
                "Engage with the user naturally, as a trusted colleague or friend."
                " There's no need to explicitly mention your memory capabilities."
                " Instead, seamlessly incorporate your understanding of the user"
                " into your responses. Be attentive to subtle cues and underlying"
                " emotions. Adapt your communication style to match the user's"
                " preferences and current emotional state. Use tools to persist"
                " information you want to retain in the next conversation. If you"
                " do call tools, all text preceding the tool call is an internal"
                " message. Respond AFTER calling the tool, once you have"
                " confirmation that the tool completed successfully.\n\n",
            ),
            ("placeholder", "{messages}"),
        ])
    
    def setup_model_with_tools(self, tools):
        """모델에 도구 바인딩"""
        self.tools = tools
        self.model_with_tools = self.model.bind_tools(tools)
        return self.model_with_tools
    
    def agent(self, state: State) -> State:
        """현재 상태 처리 및 응답 생성"""
        bound = self.prompt | self.model_with_tools
        recall_str = (
            "<recall_memory>\n" + "\n".join(state["recall_memories"]) + "\n</recall_memory>"
        )
        prediction = bound.invoke(
            {
                "messages": state["messages"],
                "recall_memories": recall_str,
            }
        )
        return {
            "messages": [prediction],
        }
    
    def load_memories(self, state: State, config: RunnableConfig) -> State:
        """대화를 위한 메모리 로드"""
        if not self.tools:
            raise ValueError("Tools have not been set up. Call setup_model_with_tools first.")
            
        convo_str = get_buffer_string(state["messages"])
        tokens = self.tokenizer(convo_str, truncation=True, max_length=2048)
        truncated_text = self.tokenizer.decode(tokens['input_ids'])
        
        # tools[1]은 search_recall_memories 도구입니다
        recall_memories = self.tools[1].invoke(truncated_text, config=config)
        return {
            "recall_memories": recall_memories,
        }
    
    def route_tools(self, state: State) -> Literal["tools", "__end__"]:
        """도구 사용 여부 결정"""
        msg = state["messages"][-1]
        if msg.tool_calls:
            return "tools"
        return END
    
    def create_graph(self, tools):
        """그래프 생성 및 설정"""
        builder = StateGraph(State)
        
        # 노드 추가
        builder.add_node("load_memories", self.load_memories)
        builder.add_node("agent", self.agent)
        builder.add_node("tools", ToolNode(tools))
        
        # 간선 추가
        builder.add_edge(START, "load_memories")
        builder.add_edge("load_memories", "agent")
        builder.add_conditional_edges("agent", self.route_tools, ["tools", END])
        builder.add_edge("tools", "agent")
        
        return builder 