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
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "audios")
os.makedirs(UPLOAD_DIR, exist_ok=True)


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
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

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
        raise HTTPException(status_code=500, detail=str(e))
