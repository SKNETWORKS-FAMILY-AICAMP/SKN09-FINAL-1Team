from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, trim_messages,filter_messages
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
from langgraph.graph import StateGraph, START, END, add_messages
from langgraph.checkpoint.memory import MemorySaver

class State(TypedDict):
    messages: Annotated[list, add_messages]

class OllamaGraph:
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

# 실행 확인
# graph = OllamaGraph()
# graph.build_graph().get_graph().draw_mermaid_png(output_file_path="graph.png")