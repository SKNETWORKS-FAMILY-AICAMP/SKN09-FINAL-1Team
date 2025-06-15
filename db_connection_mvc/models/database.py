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
            "charset": os.environ.get("MY_DB_CHARSET", "utf8mb4"),
        }

    def _get_connection(self):
        return pymysql.connect(**self.db_config, cursorclass=pymysql.cursors.DictCursor)

    def get_all_employees(self) -> List[Dict[str, Any]]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT emp_no, emp_name, emp_code, emp_email, emp_role, 
                           emp_birth_date, emp_create_dt
                    FROM employee
                """
                )
                employees = cursor.fetchall()

                for employee in employees:
                    if "emp_birth_date" in employee and isinstance(
                        employee["emp_birth_date"], date
                    ):
                        employee["emp_birth_date"] = employee[
                            "emp_birth_date"
                        ].isoformat()
                    if "emp_create_dt" in employee and isinstance(
                        employee["emp_create_dt"], (date, datetime)
                    ):
                        employee["emp_create_dt"] = (
                            employee["emp_create_dt"].isoformat().split("T")[0]
                        )
                return employees
        except Exception as e:
            print(f"데이터베이스 조회 오류: {e}")
            raise
        finally:
            conn.close()

    def verify_employee_login(
        self, emp_code: str, emp_pwd: str
    ) -> Optional[Dict[str, Any]]:
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
                    if "emp_birth_date" in result and isinstance(
                        result["emp_birth_date"], date
                    ):
                        result["emp_birth_date"] = result["emp_birth_date"].isoformat()
                    if "emp_create_dt" in result and isinstance(
                        result["emp_create_dt"], (date, datetime)
                    ):
                        result["emp_create_dt"] = (
                            result["emp_create_dt"].isoformat().split("T")[0]
                        )
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

    async def save_call_data(
        self, emp_no: int, file_name: str, qna_list: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # call_mate 테이블에 데이터 삽입
                call_sql = """
                    INSERT INTO call_mate (emp_no, call_path, call_text)
                    VALUES (%s, %s, NULL)
                """
                file_path = f"/call_data/audios/{file_name}"
                cursor.execute(call_sql, (emp_no, file_path))
                call_no = cursor.lastrowid

                # call_counsel 테이블에 Q&A 데이터 삽입
                counsel_sql = """
                    INSERT INTO call_counsel (call_no, coun_question, coun_answer, coun_feedback)
                    VALUES (%s, %s, %s, %s)
                """
                for qna in qna_list:
                    cursor.execute(
                        counsel_sql,
                        (call_no, qna["question"], qna["answer"], qna["feedback"]),
                    )

            conn.commit()
            return {
                "status": "success",
                "message": "통화 데이터 저장 성공",
                "call_no": call_no,
            }
        except Exception as e:
            print(f"통화 데이터 저장 오류: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    async def get_all_call_datas(self) -> list:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                SELECT
                    c.call_no,
                    c.call_path,
                    c.call_create_dt,
                    cs.coun_no,
                    cs.coun_question,
                    cs.coun_answer,
                    cs.coun_feedback
                FROM call_mate c
                JOIN call_counsel cs ON c.call_no = cs.call_no
                ORDER BY c.call_no DESC, cs.coun_no ASC
                """
                cursor.execute(sql)
                result = cursor.fetchall()
                return result
        except Exception as e:
            print(f"통화 Q&A 전체 조회 오류: {e}")
            raise
        finally:
            conn.close()

    async def delete_call_data(self, coun_no: int):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # call_counsel에서 해당 Q&A 삭제
                sql = "DELETE FROM call_counsel WHERE coun_no = %s"
                cursor.execute(sql, (coun_no,))
            conn.commit()
            return {"status": "success", "message": "Q&A 삭제 성공"}
        except Exception as e:
            print(f"Q&A 삭제 오류: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
