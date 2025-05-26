from typing import List, Dict, Any
from models.database import Database


class EmployeeService:
    def __init__(self):
        self.db = Database()

    def get_all_employees(self) -> List[Dict[str, Any]]:
        return self.db.get_all_employees()
