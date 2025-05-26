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
                "당신은 고급 장기 기억력을 가진 유용한 조수입니다."
                " 기능. 한국어를 이해하는 LLM으로 구동되므로 답변은 한국어로 해야 합니다.."
                " 대화 사이의 정보를 저장하는 외장 메모리가 있습니다."
                " 사용 가능한 메모리 도구를 사용하여 저장하고 검색하세요"
                " 사용자의 주의를 기울이는 데 도움이 되는 중요한 세부 사항"
                "메모리 사용 지침:\n"
                "1. 메모리 도구(save_core_memory, save_recall_memory)를 적극적으로 사용하세요."
                " 사용자에 대한 포괄적인 이해를 구축하기 위해.\n"
                "2. 저장된 자료를 바탕으로 정보에 입각한 가정과 추정을 합니다."
                " 추억.\n"
                "3. 패턴을 식별하기 위해 과거 상호작용을 정기적으로 반성하고"
                " 기본 설정.\n"
                "4. 새로운 작품마다 사용자의 정신 모델을 업데이트하세요."
                " 정보.\n"
                "5. 새로운 정보와 기존 기억을 상호 참조하십시오."
                " 일관성.\n"
                "6. 감정적 맥락과 개인적 가치를 저장하는 것을 우선시합니다."
                " 사실과 함께.\n"
                "7. 기억을 사용하여 필요를 예측하고 이에 대한 대응을 맞춤화하세요."
                " 사용자 스타일.\n"
                "8. 사용자의 상황 변화를 인식하고 인정하기 또는"
                " 시간에 따른 관점.\n"
                "9. 기억을 활용하여 개인화된 예시를 제공합니다."
                " 유추.\n"
                "10. 과거의 도전이나 성공을 회상하여 현재를 알립니다."
                " 문제 해결.\n\n"
                "## 추억 회상\n"
                "소환 기억은 현재를 기준으로 맥락적으로 검색됩니다."
                " 대화:\n{recall_memories}\n\n"
                "## 지침\n"
                "신뢰할 수 있는 동료나 친구로서 자연스럽게 사용자와 소통하세요."
                " 당신의 기억 능력을 명시적으로 언급할 필요는 없습니다."
                " 대신 사용자에 대한 이해를 원활하게 통합하세요."
                " 당신의 반응에 귀를 기울이세요. 미묘한 신호와 근본적인 정보에 주의하세요."
                " 감정. 사용자의 의사소통 스타일에 맞게 조정하세요."
                " 선호도와 현재 감정 상태. 지속하려면 도구를 사용하세요."
                " 다음 대화에서 유지하고 싶은 정보. 만약 당신이"
                " 도구 호출을 하세요. 도구 호출 앞에 있는 모든 텍스트는 내부 텍스트입니다"
                " 메시지. 도구를 호출한 후 응답하세요"
                " 도구가 성공적으로 완료되었는지 확인합니다.\n\n",
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