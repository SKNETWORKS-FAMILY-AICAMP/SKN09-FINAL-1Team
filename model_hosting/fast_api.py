from fastapi import File, UploadFile, Form, APIRouter, Request, HTTPException
from typing import List, Optional, Literal, Any
import tempfile
import os
import re
import pymysql
from duckduckgo_search import DDGS  
from pydantic import BaseModel
from extraction.pdf_extraction import PDFExtraction
from extraction.prompt_extraciont import PromptExtraction
from ollama_load.ollama_hosting import OllamaHosting
from data_loader.qdrant_loader import load_qdrant_db 
from fastapi.responses import JSONResponse
import whisperx 
import ollama
import json
from langchain_core.messages import get_buffer_string, AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from langchain_ollama import ChatOllama
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode
from transformers import AutoTokenizer
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.documents import Document
from langchain_core.tools import tool, StructuredTool
import uuid

# 환경변수에서 DB 접속 정보 불러오기 (없으면 하드코딩)
DB_HOST = os.environ.get("MY_DB_HOST", "localhost")
DB_PORT = int(os.environ.get("MY_DB_PORT", "3306"))
DB_USER = os.environ.get("MY_DB_USER", "woony")
DB_PASSWORD = os.environ.get("MY_DB_PASSWORD", "")  # 실제 비밀번호로 교체
DB_NAME = os.environ.get("MY_DB_NAME", "woony")
DB_CHARSET = os.environ.get("MY_DB_CHARSET", "utf8")

class State(BaseModel):
    messages: List[Any] = []
    recall_memories: List[str] = []

class EmbeddingManager:
    def __init__(self, model_name: str = "BM-K/KoSimCSE-roberta"):
        self.embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        self.vector_store = InMemoryVectorStore(
            embedding=self.embeddings
        )
    def get_embeddings(self):
        return self.embeddings
    def get_vector_store(self):
        return self.vector_store

class MemoryTools:
    def __init__(self, vector_store):
        self.vector_store = vector_store

        # 1. docstring 방식
        self.save_recall_memory_tool = tool(self._save_recall_memory_with_doc)
        self.search_recall_memories_tool = tool(self._search_recall_memories_with_doc)

        # 2. description 직접 지정 방식
        self.save_recall_memory_tool2 = StructuredTool.from_function(
            func=self._save_recall_memory_no_doc,
            name="save_recall_memory",
            description="Save user's long-term memory to vector storage."
        )
        self.search_recall_memories_tool2 = StructuredTool.from_function(
            func=self._search_recall_memories_no_doc,
            name="search_recall_memories",
            description="Search memories by semantic similarity."
        )

        # 둘 중 하나만 tools로 사용하세요 (아래는 docstring 방식)
        self.tools = [self.save_recall_memory_tool, self.search_recall_memories_tool]
        # self.tools = [self.save_recall_memory_tool2, self.search_recall_memories_tool2]

    def get_user_id(self, config: RunnableConfig) -> str:
        user_id = config["configurable"].get("user_id")
        if user_id is None:
            raise ValueError("User ID needs to be provided to save a memory.")
        return user_id

    # 1. docstring 방식 (영어, Google-style)
    def _save_recall_memory_with_doc(self, memory: str, config: RunnableConfig) -> str:
        """
        Save user's long-term memory to the vector store.

        Args:
            memory (str): The memory text to save.
            config (RunnableConfig): Configuration containing user_id.

        Returns:
            str: The saved memory text.
        """
        user_id = self.get_user_id(config)
        document = Document(
            page_content=memory,
            id=str(uuid.uuid4()),
            metadata={"user_id": user_id}
        )
        self.vector_store.add_documents([document])
        return memory

    def _search_recall_memories_with_doc(self, query: str, config: RunnableConfig) -> list:
        """
        Search stored memories by semantic similarity.

        Args:
            query (str): The search query.
            config (RunnableConfig): Configuration containing user_id.

        Returns:
            list: List of matched memory texts.
        """
        user_id = self.get_user_id(config)
        def _filter_function(doc: Document) -> bool:
            return doc.metadata.get("user_id") == user_id
        documents = self.vector_store.similarity_search(
            query, k=3, filter=_filter_function
        )
        return [document.page_content for document in documents]

    # 2. description 방식 (docstring 없이)
    def _save_recall_memory_no_doc(self, memory: str, config: RunnableConfig) -> str:
        user_id = self.get_user_id(config)
        document = Document(
            page_content=memory,
            id=str(uuid.uuid4()),
            metadata={"user_id": user_id}
        )
        self.vector_store.add_documents([document])
        return memory

    def _search_recall_memories_no_doc(self, query: str, config: RunnableConfig) -> list:
        user_id = self.get_user_id(config)
        def _filter_function(doc: Document) -> bool:
            return doc.metadata.get("user_id") == user_id
        documents = self.vector_store.similarity_search(
            query, k=3, filter=_filter_function
        )
        return [document.page_content for document in documents]

    def get_tools(self):
        return self.tools

class MySQLCheckpoint:
    """
    PyMySQL 커넥션을 명시적으로 열고 닫는 커스텀 체크포인터 예시.
    각 메서드 호출 시 새로운 커넥션을 생성하고 닫습니다.
    """
    def __init__(self, host, port, user, password, db, charset="utf8"):
        self.db_config = {
            "host": host,
            "port": port,
            "user": user,
            "password": password,
            "db": db,
            "charset": charset
        }
    
    def _get_connection(self):
        return pymysql.connect(**self.db_config)

    def get_tuple(self, config):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT messages, recall_memories FROM checkpoints WHERE user_id=%s", (config["configurable"]["user_id"],))
                row = cursor.fetchone()
                if row:
                    # LangChain 메시지 객체로 역직렬화
                    messages_data = json.loads(row[0])
                    messages = []
                    for msg in messages_data:
                        if msg["type"] == "human":
                            messages.append(HumanMessage(content=msg["content"]))
                        elif msg["type"] == "ai":
                            messages.append(AIMessage(content=msg["content"]))
                    recall_memories = json.loads(row[1])
                    return {"messages": messages, "recall_memories": recall_memories}
                else:
                    return {"messages": [], "recall_memories": []}
        finally:
            conn.close()

    def save_tuple(self, config, messages: List[Any], recall_memories: List[str]):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # LangChain 메시지 객체를 직렬화 가능한 형태로 변환
                serializable_messages = []
                for msg in messages:
                    if isinstance(msg, HumanMessage):
                        serializable_messages.append({"type": "human", "content": msg.content})
                    elif isinstance(msg, AIMessage):
                        serializable_messages.append({"type": "ai", "content": msg.content})
                    else:
                        # 다른 타입의 메시지가 있다면, 적절히 처리하거나 에러를 발생시킬 수 있습니다.
                        # 여기서는 단순히 문자열로 변환합니다.
                        serializable_messages.append({"type": "unknown", "content": str(msg)})

                cursor.execute(
                    "REPLACE INTO checkpoints (user_id, messages, recall_memories) VALUES (%s, %s, %s)",
                    (
                        config["configurable"]["user_id"],
                        json.dumps(serializable_messages),
                        json.dumps(recall_memories),
                    ),
                )
            conn.commit()
        finally:
            conn.close()

class MemoryAgent:
    def __init__(self, model_name: str = "qwen2.5", tokenizer_name: str = "BM-K/KoSimCSE-roberta"):
        self.model = ChatOllama(model=model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
        self.prompt = self._create_prompt()
        self.tools = None 
        self.model_with_tools = None
    def _create_prompt(self) -> ChatPromptTemplate:
        return ChatPromptTemplate.from_messages([
            (
                "system",
                "당신은 고급 장기 기억력을 가진 유용한 조수입니다."
                " 기능. 한국어를 이해하는 LLM으로 구동되므로 답변은 한국어로 해야 합니다.."
                " 대화 사이의 정보를 저장하는 외장 메모리가 있습니다."
                " 사용 가능한 메모리 도구를 사용하여 저장하고 검색하세요"
                " 사용자의 주의를 기울이는 데 도움이 되는 중요한 세부 사항"
                "메모리 사용 지침:\n"
                "1. 메모리 도구(save_recall_memory)를 적극적으로 사용하세요."
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
                "7. 기억을 사용하여 필요를 예측하고 이에 대한 응답을 맞춤화하세요."
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
        self.tools = tools
        self.model_with_tools = self.model.bind_tools(tools)
        return self.model_with_tools
    def agent(self, state: State) -> State:
        bound = self.prompt | self.model_with_tools
        recall_str = (
            "<recall_memory>\n" + "\n".join(state.recall_memories) + "\n</recall_memory>"
        )
        prediction = bound.invoke(
            {
                "messages": state.messages,
                "recall_memories": recall_str,
            }
        )
        return State(messages=[prediction], recall_memories=state.recall_memories)
    def load_memories(self, state: State, config: RunnableConfig) -> State:
        if not self.tools:
            raise ValueError("Tools have not been set up. Call setup_model_with_tools first.")
        convo_str = get_buffer_string(state.messages)
        tokens = self.tokenizer(convo_str, truncation=True, max_length=2048)
        truncated_text = self.tokenizer.decode(tokens['input_ids'])
        recall_memories = self.tools[1].invoke(truncated_text, config=config)
        return State(messages=state.messages, recall_memories=recall_memories)
    def route_tools(self, state: State) -> Literal["tools", END]:
        msg = state.messages[-1]
        if getattr(msg, "tool_calls", None):
            return "tools"
        return END

router = APIRouter()
prompt_extraction = PromptExtraction()

def search_web_duckduckgo(query: str):
    with DDGS() as ddgs:
        results = ddgs.text(query, region='kr-kr', max_results=3)
        return list(results)

def summarize_body(body: str, max_len=150) -> str:
    body = body.strip().replace("\n", " ")
    if len(body) > max_len:
        return body[:max_len].rstrip() + "..."
    return body

def clean_korean_only(text: str) -> str:
    return re.sub(r"[^가-힣a-zA-Z0-9\s.,!?~\-]", "", text)

def classify_question_mode(question: str) -> str:
    keywords = ["유사 사업", "인터넷에서 찾아", "웹 검색", "검색","검색해줘"]
    if any(k in question.lower() for k in keywords):
        return "web_search"
    return "document"

embedding_manager = EmbeddingManager()
memory_tools = MemoryTools(embedding_manager.get_vector_store())
memory_agent = MemoryAgent()
memory_agent.setup_model_with_tools(memory_tools.get_tools())

def get_from_state(state, key, default):
    if hasattr(state, key):
        return getattr(state, key, default)
    elif isinstance(state, dict) and key in state:
        return state[key]
    elif hasattr(state, "values") and key in state.values:
        return state.values.get(key, default)
    return default

@router.post("/ask")
async def ask(
    request: Request,
    question: str = Form(...),
    files: List[UploadFile] = File(None)
):
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header is required.")

    mode = classify_question_mode(question)
    config = {"configurable": {"user_id": user_id, "thread_id": user_id}}

    # MySQLCheckpoint 인스턴스를 요청마다 생성하여 연결을 명시적으로 관리
    checkpoint = MySQLCheckpoint(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
        charset=DB_CHARSET
    )
    
    current_state_from_checkpoint = checkpoint.get_tuple(config)
    current_messages = current_state_from_checkpoint.get("messages", [])
    current_recall_memories = current_state_from_checkpoint.get("recall_memories", [])

    # Ensure current_messages is a list and append the new HumanMessage
    current_messages = list(current_messages)
    current_messages.append(HumanMessage(content=question))

    if files:
        document_texts = []
        filenames = []
        for file in files[:5]:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name
            pdf_extraction = PDFExtraction(tmp_path)
            pages = pdf_extraction.extract_text()
            os.remove(tmp_path) 
            text = "\n\n".join([p['text'] for p in pages])
            document_texts.append((file.filename, text))
            filenames.append(file.filename)

        if mode == "web_search":
            first_text = document_texts[0][1]
            keyword_prompt = prompt_extraction.make_keyword_extraction_prompt(first_text)
            ollama_extract_keywords = OllamaHosting("qwen2.5", keyword_prompt)
            search_query = ollama_extract_keywords.get_model_response().strip()

            results = search_web_duckduckgo(search_query)
            results_text = "\n\n".join(
                [
                    f"제목: {res.get('title', '(제목없음)')}\n"
                    f"내용: {summarize_body(res.get('body', ''))}\n"
                    f"사이트 주소: {res.get('href', '(주소없음)')}"
                    for res in results
                ]
            )

            # 웹 검색 결과는 DB에 저장하지 않는 것으로 판단하여, 이전 메시지만 저장
            checkpoint.save_tuple(config, current_messages, current_recall_memories)
            return {
                "answer": f"문서를 기반으로 유사 사업을 검색한 결과입니다 (검색어: {search_query}):\n\n{results_text}",
                "evaluation_criteria": "해당 모드에서는 평가 기준 추출이 제공되지 않습니다."
            }

        answers = []
        evaluation_criteria = None
        for filename, text in document_texts:
            if evaluation_criteria is None:
                criteria_prompt = prompt_extraction.make_prompt_to_extract_criteria(text)
                criteria_ollama = OllamaHosting("qwen2.5", criteria_prompt)
                evaluation_criteria = criteria_ollama.get_model_response().strip()

            qa_prompt = prompt_extraction.make_prompt_to_query_document(text, question)
            qa_ollama = OllamaHosting("qwen2.5", qa_prompt)
            answer = qa_ollama.get_model_response().strip()
            answers.append(f" **{filename}** 에서의 응답:\n{answer}")

        agent_response_content = "\n\n---\n\n".join(answers)
        checkpoint.save_tuple(config, current_messages, current_recall_memories)
        return {
            "answer": agent_response_content,
            "evaluation_criteria": evaluation_criteria
        }

    elif mode == "web_search":
        search_query = question.strip()
        results = search_web_duckduckgo(search_query)
        results_text = "\n\n".join(
            [
                f"제목: {res.get('title','(제목없음)')}\n"
                f"내용: {summarize_body(res.get('body',''))}\n"
                f"사이트 주소: {res.get('href','(주소없음)')}"
                for res in results
            ]
        )
        checkpoint.save_tuple(config, current_messages, current_recall_memories)
        return {
            "answer": f"인터넷에서 '{search_query}' 관련 정보를 검색한 결과입니다:\n\n{results_text}",
            "evaluation_criteria": "해당 모드에서는 평가 기준 추출이 제공되지 않습니다."
        }

    else:
        # 일반 대화 모드
        agent_state = State(messages=current_messages, recall_memories=current_recall_memories)
        agent_response = memory_agent.agent(agent_state)
        
        # agent_response에서 AIMessage 객체만 추출하여 저장
        messages_to_save = [msg for msg in agent_response.messages if isinstance(msg, (AIMessage, HumanMessage))]
        
        checkpoint.save_tuple(config, messages_to_save, agent_response.recall_memories)
        
        messages = get_from_state(agent_response, "messages", [])
        if not messages:
            raise RuntimeError("No messages found in final_state")
        
        agent_response_message = messages[-1]
        agent_response_content = getattr(agent_response_message, "content", str(agent_response_message))
        
        return {
            "answer": agent_response_content,
            "evaluation_criteria": "기억 기반 응답 모드입니다. 평가 기준은 제공되지 않습니다."
        }


@router.post("/transcribe_audio")
async def transcribe_audio(file: UploadFile = File(...)):
    import whisperx
    import tempfile
    import os
    import ollama

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")

    asr_result = model.transcribe(audio_path)
    os.remove(audio_path)

    raw_transcript = " ".join([
        seg["text"].strip()
        for seg in asr_result["segments"]
        if seg.get("language", "ko") == "ko"
    ])

    prompt = prompt_extraction.make_light_cleaning_prompt(raw_transcript)
    response = ollama.generate(model="qwen2.5", prompt=prompt)
    lightly_cleaned = response["response"]

    return {"transcription": lightly_cleaned}

from pydantic import BaseModel

class TextRequest(BaseModel):
    text: str

@router.post("/summarize_text")
async def summarize_text(request: TextRequest):
    import ollama

    prompt = prompt_extraction.make_prompt(request.text)
    response = ollama.generate(model='qwen2.5', prompt=prompt)

    summary_raw = response["response"]
    summary_clean = clean_korean_only(summary_raw)

    return {"summary": summary_clean}


@router.post("/upload_audio")
async def upload_audio(file: UploadFile = File(...)):
    # 1. 파일 저장
    save_path = f"./call_data/{file.filename}"
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    # 2. WhisperX + LLM Q&A 추출
    # (아래 함수는 기존 distinct_speaker_audio 코드 활용)
    qna_data = await process_audio_and_extract_qna(save_path)
    return JSONResponse(content={"qna": qna_data})

# 기존 distinct_speaker_audio 코드에서 실제 Q&A 추출 부분만 함수로 분리
import whisperx, json

async def process_audio_and_extract_qna(audio_path):
    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")
    asr_result = model.transcribe(audio_path)

    transcript = " ".join([
        seg["text"].strip()
        for seg in asr_result["segments"]
        if seg.get("language", "ko") == "ko"
    ])

    # 4. LLM 프롬프트 구성
    prompt = prompt_extraction.make_audio_transcription_prompt(transcript)

    # Ollama Qwen2.5 모델로 Q&A 분리 요청
    import ollama
    try:
        response = ollama.generate(
            model="qwen2.5",
            prompt=prompt
        )
        result_text = response['response'].strip()
        try:
            qna_data = json.loads(result_text)
        except json.JSONDecodeError:
            qna_data = []
            lines = result_text.splitlines()
            for i in range(0, len(lines), 2):
                if i+1 < len(lines):
                    question = lines[i].replace("질문:", "").strip()
                    answer = lines[i+1].replace("답변:", "").strip()
                    qna_data.append({"question": question, "answer": answer})
        return qna_data
    except Exception as e:
        return [{"question": "Error", "answer": str(e)}]

# @router.post("/distinct_speaker_audio")
# async def distinct_speaker_audio():
#     # 1. 오디오 파일 경로
#     audio_path = "./call_data/05.mp3"

#     # 2. WhisperX 모델 로드 및 전사
#     device = "cpu"
#     language = "ko"
#     model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")
#     asr_result = model.transcribe(audio_path)

#     # 3. 한국어 전사 텍스트 추출
#     transcript = " ".join([
#         seg["text"].strip()
#         for seg in asr_result["segments"]
#         if seg.get("language", "ko") == "ko"
#     ])

#     # 4. LLM 프롬프트 구성
#     prompt = f"""
# 반드시 한국어로 대답하세요.    
# 다음 텍스트는 민원 전화 상담 내용을 전사한 것입니다. 질문과 답변을 구분해 JSON 배열 형태로 만들어 주세요.
# 반드시 JSON 형식만 출력해 주세요.

# 형식:
# [
#   {{ "question": "질문 내용", "answer": "답변 내용" }},
#   ...
# ]

# 텍스트:
# \"\"\"{transcript}\"\"\"
# """

#     # 5. Ollama Qwen2.5 모델로 Q&A 분리 요청
#     try:
#         response = ollama.generate(
#             model="qwen2.5",
#             prompt=prompt
#         )
#         result_text = response['response'].strip()

#         # 6. JSON 파싱 시도
#         try:
#             qna_data = json.loads(result_text)
#         except json.JSONDecodeError:
#             # JSON 파싱 실패 시, fallback: 단순 텍스트 파싱 (질문/답변 구분)
#             qna_data = []
#             lines = result_text.splitlines()
#             for i in range(0, len(lines), 2):
#                 if i+1 < len(lines):
#                     question = lines[i].replace("질문:", "").strip()
#                     answer = lines[i+1].replace("답변:", "").strip()
#                     qna_data.append({"question": question, "answer": answer})

#         return JSONResponse(content={"qna": qna_data})

#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)


class QuestionInput(BaseModel):
    question: str
@router.post("/ask_query")
async def ask_query(input: QuestionInput):
    query = input.question
    raw_results = load_qdrant_db(query)

    if isinstance(raw_results, str):
        raw_results = [raw_results]

    context_text = "\n\n".join([r for r in raw_results if isinstance(r, str) and r.strip()])

    if not context_text or len(context_text) < 30:
        prompt = prompt_extraction.make_fallback_prompt(query)
    else:
        prompt = prompt_extraction.make_contextual_prompt(query, context_text)

    ollama = OllamaHosting(model="qwen2.5", prompt=prompt)
    final_answer = ollama.get_model_response().strip()

    return {"answer": final_answer}



### uvicorn main:app --reload
 