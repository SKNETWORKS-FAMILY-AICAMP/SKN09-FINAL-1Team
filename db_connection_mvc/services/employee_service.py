from typing import List, Dict, Any
from models.database import Database

class EmployeeService:
    def __init__(self):
        self.db = Database()

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
            employees = self.db.get_all_employees()
            return self.format_employee_list(employees)
        except Exception as e:
            return self.format_error(str(e))
        
    async def login(self, emp_code: str, emp_pwd: str) -> Dict[str, Any]:
        try:
            employee = self.db.verify_employee_login(emp_code, emp_pwd)
            return employee
        except Exception as e:
            return self.format_error(str(e))
        
    async def get_emp_pwd(self, emp_code: str) -> Dict[str, Any]:
        try:
            emp_pwd = self.db.get_emp_pwd(emp_code)
            return emp_pwd
        except Exception as e:
            return self.format_error(str(e))
        
    async def change_password(self, emp_code: str, new_password: str) -> Dict[str, Any]:
        try:
            self.db.change_password(emp_code, new_password)
            return {"message": "비밀번호 변경 성공"}
        except Exception as e:
            return self.format_error(str(e))
