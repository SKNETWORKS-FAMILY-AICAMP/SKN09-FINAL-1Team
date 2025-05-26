from typing import List
from langchain_core.documents import Document
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
import uuid

class MemoryTools:
    def __init__(self, vector_store):
        """
        메모리 도구 초기화
        
        Args:
            vector_store: 벡터 스토어 인스턴스
        """
        self.vector_store = vector_store
        self.save_recall_memory_tool = tool(self._save_recall_memory)
        self.search_recall_memories_tool = tool(self._search_recall_memories)
        self.tools = [self.save_recall_memory_tool, self.search_recall_memories_tool]
    
    def get_user_id(self, config: RunnableConfig) -> str:
        """설정에서 사용자 ID 가져오기"""
        user_id = config["configurable"].get("user_id")
        if user_id is None:
            raise ValueError("User ID needs to be provided to save a memory.")
        return user_id
    
    def _save_recall_memory(self, memory: str, config: RunnableConfig) -> str:
        """벡터 스토어에 메모리 저장"""
        user_id = self.get_user_id(config)
        document = Document(
            page_content=memory,
            id=str(uuid.uuid4()),
            metadata={"user_id": user_id}
        )
        self.vector_store.add_documents([document])
        return memory
    
    def _search_recall_memories(self, query: str, config: RunnableConfig) -> List[str]:
        """관련 메모리 검색"""
        user_id = self.get_user_id(config)
        
        def _filter_function(doc: Document) -> bool:
            return doc.metadata.get("user_id") == user_id
        
        documents = self.vector_store.similarity_search(
            query, k=3, filter=_filter_function
        )
        return [document.page_content for document in documents]
    
    def get_tools(self):
        """도구 목록 반환"""
        return self.tools 