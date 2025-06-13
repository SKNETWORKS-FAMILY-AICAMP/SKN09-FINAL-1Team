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
from services.utils.hash import verify_password

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
                cursor.execute("SELECT * FROM employee WHERE emp_code = %s", (emp_code,))
                employee = cursor.fetchone()
                if not employee:
                    return None

                # 1) DB에서 읽어온 SHA-256 해시(hex)
                db_hashed = employee["emp_pwd"].strip()  # 앞뒤 공백 제거

                # 2) 입력 평문 vs 해시 검증
                is_valid = verify_password(emp_pwd, db_hashed)  

                # 3) 검증 성공 시 employee 정보, 아니면 None
                return employee if is_valid else None

        except Exception as e:
            print(f"[verify_employee_login] 예외 발생: {e}")
            return None
        finally:
            conn.close()

    def create_employee(self, data: Dict[str, Any]) -> int:
        """
        신규 직원 생성 (emp_pwd는 이미 해시된 상태여야 함).
        """
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO employee
                        (emp_name, emp_code, emp_pwd, emp_email, emp_birth_date, emp_role, emp_create_dt)
                    VALUES
                        (%s, %s, %s, %s, %s, %s, NOW())
                """, (
                    data["emp_name"],
                    data["emp_code"],
                    data["emp_pwd"],
                    data["emp_email"],
                    data["emp_birth_date"],
                    data["emp_role"],
                ))
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"[Database.create_employee] 예외 발생: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    def get_emp_pwd(self, emp_code: str) -> Optional[Dict[str, Any]]:
        """
        사용자 emp_code로 SHA-256 해시된 비밀번호(emp_pwd)만 조회.
        """
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT emp_pwd FROM employee WHERE emp_code = %s",
                    (emp_code,)
                )
                return cursor.fetchone()
        except Exception as e:
            print(f"[Database.get_emp_pwd] 예외 발생: {e}")
            raise
        finally:
            conn.close()
    def change_password(self, emp_code: str, new_hashed: str) -> None:
        """
        emp_code로 비밀번호(new_hashed)를 업데이트.
        """
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE employee
                    SET emp_pwd = %s
                    WHERE emp_code = %s
                """, (new_hashed, emp_code))
                conn.commit()
        except Exception as e:
            print(f"[Database.change_password] 예외 발생: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    def get_employee_by_code(self, emp_code: str) -> Optional[Dict[str, Any]]:
        """
        로그인 성공 시 전체 사용자 정보를 조회.
        """
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT emp_no, emp_name, emp_code, emp_email, emp_role,
                           emp_birth_date, emp_create_dt
                    FROM employee
                    WHERE emp_code = %s
                """, (emp_code,))
                user = cursor.fetchone()
                # 날짜 타입을 ISO 문자열로 변환
                if user:
                    bd = user.get("emp_birth_date")
                    cd = user.get("emp_create_dt")
                    if isinstance(bd, date):
                        user["emp_birth_date"] = bd.isoformat()
                    if isinstance(cd, (date, datetime)):
                        user["emp_create_dt"] = cd.isoformat().split("T")[0]
                return user
        except Exception as e:
            print(f"[Database.get_employee_by_code] 예외 발생: {e}")
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