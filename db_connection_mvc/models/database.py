import pymysql
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

load_dotenv()


class Database:
    def __init__(self):
        self.connection = pymysql.connect(
            host=os.environ.get("MY_DB_HOST", "localhost"),
            port=int(os.environ.get("MY_DB_PORT", 3306)),
            user=os.environ.get("MY_DB_USER", "root"),
            password=os.environ.get("MY_DB_PASSWORD", ""),
            database=os.environ.get("MY_DB_NAME", "wlb_mate"),
            charset=os.environ.get("MY_DB_CHARSET", "utf8mb4")
        )
        self.cursor = self.connection.cursor(pymysql.cursors.DictCursor)

    def get_all_employees(self) -> List[Dict[str, Any]]:
        try:
            self.cursor.execute("SELECT * FROM employee")
            return self.cursor.fetchall()
        except Exception as e:
            print(f"데이터베이스 조회 오류: {e}")
            return []

    def verify_employee_login(self, emp_code: str, emp_pwd: str) -> Optional[Dict[str, Any]]:
        try:
            query = """
                SELECT emp_no, emp_name, emp_code, emp_email, emp_role, 
                       emp_birth_date, emp_create_dt
                FROM employee 
                WHERE emp_code = %s AND emp_pwd = %s
            """
            self.cursor.execute(query, (emp_code, emp_pwd))
            result = self.cursor.fetchone()
            return result
        except Exception as e:
            print(f"로그인 검증 오류: {e}")
            return None
        
    def get_emp_pwd(self, emp_code: str) -> Optional[Dict[str, Any]]:
        try:
            query = """
                SELECT emp_pwd
                FROM employee
                WHERE emp_code = %s
            """
            self.cursor.execute(query, (emp_code))
            result = self.cursor.fetchone()
            return result
        except Exception as e:
            print(f"비밀번호 조회 오류: {e}")
            return None
        
    def change_password(self, emp_code: str, new_password: str) -> None:
        try:
            query = """
                UPDATE employee
                SET emp_pwd = %s
                WHERE emp_code = %s
            """
            self.cursor.execute(query, (new_password, emp_code))
            self.connection.commit()
        except Exception as e:
            print(f"비밀번호 변경 오류: {e}")
            self.connection.rollback()
    

    def __del__(self):
        if hasattr(self, "cursor"):
            self.cursor.close()
        if hasattr(self, "connection"):
            self.connection.close()
