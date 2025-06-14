from typing import List, Literal, Any
from langchain_core.messages import get_buffer_string, AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from langchain_ollama import ChatOllama
from langgraph.graph import END
from transformers import AutoTokenizer
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.documents import Document
from langchain_core.tools import tool, StructuredTool
from ollama_load.ollama_hosting import OllamaHosting
from duckduckgo_search import DDGS
from pydub import AudioSegment
from datetime import datetime
from types import SimpleNamespace
from pydantic import BaseModel
from extraction.prompt_extraction import PromptExtraction
import whisperx
import json
import uuid
import pymysql
import re
import torch
import ollama

prompt_extraction = PromptExtraction()


class State(BaseModel):
    messages: List[Any] = []
    recall_memories: List[str] = []


class TextRequest(BaseModel):
    text: str


class QuestionInput(BaseModel):
    question: str


class EmbeddingManager:
    def __init__(self, model_name: str = "BM-K/KoSimCSE-roberta"):
        self.embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        self.vector_store = InMemoryVectorStore(embedding=self.embeddings)

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
            description="Save user's long-term memory to vector storage.",
        )
        self.search_recall_memories_tool2 = StructuredTool.from_function(
            func=self._search_recall_memories_no_doc,
            name="search_recall_memories",
            description="Search memories by semantic similarity.",
        )

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
            page_content=memory, id=str(uuid.uuid4()), metadata={"user_id": user_id}
        )
        self.vector_store.add_documents([document])
        return memory

    def _search_recall_memories_with_doc(
        self, query: str, config: RunnableConfig
    ) -> list:
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

    def _save_recall_memory_no_doc(self, memory: str, config: RunnableConfig) -> str:
        user_id = self.get_user_id(config)
        document = Document(
            page_content=memory, id=str(uuid.uuid4()), metadata={"user_id": user_id}
        )
        self.vector_store.add_documents([document])
        return memory

    def _search_recall_memories_no_doc(
        self, query: str, config: RunnableConfig
    ) -> list:
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
            "charset": charset,
        }

    def _get_connection(self):
        return pymysql.connect(**self.db_config)

    def is_chat_owner(self, chat_no: int, emp_code: str) -> bool:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT 1
                    FROM chat_mate m
                    JOIN employee e ON m.emp_no = e.emp_no
                    WHERE m.chat_no = %s AND e.emp_code = %s
                """,
                    (chat_no, emp_code),
                )
                return cursor.fetchone() is not None
        finally:
            conn.close()

    def get_tuple(self, config):
        if config["configurable"].get("new_chat"):
            return {"messages": [], "recall_memories": []}

        emp_code = config["configurable"]["user_id"]
        chat_no = config["configurable"].get("chat_no")

        conn = self._get_connection()

        if not chat_no:
            return {"messages": [], "recall_memories": []}

        try:
            with conn.cursor() as cursor:
                # chat_no 유효성 확인
                if not self.is_chat_owner(chat_no, emp_code):
                    raise ValueError("권한이 없는 채팅방입니다.")

                # 메시지 조회
                cursor.execute(
                    """
                    SELECT log_text, log_speaker_sn
                    FROM chat_log
                    WHERE chat_no = %s
                    ORDER BY log_create_dt
                """,
                    (chat_no,),
                )
                rows = cursor.fetchall()

                messages = [
                    (
                        HumanMessage(content=log)
                        if speaker == 1
                        else AIMessage(content=log)
                    )
                    for log, speaker in rows
                ]
                return {"messages": messages, "recall_memories": []}
        finally:
            conn.close()

    def save_tuple(self, config, messages: List[Any], recall_memories: List[str]):
        emp_code = config["configurable"]["user_id"]
        force_new_chat = config["configurable"].get("new_chat", False)
        chat_no = config["configurable"].get("chat_no")

        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # chat_no 유효성 검증
                if chat_no and not self.is_chat_owner(chat_no, emp_code):
                    raise ValueError("권한이 없는 채팅방입니다.")

                # chat_no가 없으면 가장 최근 것을 찾거나 새로 생성
                if not chat_no:
                    first_two = messages[:2]
                    user_msg = (
                        first_two[0].content
                        if len(first_two) > 0 and isinstance(first_two[0], HumanMessage)
                        else ""
                    )
                    bot_msg = (
                        first_two[1].content
                        if len(first_two) > 1 and isinstance(first_two[1], AIMessage)
                        else ""
                    )
                    title_prompt = prompt_extraction.make_chat_title_prompt(
                        user_msg, bot_msg
                    )
                    try:
                        title = (
                            OllamaHosting("qwen2.5", title_prompt)
                            .get_model_response()
                            .strip()
                        )
                        print("=> 생성된 제목:", title)
                    except Exception as e:
                        print("=> 제목 생성 실패:", e)
                        title = f"대화 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                    cursor.execute(
                        """
                    INSERT INTO chat_mate (emp_no, chat_title)
                    SELECT emp_no, %s FROM employee WHERE emp_code = %s
                    """,
                        (title, emp_code),
                    )
                    chat_no = cursor.lastrowid

                # 저장된 메시지 이후만 저장
                cursor.execute(
                    "SELECT COUNT(*) FROM chat_log WHERE chat_no = %s", (chat_no,)
                )
                saved_count = cursor.fetchone()[0]
                new_messages = messages[saved_count:]

                for msg in new_messages:
                    if isinstance(msg, HumanMessage):
                        speaker_sn = 1
                    elif isinstance(msg, AIMessage):
                        speaker_sn = 2
                    elif isinstance(msg, dict):
                        if msg.get("sender") == "user":
                            speaker_sn = 1
                        elif msg.get("sender") == "bot":
                            speaker_sn = 2
                        else:
                            continue
                        msg = SimpleNamespace(content=msg.get("text", ""))
                    else:
                        continue

                    cursor.execute(
                        """
                        INSERT INTO chat_log (chat_no, log_text, log_speaker_sn, log_create_dt)
                        VALUES (%s, %s, %s, NOW())
                    """,
                        (chat_no, msg.content, speaker_sn),
                    )
            conn.commit()
            return chat_no
        finally:
            conn.close()

    def get_chat_list(self, emp_code):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT chat_no, chat_title, DATE_FORMAT(chat_create_dt, '%%Y.%%m.%%d') as chat_create_dt
                    FROM chat_mate
                    WHERE emp_no = (SELECT emp_no FROM employee WHERE emp_code = %s)
                    ORDER BY chat_create_dt DESC
                """,
                    (emp_code,),
                )
                rows = cursor.fetchall()
                return [
                    {"chat_no": row[0], "chat_title": row[1], "chat_create_dt": row[2]}
                    for row in rows
                ]
        finally:
            conn.close()

    def get_chat_log(self, chat_no):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT log_text, log_speaker_sn
                    FROM chat_log
                    WHERE chat_no = %s
                    ORDER BY log_create_dt
                """,
                    (chat_no,),
                )
                rows = cursor.fetchall()

                return [
                    {"text": row[0], "sender": "user" if row[1] == 1 else "bot"}
                    for row in rows
                ]
        finally:
            conn.close()


class MemoryAgent:
    def __init__(
        self, model_name: str = "qwen2.5", tokenizer_name: str = "BM-K/KoSimCSE-roberta"
    ):
        self.model = ChatOllama(model=model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
        self.prompt = self._create_prompt()
        self.tools = None
        self.model_with_tools = None

    def _create_prompt(self) -> ChatPromptTemplate:
        return ChatPromptTemplate.from_messages(
            [
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
            ]
        )

    def set_prompt(self, system_template: str):
        self.prompt = ChatPromptTemplate.from_messages(
            [("system", system_template), ("placeholder", "{messages}")]
        )

    def setup_model_with_tools(self, tools):
        self.tools = tools
        self.model_with_tools = self.model.bind_tools(tools)
        return self.model_with_tools

    def agent(self, state: State) -> State:
        bound = self.prompt | self.model_with_tools
        recall_str = (
            "<recall_memory>\n"
            + "\n".join(state.recall_memories)
            + "\n</recall_memory>"
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
            raise ValueError(
                "Tools have not been set up. Call setup_model_with_tools first."
            )
        convo_str = get_buffer_string(state.messages)
        tokens = self.tokenizer(convo_str, truncation=True, max_length=2048)
        truncated_text = self.tokenizer.decode(tokens["input_ids"])
        recall_memories = self.tools[1].invoke(truncated_text, config=config)
        return State(messages=state.messages, recall_memories=recall_memories)

    def route_tools(self, state: State) -> Literal["tools", END]:
        msg = state.messages[-1]
        if getattr(msg, "tool_calls", None):
            return "tools"
        return END


def search_web_duckduckgo(query: str):
    with DDGS() as ddgs:
        results = ddgs.text(query, region="kr-kr", max_results=3)
        return list(results)


def summarize_body(body: str, max_len=150) -> str:
    body = body.strip().replace("\n", " ")
    if len(body) > max_len:
        return body[:max_len].rstrip() + "..."
    return body


def clean_korean_only(text: str) -> str:
    return re.sub(r"[^가-힣a-zA-Z0-9\s.,!?~\-]", "", text)


def classify_question_mode(question: str) -> str:
    keywords = ["유사 사업", "인터넷에서 찾아", "웹 검색", "검색", "검색해줘"]
    if any(k in question.lower() for k in keywords):
        return "web_search"
    return "document"


def split_audio(file_path, chunk_length_ms=30000):
    audio = AudioSegment.from_file(file_path)
    chunks = []
    for i in range(0, len(audio), chunk_length_ms):
        end = i + chunk_length_ms
        if end > len(audio):
            end = len(audio)
        chunk = audio[i:end]
        chunks.append(chunk)
    return chunks


async def transcribe_chunk(chunk_file, model):
    try:
        asr_result = model.transcribe(chunk_file)
        chunk_text = " ".join(
            [
                seg["text"].strip()
                for seg in asr_result["segments"]
                if seg.get("language", "ko") == "ko"
            ]
        )
        return chunk_text
    except Exception as e:
        print(f"Chunk transcribe error: {e}")
        return "[전사 실패]"


# 받아온 음성 파일을 바탕으로 Q&A 추출
async def process_audio_and_extract_qna(audio_path):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    language = "ko"
    model = whisperx.load_model(
        "medium",
        device=device,
        language=language,
        compute_type="int8",
        vad_method="silero",
    )
    asr_result = model.transcribe(audio_path)

    transcript = " ".join(
        [
            seg["text"].strip()
            for seg in asr_result["segments"]
            if seg.get("language", "ko") == "ko"
        ]
    )

    # 4. LLM 프롬프트 구성
    prompt = prompt_extraction.make_audio_transcription_prompt(transcript)

    # Ollama Qwen2.5 모델로 Q&A 분리 요청
    import ollama

    try:
        response = ollama.generate(model="qwen2.5", prompt=prompt)
        result_text = response["response"].strip()
        try:
            qna_data = json.loads(result_text)
        except json.JSONDecodeError:
            qna_data = []
            lines = result_text.splitlines()
            for i in range(0, len(lines), 2):
                if i + 1 < len(lines):
                    question = lines[i].replace("질문:", "").strip()
                    answer = lines[i + 1].replace("답변:", "").strip()
                    qna_data.append({"question": question, "answer": answer})
        return qna_data
    except Exception as e:
        return [{"question": "Error", "answer": str(e)}]


def feedback_model(qna_data):
    print(qna_data)
    model = ChatOllama(model="qwen2.5")
    prompt = prompt_extraction.make_feedback_prompt(qna_data)
    response = model.invoke(prompt)

    # 응답을 개별 피드백으로 분리하고 빈 문자열 제거
    feedbacks = [f.strip() for f in response.content.strip().split("\n") if f.strip()]

    # 따옴표 제거 및 정리
    feedbacks = [f.strip("\"'") for f in feedbacks]

    # 빈 문자열이 아닌 피드백만 필터링
    feedbacks = [f for f in feedbacks if f]
    print(feedbacks)

    return feedbacks


def get_from_state(state, key, default):
    if hasattr(state, key):
        return getattr(state, key, default)
    elif isinstance(state, dict) and key in state:
        return state[key]
    elif hasattr(state, "values") and key in state.values:
        return state.values.get(key, default)
    return default
