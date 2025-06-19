from fastapi import APIRouter
from models.database import Database # Database 클래스 경로를 실제 프로젝트에 맞게 확인해주세요.
from pydantic import BaseModel
from pymysql.cursors import DictCursor

db = Database()

query_router = APIRouter()

@query_router.get("/get-query-list")
def get_query_list():
    conn = db._get_connection()
    try:
        with conn.cursor(DictCursor) as cursor:  
            cursor.execute("""
                SELECT 
                    query_mate.query_no,
                    query_mate.query_title,
                    query_mate.query_text,
                    DATE_FORMAT(query_mate.query_create_dt, '%Y.%m.%d') AS query_create_dt,
                    query_response.res_text,
                    query_response.res_state
                FROM query_mate
                LEFT JOIN query_response ON query_mate.query_no = query_response.query_no
                ORDER BY query_mate.query_create_dt DESC
            """)
            results = cursor.fetchall()
        return results
    except Exception as e:
        print(f"ERROR: 민원 조회 실패: {e}")
        return []
    finally:
        conn.close()


class SaveAnswerInput(BaseModel):
    query_no: int
    res_text: str
    res_state: int

@query_router.post("/save-answer")
def save_answer(input: SaveAnswerInput):
    conn = db._get_connection()
    try:
        with conn.cursor() as cursor:
            default_emp_no = 1 
            cursor.execute("""
                INSERT INTO query_response (query_no, emp_no, res_text, res_state, res_write_dt)
                VALUES (%s, %s, %s, %s, NOW())
                ON DUPLICATE KEY UPDATE
                    res_text = VALUES(res_text),
                    res_state = VALUES(res_state),
                    res_write_dt = NOW()
            """, (input.query_no, default_emp_no, input.res_text, input.res_state))
        conn.commit()
        return {"success": True}
    except Exception as e:
        print(f"ERROR: 답변 저장 실패: {e}")
        conn.rollback()
        return {"success": False}
    finally:
        conn.close()