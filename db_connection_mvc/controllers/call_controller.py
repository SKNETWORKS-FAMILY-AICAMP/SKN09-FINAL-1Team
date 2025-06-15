from fastapi import APIRouter, Request, Response, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, ValidationError
from datetime import date
from services.call_service import CallService
from typing import List, Dict, Any
import os
import shutil
import json


router = APIRouter()

call_service = CallService()

# 파일 저장 디렉토리 생성
UPLOAD_DIR = "/app/call_data/audios"  # 서버의 실제 경로


class CallData(BaseModel):
    file_name: str
    qna_list: List[Dict[str, Any]]


@router.post("/call/save_call_info")
async def save_call_info(
    request: Request,
    file: UploadFile = File(...),
    call_data: str = Form(...),  # Form 데이터로 받음
):
    try:
        # 세션에서 emp_no 가져오기
        employee = request.session.get("employee")
        if not employee:
            raise HTTPException(status_code=401, detail="로그인이 필요합니다.")

        emp_no = employee["emp_no"]

        # JSON 문자열을 파싱
        try:
            call_data_dict = json.loads(call_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=422, detail="Invalid JSON data")

        # 파일 저장
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            print(f"파일이 저장된 경로: {file_path}")  # 디버깅을 위한 로그
        except Exception as e:
            print(f"파일 저장 오류: {str(e)}")  # 디버깅을 위한 로그
            raise HTTPException(
                status_code=500, detail=f"파일 저장 중 오류 발생: {str(e)}"
            )

        # 서비스를 통해 데이터 저장
        result = await call_service.save_call_info(
            emp_no=emp_no,
            file_name=file.filename,
            qna_list=call_data_dict.get("qna_list", []),
        )

        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])

        return result
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        print(f"전체 프로세스 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/call_datas")
async def get_all_call_datas():
    result = await call_service.get_all_call_datas()
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    # 프론트에서 원하는 형식으로 변환
    formatted = [
        {
            "id": row.get("coun_no"),
            "question": row.get("coun_question"),
            "answer": row.get("coun_answer"),
            "date": (
                row.get("call_create_dt").strftime("%Y-%m-%d")
                if row.get("call_create_dt")
                else ""
            ),
            "tags": [],
            "feedback": row.get("coun_feedback"),
            "audioFileName": (
                row.get("call_path").split("/")[-1] if row.get("call_path") else ""
            ),
            "audioBlobUrl": None,
        }
        for row in result["data"]
    ]
    return formatted
