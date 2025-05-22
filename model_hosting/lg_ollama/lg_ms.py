from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, trim_messages,filter_messages
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
from langgraph.graph import StateGraph, START, END, add_messages
from langgraph.checkpoint.memory import MemorySaver

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
        messages = [SystemMessage(content="너는 이전 대화를 기억해서 대화를 해주는 AI야 한글로만 대답해줘"),
                    HumanMessage(content="안녕 내 이름은 이재혁이야")]
        return self.graph.invoke({'messages': messages}, self.thread)

    
    def add_message(self, message: str):
        
        return self.graph.invoke({'messages': [HumanMessage(content=message)]}, self.thread)

chatbot = StartChatBot(1)

result = chatbot.start_chat()
print(result)

result = chatbot.add_message("내 이름이 뭐야?")
print(result)


# 실행 확인  
# chatbot = ChatBotGraph()
# graph = chatbot.build_graph()

# thread1 = {'configurable': {'thread_id': 1}}

# sys_msg = SystemMessage(content="너는 사용자의 이름을 물어보고 기억해야 해.")


# result_1 = graph.invoke({'messages':[SystemMessage(content="너는 이전 대화를 기억해서 대화를 해주는 AI야")]}, thread1)
# result_2 = graph.invoke({'messages':[HumanMessage(content="안녕 내 이름은 이재혁이야")]}, thread1)
# result_3 = graph.invoke({'messages':[HumanMessage(content="내 이름이 뭐야?")]}, thread1)

# print(graph.get_state(thread1))


# 실행 확인
# graph = OllamaGraph()
# graph.build_graph().get_graph().draw_mermaid_png(output_file_path="graph.png")