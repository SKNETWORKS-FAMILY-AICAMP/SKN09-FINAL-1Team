from typing import List, Dict, Any, Optional
from models.database import Database
from datetime import date


class CallService:
    def __init__(self):
        self.db = Database()

    def _format_success(
        self, message: str, data: Optional[Any] = None, count: int = 0
    ) -> Dict[str, Any]:
        return {"status": "success", "message": message, "data": data, "count": count}

    def _format_error(
        self, message: str, data: Optional[Any] = None, count: int = 0
    ) -> Dict[str, Any]:
        return {"status": "error", "message": message, "data": data, "count": count}

    async def save_call_info(
        self, emp_no: int, file_name: str, qna_list: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        try:
            result = await self.db.save_call_data(emp_no, file_name, qna_list)
            return self._format_success(
                message="통화 데이터가 성공적으로 저장되었습니다.",
                data={"call_no": result["call_no"]},
            )
        except Exception as e:
            return self._format_error(f"통화 데이터 저장 중 오류 발생: {str(e)}")
