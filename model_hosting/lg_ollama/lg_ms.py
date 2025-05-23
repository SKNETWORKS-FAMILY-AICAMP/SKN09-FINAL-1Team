import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, trim_messages,filter_messages
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
# from langchain_community.llms import Ollama
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
        # self.model = Ollama(model=model_name)
        
    def chatbot(self, state: State):
        messages = state['messages']
        answer = self.model.invoke(messages)
        messages.append(AIMessage(content=answer))
        return {'messages': messages}
    
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
        
        result = self.graph.invoke({'messages': SystemMessage(content=prompt)}, self.thread)
        return result
    
    def load_chat_history(self, thread_id: int):
        """이전 채팅 내역 불러오기 (DB 구현 전 임시 함수)"""
        #  DB 구현 후 실제 히스토리 불러오기 구현
        pass

    def send_message(self, message: str):
        result = self.graph.invoke({'messages': HumanMessage(content=message)}, self.thread)
        return result

    def get_chat_history(self):
    
        return self.messages



# 테스트
# chatbot = StartChatBot(1)
# result = chatbot.start_chat()
# print(result)
# print()
# result = chatbot.send_message("너는 어떤 AI야?")
# print(result['messages'][-1].content)

