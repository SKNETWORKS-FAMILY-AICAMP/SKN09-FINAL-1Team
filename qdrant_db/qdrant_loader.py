import os
import json
import torch
from transformers import AutoTokenizer, AutoModel
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointIdsList
from qdrant_client.models import Distance, VectorParams, PointStruct
import pymysql
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()
QDRANT_URL = os.environ.get("QDRANT_URL")
QDRANT_KEY = os.environ.get("QDRANT_KEY")

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_KEY,
)

embedding_model_name = "BM-K/KoSimCSE-roberta"
tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
model = AutoModel.from_pretrained(embedding_model_name)
embedding_dim = 768

conn = pymysql.connect(
    host=os.environ.get("MY_DB_HOST", "localhost"),
    port=int(os.environ.get("MY_DB_PORT", "3306")),
    user=os.environ.get("MY_DB_USER", "root"),
    password=os.environ.get("MY_DB_PASSWORD", ""),
    db=os.environ.get("MY_DB_NAME", ""),
    charset=os.environ.get("MY_DB_CHARSET", "utf8mb4"),
)

FOLDER_TO_COLLECTION = {
    "전체": "all",
    "법령": "law",
    "사업": "business",
    "훈령": "directive",
    "민원": "civil",
    "콜메이트": "call",
}


def get_embedding(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()


def clean_doc(doc):
    질문 = doc.get("질문", "").split("\n")[0].strip()
    답변 = doc.get("답변", "")
    unwanted_keywords = ["담당부서", "관련법령", "첨부파일"]
    cleaned_lines = [
        line
        for line in 답변.split("\n")
        if not any(keyword in line for keyword in unwanted_keywords)
    ]
    답변 = "\n".join(cleaned_lines).strip()
    return f"질문: {질문}\n답변: {답변}"


def init_qdrant_from_folders(base_folder="../data/preprocess"):
    for folder in os.listdir(base_folder):
        folder_path = os.path.join(base_folder, folder)
        if not os.path.isdir(folder_path):
            continue
        collection_en = FOLDER_TO_COLLECTION.get(folder, folder)
        collection_name = f"wlmmate_{collection_en}"
        if not client.collection_exists(collection_name=collection_name):
            client.recreate_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=embedding_dim, distance=Distance.COSINE
                ),
            )
        file_idx = 0
        for filename in os.listdir(folder_path):
            if not filename.endswith(".json"):
                continue
            with open(
                os.path.join(folder_path, filename), "r", encoding="utf-8"
            ) as file:
                documents = json.load(file)
            for doc in documents:
                if not isinstance(doc, dict):
                    continue
                embedding_input = "\n".join([f"{k}: {v}" for k, v in doc.items() if v])
                embedding = get_embedding(embedding_input)
                payload = {"content": embedding_input}
                client.upsert(
                    collection_name=collection_name,
                    points=[
                        PointStruct(
                            id=file_idx, vector=embedding.tolist(), payload=payload
                        )
                    ],
                )
                file_idx += 1


def init_qdrant_from_file(
    civil_data_path="../data/civil_data.json", collection_name="wlmmate_civil"
):
    if not client.collection_exists(collection_name=collection_name):
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE),
        )
    with open(civil_data_path, "r", encoding="utf-8") as file:
        documents = json.load(file)
    file_idx = 0
    for doc in documents:
        if not isinstance(doc, dict):
            continue
        embedding_input = clean_doc(doc)
        embedding = get_embedding(embedding_input)
        payload = {"content": embedding_input}
        client.upsert(
            collection_name=collection_name,
            points=[
                PointStruct(id=file_idx, vector=embedding.tolist(), payload=payload)
            ],
        )
        file_idx += 1


def init_qdrant_combined_collection(
    base_folder="../data/preprocess",
    civil_data_path="../data/civil_data.json",
    collection_name="wlmmate_all",
):
    # 컬렉션 초기화
    if not client.collection_exists(collection_name=collection_name):
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE),
        )

    file_idx = 0

    # 폴더 데이터 통합 삽입
    for folder in os.listdir(base_folder):
        folder_path = os.path.join(base_folder, folder)
        if not os.path.isdir(folder_path):
            continue
        for filename in os.listdir(folder_path):
            if not filename.endswith(".json"):
                continue
            with open(
                os.path.join(folder_path, filename), "r", encoding="utf-8"
            ) as file:
                documents = json.load(file)
            for doc in documents:
                if not isinstance(doc, dict):
                    continue
                embedding_input = "\n".join([f"{k}: {v}" for k, v in doc.items() if v])
                embedding = get_embedding(embedding_input)
                payload = {"content": embedding_input, "source": f"{folder}/{filename}"}
                client.upsert(
                    collection_name=collection_name,
                    points=[
                        PointStruct(
                            id=file_idx, vector=embedding.tolist(), payload=payload
                        )
                    ],
                )
                file_idx += 1

    # 민원 데이터 통합 삽입
    if os.path.exists(civil_data_path):
        with open(civil_data_path, "r", encoding="utf-8") as file:
            documents = json.load(file)
        for doc in documents:
            if not isinstance(doc, dict):
                continue
            embedding_input = clean_doc(doc)
            embedding = get_embedding(embedding_input)
            payload = {"content": embedding_input, "source": "민원/civil_data.json"}
            client.upsert(
                collection_name=collection_name,
                points=[
                    PointStruct(id=file_idx, vector=embedding.tolist(), payload=payload)
                ],
            )
            file_idx += 1


def load_qdrant_db(question, collection_name="wlmmate_law"):
    query_vector = get_embedding(question)
    search_results = client.search(
        collection_name=collection_name, query_vector=query_vector, limit=3
    )
    response = f"'{question}'에 대한 관련 문서 검색 결과:\n"
    if search_results:
        for i, result in enumerate(search_results, 1):
            content = result.payload.get("content", "[검색 결과 없음]")
            response += f"\n- 관련 문서 {i}:\n{content}\n"
    else:
        response = f"{question}'에 관한 문서가 존재하지 않습니다."
    return response


def split_into_chunks(text, max_length=300):
    text = text.strip()
    chunks = []
    while len(text) > max_length:
        split_idx = text.rfind("\n", 0, max_length)
        if split_idx == -1:
            split_idx = max_length
        chunks.append(text[:split_idx].strip())
        text = text[split_idx:].strip()
    if text:
        chunks.append(text)
    return chunks


def store_temp_embedding(text_blocks, collection_name="qdrant_temp"):
    if not client.collection_exists(collection_name):
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE),
        )
    points = []
    idx = 0
    for block in text_blocks:
        sub_chunks = split_into_chunks(block, max_length=600)
        for chunk in sub_chunks:
            embedding = get_embedding(chunk)
            payload = {"content": chunk}
            points.append(
                PointStruct(id=idx, vector=embedding.tolist(), payload=payload)
            )
            idx += 1
    client.upsert(collection_name=collection_name, points=points)
    return collection_name


def delete_collection(collection_name="qdrant_temp"):
    if client.collection_exists(collection_name=collection_name):
        client.delete_collection(collection_name=collection_name)
        return True
    return False


def init_qdrant_from_call_db(collection_name="wlmmate_call"):
    if not client.collection_exists(collection_name=collection_name):
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE),
        )

    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT 
                call_counsel.coun_no,
                call_counsel.coun_question,
                call_counsel.coun_answer
            FROM call_counsel
        """
        )

        rows = cursor.fetchall()

        for row in rows:
            coun_no, coun_question, coun_answer = row
            if not coun_question or not coun_answer:
                continue

            content_text = f"질문: {coun_question}\n답변: {coun_answer}"
            embedding = get_embedding(content_text)

            payload = {"content": content_text}

            point = PointStruct(id=coun_no, vector=embedding.tolist(), payload=payload)
            client.upsert(collection_name=collection_name, points=[point])


def delete_point_by_id(collection_name: str, point_id: int):
    if client.collection_exists(collection_name=collection_name):
        client.delete(
            collection_name=collection_name,
            points_selector=PointIdsList(points=[point_id]),
        )
        return True
    return False


def move_collection_points(src_collection: str, dst_collection: str):
    if not client.collection_exists(collection_name=src_collection):
        return f"Source collection '{src_collection}' does not exist."
    if not client.collection_exists(collection_name=dst_collection):
        client.recreate_collection(
            collection_name=dst_collection,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE),
        )
    all_points = client.scroll(collection_name=src_collection, limit=10000)[0]
    if not all_points:
        return f"No points found in '{src_collection}'."
    # dst의 모든 content set 만들기
    dst_points = client.scroll(collection_name=dst_collection, limit=10000)[0]
    dst_contents = set()
    for p in dst_points:
        if p.payload and "content" in p.payload:
            dst_contents.add(p.payload["content"])
    # 중복 아닌 것만 추가
    new_points = []
    next_id = max([p.id for p in dst_points], default=-1) + 1
    for i, p in enumerate(all_points):
        content = p.payload.get("content") if p.payload else None
        if content and content in dst_contents:
            continue  # 이미 있음, 건너뜀
        new_points.append(
            PointStruct(
                id=next_id + len(new_points), vector=p.vector, payload=p.payload
            )
        )
    if new_points:
        client.upsert(collection_name=dst_collection, points=new_points)
    return f"Moved {len(new_points)} new points from '{src_collection}' to '{dst_collection}'."
