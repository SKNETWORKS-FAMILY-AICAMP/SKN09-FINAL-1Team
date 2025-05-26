from langchain.embeddings import HuggingFaceEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore

class EmbeddingManager:
    def __init__(self, model_name: str = "BM-K/KoSimCSE-roberta"):
        """
        임베딩 관리자 초기화
        
        Args:
            model_name (str): 사용할 임베딩 모델 이름
        """
        self.embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        self.vector_store = InMemoryVectorStore(
            embedding=self.embeddings
        )
    
    def get_embeddings(self):
        """임베딩 모델 반환"""
        return self.embeddings
    
    def get_vector_store(self):
        """벡터 스토어 반환"""
        return self.vector_store 