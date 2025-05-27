import pymysql
from typing import List, Dict, Any


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

    def __del__(self):
        if hasattr(self, "cursor"):
            self.cursor.close()
        if hasattr(self, "connection"):
            self.connection.close()
