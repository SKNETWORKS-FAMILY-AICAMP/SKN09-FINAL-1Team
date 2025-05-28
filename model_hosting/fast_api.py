from fastapi import File, UploadFile, Form, APIRouter, Request
from typing import List, Optional
import tempfile
import os
import re
from duckduckgo_search import DDGS  
from pydantic import BaseModel
from extraction.pdf_extraction import PDFExtraction
from extraction.prompt_extraciont import PromptExtraction
from ollama_load.ollama_hosting import OllamaHosting
from data_loader.qdrant_loader import load_qdrant_db

router = APIRouter()
prompt_extraction = PromptExtraction()

def clean_korean_only(text: str) -> str:
    return re.sub(r"[^\uAC00-\uD7A3\u3131-\u318E\s0-9.,!?~\-]", "", text)

def classify_question_mode(question: str) -> str:
    keywords = ["유사 사업", "인터넷에서 찾아", "웹 검색", "검색","검색해줘"]
    if any(k in question.lower() for k in keywords):
        return "web_search"
    return "document"

# DuckDuckGo 웹 검색 함수
def search_web_duckduckgo(query: str):
    with DDGS() as ddgs:
        results = ddgs.text(query, region='kr-kr', max_results=3)
        return list(results)

# 검색 결과 본문 길이 줄이기용 간단 함수
def summarize_body(body: str, max_len=150) -> str:
    body = body.strip().replace("\n", " ")
    if len(body) > max_len:
        return body[:max_len].rstrip() + "..."
    return body
@router.post("/ask")
async def ask(
    question: str = Form(...),
    files: List[UploadFile] = File(None)
):
    mode = classify_question_mode(question)

    if files:
        document_texts = []
        filenames = []

        for file in files[:5]:  # 최대 5개 처리
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name

            pdf_extraction = PDFExtraction(tmp_path)
            pages = pdf_extraction.extract_text()
            os.remove(tmp_path)

            text = "\n\n".join([p['text'] for p in pages])
            document_texts.append((file.filename, text))
            filenames.append(file.filename)

        # 웹 검색 모드: 첫 번째 파일 기준으로 검색어 추출
        if mode == "web_search":
            first_text = document_texts[0][1]
            keyword_prompt = f"""
반드시 한국어로 대답하세요.
다음은 어떤 사업 계획 문서의 내용입니다. 이 사업과 유사한 사업들을 찾고자 합니다.
핵심 키워드, 산업 분야, 목적을 1~2줄로 요약해 주세요.

문서 내용:
{first_text}
"""
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

            return {
                "answer": f"문서를 기반으로 유사 사업을 검색한 결과입니다 (검색어: {search_query}):\n\n{results_text}",
                "evaluation_criteria": "해당 모드에서는 평가 기준 추출이 제공되지 않습니다."
            }

        # 일반 문서 질의 응답 모드
        answers = []
        evaluation_criteria = None

        for filename, text in document_texts:
            # 한 번만 추출
            if evaluation_criteria is None:
                criteria_prompt = prompt_extraction.make_prompt_to_extract_criteria(text)
                criteria_ollama = OllamaHosting("qwen2.5", criteria_prompt)
                evaluation_criteria = criteria_ollama.get_model_response().strip()

            qa_prompt = prompt_extraction.make_prompt_to_query_document(text, question)
            qa_ollama = OllamaHosting("qwen2.5", qa_prompt)
            answer = qa_ollama.get_model_response().strip()

            answers.append(f" **{filename}** 에서의 응답:\n{answer}")

        return {
            "answer": "\n\n---\n\n".join(answers),
            "evaluation_criteria": evaluation_criteria
        }

    # 문서 없음 + 웹 검색
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

        return {
            "answer": f"인터넷에서 '{search_query}' 관련 정보를 검색한 결과입니다:\n\n{results_text}",
            "evaluation_criteria": "해당 모드에서는 평가 기준 추출이 제공되지 않습니다."
        }

    # 문서 없음 + 일반 질문
    else:
        general_prompt = f"""
반드시 한국어로 대답하세요.       
다음은 사용자의 질문입니다. 아래 질문에 대해 가능한 사실에 기반해 간결하고 정확한 답변을 제공해 주세요.

질문: {question}
"""
        ollama_general = OllamaHosting("qwen2.5", general_prompt)
        response = ollama_general.get_model_response().strip()

        return {
            "answer": response,
            "evaluation_criteria": "이 모드에서는 평가 기준이 필요하지 않습니다."
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

    def make_light_cleaning_prompt(text: str) -> str:
        return f"""
반드시 한국어로 대답하세요.        
다음 텍스트는 회의 음성을 텍스트로 전사한 초안입니다. 이 텍스트에는 말의 흐름, 반복, 비문, 맞춤법 오류 등이 있을 수 있습니다.

당신의 임무는 **내용이나 어순을 바꾸지 말고**, 단지 **띄어쓰기, 맞춤법, 문장 부호 등 최소한의 정리**만 하여 **사실성을 유지한 원문 기록**을 제공하는 것입니다.

## 지침:
- 반드시 한국어로 대답하세요.
- 문장의 흐름과 구조는 변경하지 마십시오.
- 의미 왜곡이 발생할 수 있는 표현 수정은 하지 마십시오.
- 단지 띄어쓰기, 맞춤법, 오타, 문장 부호만 다듬으십시오.
- 고유명사, 인물명, 발언 순서 등은 그대로 두십시오.
- 텍스트는 반드시 순수한 한국어로 작성하십시오.

---
반드시 한국어로 대답하세요.
아래 전사된 텍스트를 가볍게 정리하십시오:

{text}
"""

    prompt = make_light_cleaning_prompt(raw_transcript)
    response = ollama.generate(model="qwen2.5", prompt=prompt)
    lightly_cleaned = response["response"]

    return {"transcription": lightly_cleaned}

from pydantic import BaseModel

class TextRequest(BaseModel):
    text: str

@router.post("/summarize_text")
async def summarize_text(request: TextRequest):
    import ollama

    def make_prompt(transcribed_text):
        return f"""
반드시 한국어로 대답하세요.        
다음은 음성에서 텍스트로 변환된 원문입니다. 이 텍스트는 말의 흐름에 따라 작성되어 있으며, 반복, 군더더기, 비문 등이 포함되어 있을 수 있습니다.

당신의 임무는 이 텍스트를 이해하기 쉬운 요약문으로 정리하는 것입니다.

## 지침:
- 반드시 한국어로 대답하세요.
- 핵심 내용을 파악하고 요점을 간결하게 정리하십시오.
- 말투나 반복, 불필요한 감탄사 등은 제거하십시오.
- 정제된 서면 문장 형태로 작성하십시오.
- 원문의 흐름을 보존하되, 문맥이 자연스럽고 명확하도록 재구성하십시오.
- 문체는 뉴스 기사나 공식 보고서처럼 객관적이고 깔끔하게 유지하십시오.
- 요약문은 반드시 **순수한 한국어로만 작성**하십시오. 중국어, 영어, 한자는 절대로 포함하지 마십시오.
- 회의록 작성 목적이므로 다음의 항목에 따라 구조화하십시오:

[회의 개요]
- 일자:
- 주최자:
- 참석자:
- 회의 주제:

[주요 논의 사항]
- 

[핵심 키워드]
- 

[주요 결정 사항]
- 

[액션 아이템]
- 

[향후 일정]
- 

[회의 내용 요약]
- 반드시 한국어로 대답하세요.
- 위 형식에 맞게 내용을 구성하되, 실제 내용이 없을 경우 항목을 비워두십시오.
- 문장은 짧고 명확하게 작성하십시오.

---

이제 아래 텍스트를 회의록 형태로 요약하십시오:

{transcribed_text}
"""

    prompt = make_prompt(request.text)
    response = ollama.generate(model='qwen2.5', prompt=prompt)

    summary_raw = response["response"]
    summary_clean = clean_korean_only(summary_raw)

    return {"summary": summary_clean}

from fastapi.responses import JSONResponse
import whisperx
import ollama
import json

# router = APIRouter()

@router.post("/distinct_speaker_audio")
async def distinct_speaker_audio():
    # 1. 오디오 파일 경로
    audio_path = "./call_data/05.mp3"

    # 2. WhisperX 모델 로드 및 전사
    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")
    asr_result = model.transcribe(audio_path)

    # 3. 한국어 전사 텍스트 추출
    transcript = " ".join([
        seg["text"].strip()
        for seg in asr_result["segments"]
        if seg.get("language", "ko") == "ko"
    ])

    # 4. LLM 프롬프트 구성
    prompt = f"""
반드시 한국어로 대답하세요.    
다음 텍스트는 민원 전화 상담 내용을 전사한 것입니다. 질문과 답변을 구분해 JSON 배열 형태로 만들어 주세요.
반드시 JSON 형식만 출력해 주세요.

형식:
[
  {{ "question": "질문 내용", "answer": "답변 내용" }},
  ...
]

텍스트:
\"\"\"{transcript}\"\"\"
"""

    # 5. Ollama Qwen2.5 모델로 Q&A 분리 요청
    try:
        response = ollama.generate(
            model="qwen2.5",
            prompt=prompt
        )
        result_text = response['response'].strip()

        # 6. JSON 파싱 시도
        try:
            qna_data = json.loads(result_text)
        except json.JSONDecodeError:
            # JSON 파싱 실패 시, fallback: 단순 텍스트 파싱 (질문/답변 구분)
            qna_data = []
            lines = result_text.splitlines()
            for i in range(0, len(lines), 2):
                if i+1 < len(lines):
                    question = lines[i].replace("질문:", "").strip()
                    answer = lines[i+1].replace("답변:", "").strip()
                    qna_data.append({"question": question, "answer": answer})

        return JSONResponse(content={"qna": qna_data})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


class QuestionInput(BaseModel):
    question: str

@router.post("/ask_query")
async def ask_query(input: QuestionInput):
    query = input.question

    # 1. Qdrant에서 관련 문서 검색
    raw_results = load_qdrant_db(query)

    # 문자열이면 리스트로 감싸기
    if isinstance(raw_results, str):
        raw_results = [raw_results]

    # 정제 전 결과 합치기 (여기선 모델이 직접 정제할 예정)
    context_text = "\n\n".join([r for r in raw_results if isinstance(r, str) and r.strip()])

    # 2. LLM을 통해 문단 정리 및 응답 생성
    if not context_text or len(context_text) < 30:
        # Qdrant 내용도 너무 부실할 경우 fallback
        prompt = f"""아래 질문에 대해 반드시 한국어로만 답변하세요. 
중국어, 영어, 일본어 등 다른 언어는 절대 사용하지 마세요. 
한국어 이외의 언어가 한 글자라도 포함되면 안 됩니다. 
민원 대응하듯이 정확하고 간결하게 답해 주세요.
데이터베이스에 유사한 내용을 찾아 설명하고, 관련 법령이 있다면 추가 정보로 제시하세요.

질문:
{query}

(반드시 한국어로만 답변하세요. 중국어, 영어, 일본어 등은 절대 사용하지 마세요. 한국어 이외의 언어가 한 글자라도 포함되면 안 됩니다.)
"""
    else:
        prompt = f"""아래는 '{query}'라는 질문에 대해 참고할 수 있는 여러 정보입니다:

{context_text}

위 정보를 바탕으로 반드시 한국어로만 답변하세요. 
중국어, 영어, 일본어 등 다른 언어는 절대 사용하지 마세요. 
한국어 이외의 언어가 한 글자라도 포함되면 안 됩니다. 
민원에 응답하듯 간결하고 이해하기 쉬운 답변을 작성하세요.

(반드시 한국어로만 답변하세요. 중국어, 영어, 일본어 등은 절대 사용하지 마세요. 한국어 이외의 언어가 한 글자라도 포함되면 안 됩니다.)
"""

    ollama = OllamaHosting(model="qwen2.5", prompt=prompt)
    final_answer = ollama.get_model_response().strip()

    return {"answer": final_answer}


# ### uvicorn main:app --reload
 