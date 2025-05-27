import pymysql
from typing import List, Dict, Any, Optional


class Database:
    def __init__(self):
        self.connection = pymysql.connect(
            host="localhost", user="wlb_mate", password="wlb_mate", database="wlb_mate"
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

    def __del__(self):
        if hasattr(self, "cursor"):
            self.cursor.close()
        if hasattr(self, "connection"):
            self.connection.close()
