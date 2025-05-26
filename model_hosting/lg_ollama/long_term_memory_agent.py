from dotenv import load_dotenv
from langgraph.checkpoint.memory import MemorySaver
from memory_modules import EmbeddingManager, MemoryTools, MemoryAgent

# 환경 변수 로드
load_dotenv()

def create_memory_agent(user_id: str = "1", thread_id: str = "1"):
    """
    메모리 에이전트 생성 및 설정
    
    Args:
        user_id (str): 사용자 ID
        thread_id (str): 대화 스레드 ID
        
    Returns:
        tuple: (graph, config) - 컴파일된 그래프와 설정
    """
    # 임베딩 매니저 초기화
    embedding_manager = EmbeddingManager()
    
    # 메모리 도구 초기화
    memory_tools = MemoryTools(embedding_manager.get_vector_store())
    
    # 에이전트 초기화
    agent = MemoryAgent()
    
    # 도구 설정
    tools = memory_tools.get_tools()
    agent.setup_model_with_tools(tools)
    
    # 그래프 생성 및 컴파일
    builder = agent.create_graph(tools)
    memory_saver = MemorySaver()
    graph = builder.compile(checkpointer=memory_saver)
    
    # 설정 생성
    config = {
        "configurable": {
            "user_id": user_id,
            "thread_id": thread_id
        }
    }
    
    return graph, config

def pretty_print_stream_chunk(chunk):
    """스트림 청크 출력 포맷팅"""
    for node, updates in chunk.items():
        print(f"Update from node: {node}")
        if "messages" in updates:
            updates["messages"][-1].pretty_print()
        else:
            print(updates)
        print("\n")

if __name__ == "__main__":
    # 테스트용 에이전트 생성
    # 처음에 랭그래프 이미지 생성시 주석 풀고 실행 한번 하면 주석 해야함
    # graph, config = create_memory_agent()
    
    # try:
    #     graph_png = graph.get_graph().draw_mermaid_png()
    #     with open("graph.png", "wb") as f:
    #         f.write(graph_png)
    #     print("그래프가 성공적으로 저장되었습니다: graph.png")
    # except Exception as e:
    #     print(f"그래프 시각화 실패: {e}")
    
    # print("메모리 에이전트가 성공적으로 초기화되었습니다.") 
    
    # 에이전트 생성
    # NOTE: 특정 사용자의 메모리를 저장하기 위해 'user_id'를 지정하고 있습니다
    graph, config = create_memory_agent(user_id="user123", thread_id="chat456")

    # 대화 실행
    response_v1 = graph.invoke({
        "messages": [{"role": "user", "content": "안녕하세요!"}]
    }, config)
    response_v1["messages"][-1].pretty_print()
    
    response_v2 = graph.invoke({
        "messages": [{"role": "user", "content": "나는 이재혁이야 만나서 반가워!"}]
    }, config)
    response_v2["messages"][-1].pretty_print()
    
    response_v3 = graph.invoke({
        "messages": [{"role": "user", "content": "내 이름이 뭔지 기억해?"}]
    }, config)
    response_v3["messages"][-1].pretty_print()
