from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    
class UserLogin(BaseModel):
    email: str
    pasword: str
    
class token(BaseModel):
    acces_token: str
    token_type: str = "bearer"
    
class UserOut(BaseModel):
    id: int
    email: str
    name: str