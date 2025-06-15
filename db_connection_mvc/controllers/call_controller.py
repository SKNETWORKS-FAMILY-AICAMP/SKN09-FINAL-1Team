from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import BaseModel, ValidationError
from datetime import date
from services.call_service import CallService
from typing import List, Dict, Any


router = APIRouter()

call_service = CallService()


class CallData(BaseModel):
    file_name: str
    qna_list: List[Dict[str, Any]]


@router.post("/call/save_call_info")
async def save_call_info(request: Request, call_data: CallData):
    try:
        # 세션에서 emp_no 가져오기
        employee = request.session.get("employee")
        if not employee:
            raise HTTPException(status_code=401, detail="로그인이 필요합니다.")

        emp_no = employee["emp_no"]

        # 서비스를 통해 데이터 저장
        result = await call_service.save_call_info(
            emp_no=emp_no, file_name=call_data.file_name, qna_list=call_data.qna_list
        )

        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])

        return result
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
