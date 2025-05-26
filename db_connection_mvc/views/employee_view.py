from fastapi import APIRouter
from controllers.employee_controller import EmployeeController

router = APIRouter()
employee_controller = EmployeeController()


# 유저 목록 조회
@router.get("/employees")
async def get_all_employees():
    return await employee_controller.get_all_employees()
