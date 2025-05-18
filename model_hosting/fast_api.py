from fastapi import File, UploadFile, Form, APIRouter
import tempfile
import os
import re

from extraction.pdf_extraction import PDFExtraction
from extraction.prompt_extraciont import PromptExtraction
from ollama_load.ollama_hosting import OllamaHosting
from data_loader.qdrant_loader import load_qdrant_db

router = APIRouter()
prompt_extraction = PromptExtraction()
def clean_korean_only(text: str) -> str:
    """
    결과 텍스트에서 한글, 숫자, 공백, 일부 구두점만 남기고 모두 제거
    """
    return re.sub(r"[^\uAC00-\uD7A3\u3131-\u318E\s0-9.,!?~\-]", "", text)


@router.post("/ask")
async def ask(
    question: str = Form(...),
    file: UploadFile = File(None)
):
    if file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        pdf_extraction = PDFExtraction(tmp_path)
        pages = pdf_extraction.extract_text()  # ✅ 수정된 부분
        document_text = "\n\n".join([p['text'] for p in pages])
        os.remove(tmp_path)

        prompt = prompt_extraction.make_prompt_to_query_mate(document_text, question)

    else:
        document_text = load_qdrant_db(question)
        prompt = prompt_extraction.make_prompt_to_rag(document_text, question)

    ollama_hosting = OllamaHosting('qwen2.5', prompt)
    response = ollama_hosting.get_model_response()
    
    return {"answer": response}

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
다음 텍스트는 회의 음성을 텍스트로 전사한 초안입니다. 이 텍스트에는 말의 흐름, 반복, 비문, 맞춤법 오류 등이 있을 수 있습니다.

당신의 임무는 **내용이나 어순을 바꾸지 말고**, 단지 **띄어쓰기, 맞춤법, 문장 부호 등 최소한의 정리**만 하여 **사실성을 유지한 원문 기록**을 제공하는 것입니다.

## 지침:
- 문장의 흐름과 구조는 변경하지 마십시오.
- 의미 왜곡이 발생할 수 있는 표현 수정은 하지 마십시오.
- 단지 띄어쓰기, 맞춤법, 오타, 문장 부호만 다듬으십시오.
- 고유명사, 인물명, 발언 순서 등은 그대로 두십시오.
- 텍스트는 반드시 순수한 한국어로 작성하십시오.

---

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
다음은 음성에서 텍스트로 변환된 원문입니다. 이 텍스트는 말의 흐름에 따라 작성되어 있으며, 반복, 군더더기, 비문 등이 포함되어 있을 수 있습니다.

당신의 임무는 이 텍스트를 이해하기 쉬운 요약문으로 정리하는 것입니다.

## 지침:

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

# uvicorn main:app --reload  cmd 창에서 실행
