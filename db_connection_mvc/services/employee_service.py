from typing import List, Dict, Any, Optional
from models.database import Database
from datetime import date
from services.utils.hash import hash_password
from services.utils.hash import verify_password
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
            # 1) SHA-256 해시(hex) 가져오기
            row = self.db.get_emp_pwd(emp_code)
            if not row:
                return None

            db_hashed = row["emp_pwd"]

            # 2) 평문 vs 해시 비교  🔄 변경됨
            if not verify_password(emp_pwd, db_hashed):
                print(f"[login] 비밀번호 불일치: 입력={emp_pwd}, DB 해시={db_hashed}")
                return None

            # 3) 성공 시 전체 정보 반환
            user = self.db.get_employee_by_code(emp_code)
            return user

        except Exception as e:
            print(f"[EmployeeService.login] 예외 발생: {e}")
            return None


    async def get_emp_pwd(self, emp_code: str) -> Optional[Dict[str, Any]]:
        try:
            emp_pwd = self.db.get_emp_pwd(emp_code)
            return emp_pwd
        except Exception as e:
            return self._format_error(f"비밀번호 조회 오류: {str(e)}")

    async def change_password(self, emp_code: str, new_password: str) -> Dict[str, Any]:
        try:
            new_hash = hash_password(new_password)  # 🔄 변경됨
            self.db.change_password(emp_code, new_hash)
            return self._format_success("비밀번호 변경 성공")
        except Exception as e:
            print(f"[EmployeeService.change_password] 예외 발생: {e}")
            return self._format_error(f"비밀번호 변경 실패: {e}")

    async def create_employee(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            data["emp_birth_date"] = date.fromisoformat(data["emp_birth_date"])
            data["emp_pwd"] = hash_password(data["emp_pwd"])  # 🔄 변경됨
            emp_no = await self.db.create_employee(data)
            return self._format_success("직원 등록 성공", {"emp_no": emp_no}, 1)
        except Exception as e:
            print(f"[EmployeeService.create_employee] 예외 발생: {e}")
            return self._format_error(f"등록 실패: {e}")

    async def delete_employee(self, emp_no: int) -> Dict[str, Any]:
        try:
            await self.db.delete_employee(emp_no)
            return self._format_success(f"직원 번호 {emp_no} 삭제 성공")
        except Exception as e:
            return self._format_error(f"직원 삭제 서비스 오류: {str(e)}")

    async def change_password_by_emp_no(self, emp_no: int, new_password: str) -> Dict[str, Any]:
        try:
            new_hash = hash_password(new_password)  # 🔄 변경됨
            await self.db.change_password_by_emp_no(emp_no, new_hash)
            return self._format_success("비밀번호 초기화 성공")
        except Exception as e:
            print(f"[EmployeeService.change_password_by_emp_no] 예외 발생: {e}")
            return self._format_error(f"초기화 실패: {e}")
        

