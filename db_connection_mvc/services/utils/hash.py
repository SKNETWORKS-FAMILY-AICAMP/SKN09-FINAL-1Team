import bcrypt

def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password: str, stored_password: str) -> bool:
    return plain_password == stored_password


