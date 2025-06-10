from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from transformers import AutoTokenizer, AutoModel
import os, torch, json

# 기존 설정 유지
embedding_model_name = "BM-K/KoSimCSE-roberta"
tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
model = AutoModel.from_pretrained(embedding_model_name)
embedding_dim = 768

# Qdrant 경로 (로컬 DB)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
qdrant_path = os.path.join(BASE_DIR, "..", "data", "qdrant_db")
collection_name = "wlmmate_vectors"

# 텍스트 임베딩 함수
def get_embedding(text: str):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

# 업로드된 JSON 파일을 Qdrant에 저장
def embed_uploaded_file(file_path: str):
    client = QdrantClient(path=qdrant_path)

    # 콜렉션 없으면 새로 생성
    if not client.collection_exists(collection_name=collection_name):
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
        )

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    file_idx = 0
    for doc in data:
        if not isinstance(doc, dict):
            continue
        text = "\n".join([f"{k}: {v}" for k, v in doc.items() if v])
        embedding = get_embedding(text)
        payload = {"content": text}
        client.upsert(
            collection_name=collection_name,
            points=[PointStruct(id=file_idx, vector=embedding.tolist(), payload=payload)]
        )
        file_idx += 1
