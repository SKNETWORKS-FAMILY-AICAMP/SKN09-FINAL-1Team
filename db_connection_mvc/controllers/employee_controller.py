from fastapi import APIRouter, Request, Response, HTTPException
from services.employee_service import EmployeeService
from pydantic import BaseModel
from fastapi.responses import JSONResponse

# 로그인 요청 모델
class LoginRequest(BaseModel):
    emp_code: str
    emp_pwd: str
    
# 비밀번호 확인 요청 모델
class PasswordRequest(BaseModel):
    password: str
    
# 비밀번호 변경 요청 모델
class PasswordChangeRequest(BaseModel):
    newPassword: str
    checkNewPassword: str

router = APIRouter()
employee_service = EmployeeService()


# 유저 목록 조회
@router.get("/employees")
async def get_all_employees():
    return await employee_service.get_all_employees()


# 유저 로그인
@router.post("/login")
async def login(request: Request, response: Response, login_data: LoginRequest):
    print("=== 로그인 시도 ===")
    print("요청된 사원번호:", login_data.emp_code)
    
    employee = await employee_service.login(login_data.emp_code, login_data.emp_pwd)
    if not employee:
        raise HTTPException(status_code=401, detail="잘못된 사원번호나 비밀번호입니다.")
    
    # 세션에 저장할 사용자 정보 (비밀번호 제외)
    user_data = {
        "emp_no": employee["emp_no"],
        "emp_name": employee["emp_name"],
        "emp_code": employee["emp_code"],
        "emp_email": employee["emp_email"],
        "emp_create_dt": str(employee["emp_create_dt"]),
        "emp_birth_date": str(employee["emp_birth_date"]),
        "emp_role": employee["emp_role"]
    }
    
    # 세션에 사용자 정보 저장
    request.session["employee"] = user_data
    request.session["authenticated"] = True
    
    print("=== 세션 저장 완료 ===")
    print("세션 데이터:", request.session)
    print("==================")

    response = JSONResponse(
        content={
            'message': '로그인 성공',
            'employee': user_data
        }
    )
    
    # 세션 쿠키 설정
    response.set_cookie(
        key="sessionid",
        value=request.session._session_id,
        httponly=True,
        max_age=86400,
        path="/",
        samesite="lax"
    )
    
    return response

@router.post("/logout")
async def logout(request: Request):
    print("=== 로그아웃 시도 ===")
    print("세션 삭제 전:", request.session)
    # 세션 삭제
    request.session.clear()
    print("세션 삭제 후:", request.session)
    print("==================")
    return {"message": "로그아웃 성공"}

@router.get("/check-session")
async def check_session(request: Request):
    print("=== 세션 체크 ===")
    print("현재 세션:", request.session)
    
    # 세션 데이터 확인
    employee = request.session.get("employee")
    authenticated = request.session.get("authenticated")
    
    if not authenticated or not employee:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    
    return {"employee": employee}

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
    
@router.post("/verify-password")
async def verify_password(request: Request, password_request: PasswordRequest):

    employee = request.session["employee"]
    emp_code = employee["emp_code"]
    
    emp_pwd = await employee_service.get_emp_pwd(emp_code)

    if emp_pwd["emp_pwd"] != password_request.password:
        raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다.")
    return {"message": "비밀번호 확인 성공"}

@router.put("/change-password")
async def change_password(request: Request, password_change_request: PasswordChangeRequest):
    employee = request.session["employee"]
    emp_code = employee["emp_code"]

    try:
        await employee_service.change_password(emp_code, password_change_request.newPassword)
        return {"message": "비밀번호 변경 성공"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

