from services.employee_service import EmployeeService
from typing import List, Dict, Any


class EmployeeController:
    def __init__(self):
        self.employee_service = EmployeeService()

    def format_employee_list(self, employees: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "status": "success",
            "data": employees,
            "message": "직원 목록을 성공적으로 조회했습니다.",
            "count": len(employees),
        }

    def format_error(self, error_message: str) -> Dict[str, Any]:
        return {"status": "error", "data": None, "message": error_message, "count": 0}

    async def get_all_employees(self) -> Dict[str, Any]:
        try:
            employees = self.employee_service.get_all_employees()
            return self.format_employee_list(employees)
        except Exception as e:
            return self.format_error(str(e))
