from fastapi import APIRouter
from models.database import Database
from pydantic import BaseModel
from pymysql.cursors import DictCursor

query_router = APIRouter()
db = Database()

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
            print("쿼리 결과:", results[:3])
        return results
    except Exception as e:
        print(f"민원 조회 실패: {e}")
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
            cursor.execute("""
                UPDATE query_response
                SET res_text = %s,
                    res_state = %s,
                    res_write_dt = NOW()
                    query_no = %s
            """, (input.res_text, input.res_state, input.query_no))
        conn.commit()
        return {"success": True}
    except Exception as e:
        print(f"답변 저장 실패: {e}")
        return {"success": False}
    finally:
        conn.close()