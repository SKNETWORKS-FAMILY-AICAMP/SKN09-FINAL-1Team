from typing import List, Dict, Any
from models.database import Database
from fastapi import HTTPException

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
        
    # async def login(self, emp_code: str, emp_pwd: str) -> Dict[str, Any]:
    #     try:
    #         employee = self.db.verify_employee_login(emp_code, emp_pwd)
    #         return employee
    #     except Exception as e:
    #         return self.format_error(str(e))
        
    async def login(self, emp_code: str, emp_pwd: str) -> Dict[str, Any] | None:
        try:
            return self.db.verify_employee_login(emp_code, emp_pwd)
        except Exception:
            return None

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
        
    # # yj    
    # async def create_employee(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:
    #     try:
    #         self.db.create_employee(employee_data)
    #         return {"status": "success", "message": "직원 등록 성공"}
    #     except Exception as e:
    #         return self.format_error(str(e))

    async def create_employee(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:from fastapi import HTTPException

    async def create_employee(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            emp_no = self.db.create_employee(employee_data)
            return {"status": "success", "message": "직원 등록 성공", "emp_no": emp_no}
        except ValueError as ve:
            # 중복된 사번 또는 동명이인 => 409 Conflict
            raise HTTPException(status_code=409, detail=str(ve))
        except Exception as e:
            return self.format_error(str(e))

    async def delete_employee(self, emp_no: int) -> Dict[str, Any]:
        try:
            self.db.delete_employee(emp_no)
            return {"status": "success", "message": "직원 삭제 성공"}
        except Exception as e:
            return self.format_error(str(e))

    async def change_password_by_emp_no(self, emp_no: int, new_password: str) -> Dict[str, Any]:
        try:
            self.db.change_password_by_emp_no(emp_no, new_password)
            return {"status": "success", "message": "비밀번호 초기화 성공"}
        except Exception as e:
            return self.format_error(str(e))



# from typing import List, Dict, Any
# from models.database import Database

# class EmployeeService:
#     def __init__(self):
#         self.db = Database()

#     def format_employee_list(self, employees: List[Dict[str, Any]]) -> Dict[str, Any]:
#         return {
#             "status": "success",
#             "data": employees,
#             "message": "직원 목록을 성공적으로 조회했습니다.",
#             "count": len(employees),
#         }

#     def format_error(self, error_message: str) -> Dict[str, Any]:
#         return {"status": "error", "data": None, "message": error_message, "count": 0}

#     async def get_all_employees(self) -> Dict[str, Any]:
#         try:
#             employees = self.db.get_all_employees()
#             return self.format_employee_list(employees)
#         except Exception as e:
#             return self.format_error(str(e))
        
#     async def login(self, emp_code: str, emp_pwd: str) -> Dict[str, Any]:
#         try:
#             employee = self.db.verify_employee_login(emp_code, emp_pwd)
#             return employee
#         except Exception as e:
#             return self.format_error(str(e))
        
#     async def get_emp_pwd(self, emp_code: str) -> Dict[str, Any]:
#         try:
#             emp_pwd = self.db.get_emp_pwd(emp_code)
#             return emp_pwd
#         except Exception as e:
#             return self.format_error(str(e))
        
#     async def change_password(self, emp_code: str, new_password: str) -> Dict[str, Any]:
#         try:
#             self.db.change_password(emp_code, new_password)
#             return {"message": "비밀번호 변경 성공"}
#         except Exception as e:
#             return self.format_error(str(e))
        
#     # yj    
#     async def create_employee(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:
#         try:
#             self.db.create_employee(employee_data)
#             return {"status": "success", "message": "직원 등록 성공"}
#         except Exception as e:
#             return self.format_error(str(e))

#     async def delete_employee(self, emp_no: int) -> Dict[str, Any]:
#         try:
#             self.db.delete_employee(emp_no)
#             return {"status": "success", "message": "직원 삭제 성공"}
#         except Exception as e:
#             return self.format_error(str(e))

#     async def change_password_by_emp_no(self, emp_no: int, new_password: str) -> Dict[str, Any]:
#         try:
#             self.db.change_password_by_emp_no(emp_no, new_password)
#             return {"status": "success", "message": "비밀번호 초기화 성공"}
#         except Exception as e:
#             return self.format_error(str(e))
