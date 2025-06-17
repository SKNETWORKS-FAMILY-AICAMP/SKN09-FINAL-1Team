# from fastapi import APIRouter
# from models.database import Database
# from pydantic import BaseModel
# from pymysql.cursors import DictCursor

# query_router = APIRouter()
# db = Database()

# @query_router.get("/get-query-list")
# def get_query_list():
#     conn = db._get_connection()
#     try:
#         with conn.cursor(DictCursor) as cursor:  
#             cursor.execute("""
#                 SELECT 
#                     query_mate.query_no,
#                     query_mate.query_title,
#                     query_mate.query_text,
#                     DATE_FORMAT(query_mate.query_create_dt, '%Y.%m.%d') AS query_create_dt,
#                     query_response.res_text,
#                     query_response.res_state
#                 FROM query_mate
#                 LEFT JOIN query_response ON query_mate.query_no = query_response.query_no
#                 ORDER BY query_mate.query_create_dt DESC
#             """)
#             results = cursor.fetchall()
#             print("쿼리 결과:", results[:3])
#         return results
#     except Exception as e:
#         print(f"민원 조회 실패: {e}")
#         return []
#     finally:
#         conn.close()


# class SaveAnswerInput(BaseModel):
#     query_no: int
#     res_text: str
#     res_state: int

# @query_router.post("/save-answer")
# def save_answer(input: SaveAnswerInput):
#     conn = db._get_connection()
#     try:
#         with conn.cursor() as cursor:
#             cursor.execute("""
#                 UPDATE query_response
#                 SET res_text = %s,
#                     res_state = %s,
#                     res_write_dt = NOW()
#                 WHERE query_no = %s
#             """, (input.res_text, input.res_state, input.query_no))
#         conn.commit()
#         return {"success": True}
#     except Exception as e:
#         print(f"답변 저장 실패: {e}")
#         return {"success": False}
#     finally:
#         conn.close()
from fastapi import APIRouter
from models.database import Database # Database 클래스 경로를 실제 프로젝트에 맞게 확인해주세요.
from pydantic import BaseModel
from pymysql.cursors import DictCursor

# 이 파일이 독립적인 라우터로 사용되는 경우, Database 인스턴스를 여기서 초기화해야 합니다.
# 만약 main.py 등에서 db 인스턴스를 이미 생성하여 전달하고 있다면 이 줄은 제거하거나 조정해야 합니다.
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
            print("DEBUG: 쿼리 결과 (get_query_list):", results[:3])
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
            # `query_response` 테이블의 `query_no`는 PRIMARY KEY이므로,
            # `INSERT ... ON DUPLICATE KEY UPDATE` 구문을 사용하여
            # 레코드가 없으면 삽입하고, 있으면 업데이트하도록 처리합니다.
            # `emp_no`는 `NOT NULL`이므로, LLM 자동 생성 답변의 경우 기본 관리자 emp_no 1번을 사용합니다.
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
        print(f"DEBUG: query_no {input.query_no} 답변이 성공적으로 저장/업데이트되었습니다.")
        return {"success": True}
    except Exception as e:
        print(f"ERROR: 답변 저장 실패: {e}")
        conn.rollback() # 오류 발생 시 롤백
        return {"success": False}
    finally:
        conn.close()