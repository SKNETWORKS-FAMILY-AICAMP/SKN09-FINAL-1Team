from fastapi import APIRouter, Request, Response, HTTPException
from services.employee_service import EmployeeService
from pydantic import BaseModel, ValidationError
from datetime import date
import traceback
# from passlib.context import CryptContext

router = APIRouter()
employee_service = EmployeeService()

class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordRequest(BaseModel):
    password: str

class PasswordChangeRequest(BaseModel):
    newPassword: str
    checkNewPassword: str

class EmployeeCreate(BaseModel):
    emp_name: str
    emp_code: str
    emp_pwd: str
    emp_email: str
    emp_birth_date: str
    emp_role: int

class PasswordResetRequest(BaseModel):
    newPassword: str


# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# @router.post("/verify-password")
# async def verify_password(request: Request, password_request: PasswordRequest):
#     employee = request.session.get("employee")
#     if not employee:
#         raise HTTPException(status_code=401, detail="로그인된 사용자가 없습니다.")
        
#     emp_code = employee["emp_code"]
    
#     emp_pwd_info = await employee_service.get_emp_pwd(emp_code)
#     if not emp_pwd_info:
#         raise HTTPException(status_code=401, detail="비밀번호 정보를 찾을 수 없습니다.")

#     hashed_pwd = emp_pwd_info.get("emp_pwd")
#     if not pwd_context.verify(password_request.password, hashed_pwd):
#         raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다.")
    
#     return {"message": "비밀번호 확인 성공"}

@router.get("/employees")
async def get_all_employees():
    return await employee_service.get_all_employees()

@router.post("/login")
async def login(request: Request, login_data: LoginRequest):
    employee = await employee_service.login(login_data.username, login_data.password)
    if not employee:
        raise HTTPException(status_code=401, detail="잘못된 사원번호나 비밀번호입니다.")
    
    request.session["employee"] = {
        "emp_no": employee["emp_no"],
        "emp_name": employee["emp_name"],
        "emp_code": employee["emp_code"],
        "emp_email": employee["emp_email"],
        "emp_create_dt": str(employee["emp_create_dt"]),
        "emp_birth_date": str(employee["emp_birth_date"]),
        "emp_role": employee["emp_role"]
    }
    return {"message": "로그인 성공", "employee": employee}

@router.post("/logout")
async def logout(request: Request):
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
    employee = request.session.get("employee")
    if not employee:
        raise HTTPException(status_code=401, detail="로그인된 사용자가 없습니다.")
        
    emp_code = employee["emp_code"]
    
    emp_pwd_info = await employee_service.get_emp_pwd(emp_code)
    if not emp_pwd_info or emp_pwd_info.get("emp_pwd") != password_request.password:
        raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다.")
    return {"message": "비밀번호 확인 성공"}

@router.put("/change-password")
async def change_password(request: Request, password_change_request: PasswordChangeRequest):
    employee = request.session.get("employee")
    if not employee:
        raise HTTPException(status_code=401, detail="로그인된 사용자가 없습니다.")
        
    emp_code = employee["emp_code"]
    
    if password_change_request.newPassword != password_change_request.checkNewPassword:
        raise HTTPException(status_code=400, detail="새 비밀번호와 확인용 비밀번호가 일치하지 않습니다.")

    try:
        await employee_service.change_password(emp_code, password_change_request.newPassword)
        return {"message": "비밀번호 변경 성공"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"비밀번호 변경 오류: {str(e)}")
    
@router.post("/employees") 
async def create_employee(employee_data: EmployeeCreate): 
    try:
        new_employee_result = await employee_service.create_employee(employee_data.dict())

        if new_employee_result["status"] != "success":
            raise HTTPException(status_code=500, detail=new_employee_result["message"])
        
        return {
            "message": new_employee_result["message"],
            "emp_no": new_employee_result.get('data', {}).get('emp_no') 
        }
    except ValidationError as e: 
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=f"직원 등록 중 서버 오류: {str(e)}")

@router.delete("/employees/{emp_no}") 
async def delete_employee(emp_no: int):
    try:
        delete_result = await employee_service.delete_employee(emp_no)
        if delete_result["status"] != "success":
            raise HTTPException(status_code=500, detail=delete_result["message"])
        return {"message": delete_result["message"]}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"직원 삭제 오류: {str(e)}")

@router.put("/employees/{emp_no}/reset-password") 
async def reset_password(emp_no: int, data: PasswordResetRequest):
    try:
        reset_result = await employee_service.change_password_by_emp_no(emp_no, data.newPassword)
        if reset_result["status"] != "success":
            raise HTTPException(status_code=500, detail=reset_result["message"])
        return {"message": reset_result["message"]}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"비밀번호 초기화 오류: {str(e)}")