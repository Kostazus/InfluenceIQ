from fastapi import HTTPException, Depends, Request
from fastapi.responses import FileResponse
from fastapi.routing import APIRouter
from fastapi.security import OAuth2PasswordBearer
from backend.schemas.auth import UserRegister, UserLogin, Token, UserOut
from backend.services.auth import hash_password, verify_password, create_token, decode_token
from backend.services.email import send_password_reset
import aiosqlite
import secrets
import re
from datetime import datetime, timedelta
from backend.storage.db import DB_PATH

router = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@router.post("/register", response_model=Token)
async def register(data: UserRegister):
    # Валидация формата email
    if not EMAIL_RE.match(data.email):
        raise HTTPException(status_code=400, detail="Некорректный формат email")

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Пароль должен быть не менее 6 символов")

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT id FROM users WHERE email = ?", (data.email,))
        existing = await cursor.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email уже занят")

        hashed = hash_password(data.password)

        count = (await (await db.execute("SELECT COUNT(*) FROM users")).fetchone())[0]
        is_admin = 1 if count == 0 else 0

        cursor = await db.execute(
            "INSERT INTO users (email, password_hash, name, is_admin, is_verified) VALUES (?, ?, ?, ?, 1)",
            (data.email, hashed, data.name, is_admin)
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


# ── Сброс пароля ──────────────────────────────────────────────

@router.post("/forgot-password")
async def forgot_password(request: Request):
    body = await request.json()
    email = (body.get("email") or "").strip().lower()

    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Некорректный email")

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT id FROM users WHERE email=?", (email,))
        user = await cursor.fetchone()

    # Всегда возвращаем 200 — не раскрываем существование email
    if not user:
        return {"ok": True, "message": "Если email зарегистрирован — письмо отправлено"}

    user_id = user[0]
    token = secrets.token_urlsafe(32)
    expires = (datetime.utcnow() + timedelta(hours=1)).isoformat()

    async with aiosqlite.connect(DB_PATH) as db:
        # Удаляем старые токены этого пользователя
        await db.execute("DELETE FROM reset_tokens WHERE user_id=?", (user_id,))
        await db.execute(
            "INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?,?,?)",
            (user_id, token, expires),
        )
        await db.commit()

    send_password_reset(email, token)
    return {"ok": True, "message": "Если email зарегистрирован — письмо отправлено"}


@router.post("/reset-password")
async def reset_password(request: Request):
    body = await request.json()
    token    = (body.get("token") or "").strip()
    new_pass = (body.get("password") or "").strip()

    if not token:
        raise HTTPException(status_code=400, detail="Токен обязателен")
    if len(new_pass) < 6:
        raise HTTPException(status_code=400, detail="Пароль должен быть не менее 6 символов")

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT user_id, expires_at, used FROM reset_tokens WHERE token=?", (token,)
        )
        row = await cursor.fetchone()

    if not row:
        raise HTTPException(status_code=400, detail="Неверный или истёкший токен")

    user_id, expires_at, used = row
    if used:
        raise HTTPException(status_code=400, detail="Токен уже был использован")
    if datetime.utcnow() > datetime.fromisoformat(expires_at):
        raise HTTPException(status_code=400, detail="Токен истёк. Запросите новый")

    hashed = hash_password(new_pass)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE users SET password_hash=? WHERE id=?", (hashed, user_id))
        await db.execute("UPDATE reset_tokens SET used=1 WHERE token=?", (token,))
        await db.commit()

    return {"ok": True, "message": "Пароль успешно изменён"}


# ── Страница сброса пароля ────────────────────────────────────
@router.get("/reset-password", include_in_schema=False)
async def reset_password_page():
    """Отдаём главную страницу — JS на ней обработает ?token= из URL."""
    return FileResponse("frontend/templates/index.html")
