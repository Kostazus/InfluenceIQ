from fastapi import HTTPException, Depends
from fastapi.routing import APIRouter
from fastapi.security import OAuth2PasswordBearer
from backend.schemas.auth import UserRegister, UserLogin, Token, UserOut
from backend.services.auth import hash_password, verify_password, create_token, decode_token
import aiosqlite
from backend.storage.db import DB_PATH

router = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")


@router.post("/register", response_model=Token)
async def register(data: UserRegister):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT id FROM users WHERE email = ?", (data.email,))
        existing = await cursor.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email уже занят")

        hashed = hash_password(data.password)
        cursor = await db.execute(
            "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
            (data.email, hashed, data.name)
        )
        await db.commit()
        user_id = cursor.lastrowid

        token = create_token(user_id, data.email)
        return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT id, password_hash FROM users WHERE email = ?", (data.email,)
        )
        user = await cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Неверный email или пароль")

        if not verify_password(data.password, user[1]):
            raise HTTPException(status_code=401, detail="Неверный email или пароль")

        token = create_token(user[0], data.email)
        return Token(access_token=token)


@router.get("/me", response_model=UserOut)
async def me(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Недействительный токен")

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT id, email, name FROM users WHERE id = ?", (payload["sub"],)
        )
        user = await cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")

        return UserOut(id=user[0], email=user[1], name=user[2])
