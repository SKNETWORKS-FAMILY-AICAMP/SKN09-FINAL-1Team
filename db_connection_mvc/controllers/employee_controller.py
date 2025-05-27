from fastapi import APIRouter
from services.employee_service import EmployeeService

router = APIRouter()
employee_service = EmployeeService()


# 유저 목록 조회
@router.get("/employees")
async def get_all_employees():
    return await employee_service.get_all_employees()
