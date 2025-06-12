# import pymysql
# from typing import List, Dict, Any, Optional
# import os
# from dotenv import load_dotenv

# load_dotenv()


# class Database:
#     def __init__(self):
#         self.connection = pymysql.connect(
#             host=os.environ.get("MY_DB_HOST", "localhost"),
#             port=int(os.environ.get("MY_DB_PORT", 3306)),
#             user=os.environ.get("MY_DB_USER", "root"),
#             password=os.environ.get("MY_DB_PASSWORD", ""),
#             database=os.environ.get("MY_DB_NAME", "wlb_mate"),
#             charset=os.environ.get("MY_DB_CHARSET", "utf8mb4")
#         )
#         self.cursor = self.connection.cursor(pymysql.cursors.DictCursor)

#     def get_all_employees(self) -> List[Dict[str, Any]]:
#         try:
#             self.cursor.execute("SELECT * FROM employee")
#             return self.cursor.fetchall()
#         except Exception as e:
#             print(f"데이터베이스 조회 오류: {e}")
#             return []

#     def verify_employee_login(self, emp_code: str, emp_pwd: str) -> Optional[Dict[str, Any]]:
#         try:
#             query = """
#                 SELECT emp_no, emp_name, emp_code, emp_email, emp_role, 
#                        emp_birth_date, emp_create_dt
#                 FROM employee 
#                 WHERE emp_code = %s AND emp_pwd = %s
#             """
#             self.cursor.execute(query, (emp_code, emp_pwd))
#             result = self.cursor.fetchone()
#             return result
#         except Exception as e:
#             print(f"로그인 검증 오류: {e}")
#             return None
        
#     def get_emp_pwd(self, emp_code: str) -> Optional[Dict[str, Any]]:
#         try:
#             query = """
#                 SELECT emp_pwd
#                 FROM employee
#                 WHERE emp_code = %s
#             """
#             self.cursor.execute(query, (emp_code))
#             result = self.cursor.fetchone()
#             return result
#         except Exception as e:
#             print(f"비밀번호 조회 오류: {e}")
#             return None
        
#     def change_password(self, emp_code: str, new_password: str) -> None:
#         try:
#             query = """
#                 UPDATE employee
#                 SET emp_pwd = %s
#                 WHERE emp_code = %s
#             """
#             self.cursor.execute(query, (new_password, emp_code))
#             self.connection.commit()
#         except Exception as e:
#             print(f"비밀번호 변경 오류: {e}")
#             self.connection.rollback()
    

#     def __del__(self):
#         if hasattr(self, "cursor"):
#             self.cursor.close()
#         if hasattr(self, "connection"):
#             self.connection.close()

import pymysql
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
from datetime import date, datetime

load_dotenv()

class Database:
    def __init__(self):
        self.db_config = {
            "host": os.environ.get("MY_DB_HOST", "localhost"),
            "port": int(os.environ.get("MY_DB_PORT", 3306)),
            "user": os.environ.get("MY_DB_USER", "root"),
            "password": os.environ.get("MY_DB_PASSWORD", ""),
            "database": os.environ.get("MY_DB_NAME", "wlb_mate"),
            "charset": os.environ.get("MY_DB_CHARSET", "utf8mb4")
        }

    def _get_connection(self):
        return pymysql.connect(**self.db_config, cursorclass=pymysql.cursors.DictCursor)

    def get_all_employees(self) -> List[Dict[str, Any]]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT emp_no, emp_name, emp_code, emp_email, emp_role, 
                           emp_birth_date, emp_create_dt
                    FROM employee
                """)
                employees = cursor.fetchall()
                
                for employee in employees:
                    if 'emp_birth_date' in employee and isinstance(employee['emp_birth_date'], date):
                        employee['emp_birth_date'] = employee['emp_birth_date'].isoformat()
                    if 'emp_create_dt' in employee and isinstance(employee['emp_create_dt'], (date, datetime)):
                        employee['emp_create_dt'] = employee['emp_create_dt'].isoformat().split('T')[0]
                return employees
        except Exception as e:
            print(f"데이터베이스 조회 오류: {e}")
            raise 
        finally:
            conn.close()

    def verify_employee_login(self, emp_code: str, emp_pwd: str) -> Optional[Dict[str, Any]]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    SELECT emp_no, emp_name, emp_code, emp_email, emp_role,
                           emp_birth_date, emp_create_dt
                    FROM employee
                    WHERE emp_code = %s AND emp_pwd = %s
                """
                cursor.execute(query, (emp_code, emp_pwd))
                result = cursor.fetchone()
                
                if result:
                    if 'emp_birth_date' in result and isinstance(result['emp_birth_date'], date):
                        result['emp_birth_date'] = result['emp_birth_date'].isoformat()
                    if 'emp_create_dt' in result and isinstance(result['emp_create_dt'], (date, datetime)):
                        result['emp_create_dt'] = result['emp_create_dt'].isoformat().split('T')[0]
                return result
        except Exception as e:
            print(f"로그인 검증 오류: {e}")
            raise
        finally:
            conn.close()

    def get_emp_pwd(self, emp_code: str) -> Optional[Dict[str, Any]]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    SELECT emp_pwd
                    FROM employee
                    WHERE emp_code = %s
                """
                cursor.execute(query, (emp_code,))
                result = cursor.fetchone()
                return result
        except Exception as e:
            print(f"비밀번호 조회 오류: {e}")
            raise
        finally:
            conn.close()

    def change_password(self, emp_code: str, new_password: str) -> None:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    UPDATE employee
                    SET emp_pwd = %s
                    WHERE emp_code = %s
                """
                cursor.execute(query, (new_password, emp_code))
                conn.commit()
        except Exception as e:
            print(f"비밀번호 변경 오류: {e}")
            conn.rollback() 
            raise
        finally:
            conn.close()

    async def create_employee(self, employee_data: Dict[str, Any]) -> int:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                INSERT INTO employee (emp_name, emp_code, emp_pwd, emp_email, emp_birth_date, emp_role, emp_create_dt)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """
                cursor.execute(
                    sql,
                    (
                        employee_data["emp_name"],
                        employee_data["emp_code"],
                        employee_data["emp_pwd"],
                        employee_data["emp_email"],
                        employee_data["emp_birth_date"], 
                        employee_data["emp_role"],
                    ),
                )
            conn.commit()
            return cursor.lastrowid
        except Exception as e:
            print(f"데이터베이스 직원 생성 오류: {e}")
            conn.rollback() 
            raise 
        finally:
            conn.close()

    async def delete_employee(self, emp_no: int):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                sql = "DELETE FROM employee WHERE emp_no = %s"
                cursor.execute(sql, (emp_no,))
            conn.commit()
        except Exception as e:
            print(f"데이터베이스 직원 삭제 오류: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    async def change_password_by_emp_no(self, emp_no: int, new_password: str):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                sql = "UPDATE employee SET emp_pwd = %s WHERE emp_no = %s"
                cursor.execute(sql, (new_password, emp_no))
            conn.commit()
        except Exception as e:
            print(f"데이터베이스 비밀번호 초기화 오류: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()