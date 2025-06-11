from fastapi import APIRouter, Request, Response, HTTPException
from services.employee_service import EmployeeService
from pydantic import BaseModel
from datetime import date

router = APIRouter()

# 로그인 요청 모델
class LoginRequest(BaseModel):
    username: str
    password: str
    
# 비밀번호 확인 요청 모델
class PasswordRequest(BaseModel):
    password: str
    
# 비밀번호 변경 요청 모델
class PasswordChangeRequest(BaseModel):
    newPassword: str
    checkNewPassword: str

router = APIRouter()
employee_service = EmployeeService()

# yj class 2개 추가
class EmployeeCreate(BaseModel):
    emp_name: str
    emp_code: str
    emp_pwd: str
    emp_email: str
    emp_birth_date: str  # YYYY-MM-DD
    emp_role: int

# 비밀번호 초기화 요청 모델
class PasswordResetRequest(BaseModel):
    newPassword: str


# 유저 목록 조회
@router.get("/employees")
async def get_all_employees():
    return await employee_service.get_all_employees()

# 유저 로그인
@router.post("/login")
async def login(request: Request, login_data: LoginRequest):
    employee = await employee_service.login(login_data.username, login_data.password)
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

    # 로그인시 세션 정보 반환
    return {"message": "로그인 성공", "employee": employee}

@router.post("/logout")
async def logout(request: Request):
    # 세션 삭제
    request.session.clear()
    return {"message": "로그아웃 성공"}

@router.get("/check-session")
async def check_session(request: Request):
    print(request.session)
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
    
# yj
@router.post("/api/employees")
async def create_employee(employee_data: EmployeeCreate):
    try:
        new_employee = await employee_service.create_employee(employee_data.dict())
        if new_employee["status"] != "success":
            raise HTTPException(status_code=500, detail=new_employee["message"])
        return {"message": new_employee["message"], "emp_no": new_employee.get("emp_no")}
    except Exception as e:
        import traceback
        traceback.print_exc()  # 에러 스택 트레이스 출력
        raise HTTPException(status_code=500, detail=f"직원 등록 오류: {str(e)}")

# 사원 삭제
@router.delete("api/employees/{emp_no}")
async def delete_employee(emp_no: int):
    try:
        await employee_service.delete_employee(emp_no)
        return {"message": "삭제 성공"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 사원 비밀번호 초기화 (관리자 기능 등에서 사용)
@router.put("api/employees/{emp_no}/reset-password")
async def reset_password(emp_no: int, data: PasswordResetRequest):
    try:
        await employee_service.change_password_by_emp_no(emp_no, data.newPassword)
        return {"message": "비밀번호 초기화 성공"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#  from fastapi import APIRouter, Request, Response, HTTPException
# from services.employee_service import EmployeeService
# from pydantic import BaseModel
# from datetime import date

# # 로그인 요청 모델
# class LoginRequest(BaseModel):
#     emp_code: str
#     emp_pwd: str
    
# # 비밀번호 확인 요청 모델
# class PasswordRequest(BaseModel):
#     password: str
    
# # 비밀번호 변경 요청 모델
# class PasswordChangeRequest(BaseModel):
#     newPassword: str
#     checkNewPassword: str

# router = APIRouter()
# employee_service = EmployeeService()

# # yj class 2개 추가
# class EmployeeCreate(BaseModel):
#     emp_name: str
#     emp_code: str
#     emp_pwd: str
#     emp_email: str
#     emp_birth_date: date # YYYY-MM-DD
#     emp_role: int

# # 비밀번호 초기화 요청 모델
# class PasswordResetRequest(BaseModel):
#     newPassword: str


# # 유저 목록 조회
# @router.get("/employees")
# async def get_all_employees():
#     return await employee_service.get_all_employees()

# # 유저 로그인
# @router.post("/login")
# async def login(request: Request, login_data: LoginRequest):
#     employee = await employee_service.login(login_data.emp_code, login_data.emp_pwd)
#     if not employee:
#         raise HTTPException(status_code=401, detail="잘못된 사원번호나 비밀번호입니다.")
    
#     # 세션에 저장할 사용자 정보 (비밀번호 제외)
#     request.session["employee"] = {
#         "emp_no": employee["emp_no"],
#         "emp_name": employee["emp_name"],
#         "emp_code": employee["emp_code"],
#         "emp_email": employee["emp_email"],
#         "emp_create_dt": str(employee["emp_create_dt"]),
#         "emp_birth_date": str(employee["emp_birth_date"]),
#         "emp_role": employee["emp_role"]
#     }

#     return {'message': '로그인 성공'}

# @router.post("/logout")
# async def logout(request: Request):
#     # 세션 삭제
#     request.session.clear()
#     return {"message": "로그아웃 성공"}

# @router.get("/check-session")
# async def check_session(request: Request):
#     if "employee" not in request.session:
#         raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    
#     return {"employee": request.session["employee"]}

# @router.get("/mypage")
# async def get_mypage_info(request: Request):
#     if "employee" not in request.session:
#         raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    
#     # 세션에서 사용자 정보 가져오기
#     employee = request.session["employee"]
    
#     return {
#         "emp_name": employee["emp_name"],
#         "emp_code": employee["emp_code"],
#         "emp_email": employee["emp_email"],
#         "emp_birth_date": employee["emp_birth_date"],
#         "emp_create_dt": employee["emp_create_dt"],
#         "emp_role": employee["emp_role"]
#     }
    
# @router.post("/verify-password")
# async def verify_password(request: Request, password_request: PasswordRequest):

#     employee = request.session["employee"]
#     emp_code = employee["emp_code"]
    
#     emp_pwd = await employee_service.get_emp_pwd(emp_code)

#     if emp_pwd["emp_pwd"] != password_request.password:
#         raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다.")
#     return {"message": "비밀번호 확인 성공"}

# @router.put("/change-password")
# async def change_password(request: Request, password_change_request: PasswordChangeRequest):
#     employee = request.session["employee"]
#     emp_code = employee["emp_code"]

#     try:
#         await employee_service.change_password(emp_code, password_change_request.newPassword)
#         return {"message": "비밀번호 변경 성공"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    
# # yj
# # 사원 추가
# @router.post("/employees")
# async def create_employee(employee_data: EmployeeCreate):
#     try:
#         new_employee = await employee_service.create_employee(employee_data)
#         return new_employee
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # 사원 삭제
# @router.delete("/employees/{emp_no}")
# async def delete_employee(emp_no: int):
#     try:
#         await employee_service.delete_employee(emp_no)
#         return {"message": "삭제 성공"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # 사원 비밀번호 초기화 (관리자 기능 등에서 사용)
# @router.put("/employees/{emp_no}/reset-password")
# async def reset_password(emp_no: int, data: PasswordResetRequest):
#     try:
#         await employee_service.change_password_by_emp_no(emp_no, data.newPassword )
#         return {"message": "비밀번호 초기화 성공"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

