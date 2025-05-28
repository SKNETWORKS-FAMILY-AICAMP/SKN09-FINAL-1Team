from fastapi import APIRouter, Request, Response, HTTPException
from services.employee_service import EmployeeService
from pydantic import BaseModel

# 로그인 요청 모델
class LoginRequest(BaseModel):
    emp_code: str
    emp_pwd: str

router = APIRouter()
employee_service = EmployeeService()


# 유저 목록 조회
@router.get("/employees")
async def get_all_employees():
    return await employee_service.get_all_employees()


# 유저 로그인
@router.post("/login")
async def login(request: Request, login_data: LoginRequest):
    employee = await employee_service.login(login_data.emp_code, login_data.emp_pwd)
    if not employee:
        raise HTTPException(status_code=401, detail="잘못된 사원번호나 비밀번호입니다.")
    
    # 세션에 저장할 사용자 정보 (비밀번호 제외)
    request.session["employee"] = {
        "emp_no": employee["emp_no"],
        "emp_name": employee["emp_name"],
        "emp_code": employee["emp_code"],
        "emp_email": employee["emp_email"],
        "emp_create_dt": str(employee["emp_create_dt"]),
        "emp_birth_date": str(employee["emp_birth_date"]),
        "emp_role": employee["emp_role"]
    }

    return {'message': '로그인 성공'}

@router.post("/logout")
async def logout(request: Request):
    # 세션 삭제
    request.session.clear()
    return {"message": "로그아웃 성공"}

@router.get("/check-session")
async def check_session(request: Request):
    if "employee" not in request.session:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    
    return {"employee": request.session["employee"]}

@router.get("/mypage")
async def get_mypage_info(request: Request):
    if "employee" not in request.session:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    
    # 세션에서 사용자 정보 가져오기
    employee = request.session["employee"]
    
    return {
        "emp_name": employee["emp_name"],
        "emp_code": employee["emp_code"],
        "emp_email": employee["emp_email"],
        "emp_birth_date": employee["emp_birth_date"],
        "emp_create_dt": employee["emp_create_dt"],
        "emp_role": employee["emp_role"]
    }