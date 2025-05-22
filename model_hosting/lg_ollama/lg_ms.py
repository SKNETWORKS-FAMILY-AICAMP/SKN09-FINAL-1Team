from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, trim_messages,filter_messages
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
from langgraph.graph import StateGraph, START, END, add_messages
from langgraph.checkpoint.memory import MemorySaver

from extraction.prompt_extraciont import PromptExtraction

class State(TypedDict):
    messages: Annotated[list, add_messages]

class ChatBotGraph:
    def __init__(self, model_name: str = "qwen2.5"):
        super().__init__()
        self.model_name = model_name
        self.model = OllamaLLM(model=model_name)
        
    def chatbot(self, state: State):
        answer = self.model.invoke(state['messages'])
        return {'messages': [answer]}
    
    def build_graph(self):
        builder = StateGraph(State)
        builder.add_node("chatbot", self.chatbot)
        builder.add_edge(START, 'chatbot')
        builder.add_edge('chatbot', END)
        graph = builder.compile(checkpointer=MemorySaver())
        return graph

    
class StartChatBot:
    def __init__(self, thread_id: int):
        self.chatbot = ChatBotGraph()
        self.graph = self.chatbot.build_graph()
        self.thread_id = thread_id
        self.thread = {'configurable': {'thread_id': self.thread_id}}
        
    def start_chat(self):
        prompt_extraction = PromptExtraction()
        prompt = prompt_extraction.test_make_prompt_to_extract_criteria()
        messages = [SystemMessage(content=prompt)]
        return self.graph.invoke({'messages': messages}, self.thread)

    
    def send_message(self, message: str):
        
        return self.graph.invoke({'messages': [HumanMessage(content=message)]}, self.thread)

# 모듈 실행 테스트 확인
# chatbot = StartChatBot(1)
# result = chatbot.start_chat()
# print(result)
# print()
# result = chatbot.add_message("내 이름이 뭐야?")
# print(result['messages'][-1].content)
