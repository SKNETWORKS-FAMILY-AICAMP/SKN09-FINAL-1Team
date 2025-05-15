from fastapi import  File, UploadFile, Form, APIRouter
import tempfile
import os

# 만든 파일 임포트
from extraction.pdf_extraction import PDFExtraction
from extraction.prompt_extraciont import PromptExtraction
from ollama_load.ollama_hosting import OllamaHosting

router = APIRouter()

@router.post("/ask")
async def ask(
    question: str = Form(...),
    file: UploadFile = File(None)
):
    # PDF 파일이 있으면 텍스트 추출
    if file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        pdf_extraction = PDFExtraction(tmp_path)
        pages = pdf_extraction.extract_text(tmp_path)
        # 여러 페이지면 합쳐서 사용 (길면 일부만 사용 권장)
        document_text = "\n\n".join([p['text'] for p in pages])
        os.remove(tmp_path)
    else:
        document_text = ""
    
    prompt_extraction = PromptExtraction()
    prompt = prompt_extraction.make_prompt_to_query_mate(document_text, question)
    
    ollama_hosting = OllamaHosting('qwen2.5',prompt)
    response = ollama_hosting.get_model_response()
    
    return {"answer": response}


# Woony Test Woony Test
# Woony Test Woony Test
# Woony Test Woony Test

@router.post("/summarize_audio")
async def summarize_audio(file: UploadFile = File(...)):
    import whisperx
    import ollama
    import tempfile
    import os

    # 파일 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    # WhisperX 로드
    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")

    # 음성 인식
    asr_result = model.transcribe(audio_path)
    os.remove(audio_path)

    result = " ".join([seg["text"].strip() for seg in asr_result["segments"]])

    # 프롬프트 생성
    def make_prompt(transcribed_text):
        return f"""
다음은 음성에서 텍스트로 변환된 원문입니다... (지침 생략)
{transcribed_text}
"""

    # Ollama 요약
    prompt = make_prompt(result)
    response = ollama.generate(model='qwen2.5', prompt=prompt)

    return {"summary": response["response"]}



# Woony Test Woony Test
# Woony Test Woony Test
# Woony Test Woony Test


# uvicorn main:app --reload  cmd 창에서 실행source final/bin/activate
