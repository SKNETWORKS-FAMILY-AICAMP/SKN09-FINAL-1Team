from typing import List, Dict, Any, Optional
from models.database import Database
from datetime import date

class EmployeeService:
    def __init__(self):
        self.db = Database()

    def _format_success(self, message: str, data: Optional[Any] = None, count: int = 0) -> Dict[str, Any]:
        return {"status": "success", "message": message, "data": data, "count": count}

    def _format_error(self, message: str, data: Optional[Any] = None, count: int = 0) -> Dict[str, Any]:
        return {"status": "error", "message": message, "data": data, "count": count}

    async def get_all_employees(self) -> Dict[str, Any]:
        try:
            employees = self.db.get_all_employees()
            return self._format_success("직원 목록을 성공적으로 조회했습니다.", employees, len(employees))
        except Exception as e:
            return self._format_error(f"직원 목록 조회 오류: {str(e)}")

    async def login(self, emp_code: str, emp_pwd: str) -> Optional[Dict[str, Any]]:
        try:
            employee = self.db.verify_employee_login(emp_code, emp_pwd)
            return employee
        except Exception as e:
            print(f"로그인 서비스 오류: {e}")
            return None

    async def get_emp_pwd(self, emp_code: str) -> Optional[Dict[str, Any]]:
        try:
            emp_pwd = self.db.get_emp_pwd(emp_code)
            return emp_pwd
        except Exception as e:
            return self._format_error(f"비밀번호 조회 오류: {str(e)}")

    async def change_password(self, emp_code: str, new_password: str) -> Dict[str, Any]:
        try:
            self.db.change_password(emp_code, new_password)
            return self._format_success("비밀번호 변경 성공")
        except Exception as e:
            return self._format_error(f"비밀번호 변경 오류: {str(e)}")

    async def create_employee(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            employee_data["emp_birth_date"] = date.fromisoformat(employee_data["emp_birth_date"])
            
            emp_no = await self.db.create_employee(employee_data)
            
            return self._format_success("등록 성공", {"emp_no": emp_no}, count=1)
        except Exception as e:
            return self._format_error(f"직원 생성 서비스 오류: {str(e)}")

    async def delete_employee(self, emp_no: int) -> Dict[str, Any]:
        try:
            await self.db.delete_employee(emp_no)
            return self._format_success(f"직원 번호 {emp_no} 삭제 성공")
        except Exception as e:
            return self._format_error(f"직원 삭제 서비스 오류: {str(e)}")

    async def change_password_by_emp_no(self, emp_no: int, new_password: str) -> Dict[str, Any]:
        try:
            await self.db.change_password_by_emp_no(emp_no, new_password)
            return self._format_success(f"직원 번호 {emp_no} 비밀번호 초기화 성공")
        except Exception as e:
            return self._format_error(f"비밀번호 초기화 서비스 오류: {str(e)}")