"""
Сервис отправки email через SMTP.

Если SMTP не настроен — ссылка логируется в консоль (видна в Railway logs),
администратор может передать её пользователю вручную.

Переменные окружения (добавить в .env / Railway):
    SMTP_HOST   = smtp.gmail.com
    SMTP_PORT   = 587
    SMTP_USER   = your@gmail.com
    SMTP_PASS   = app-password   (Gmail: Настройки → Безопасность → Пароли приложений)
    APP_URL     = https://your-app.railway.app
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("influenceiq.email")

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
APP_URL   = os.getenv("APP_URL", "http://localhost:8000")


def _smtp_configured() -> bool:
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASS)


def _send(to: str, subject: str, html: str) -> bool:
    """Отправить письмо. Возвращает True если успешно."""
    if not _smtp_configured():
        logger.warning(
            "SMTP не настроен. Письмо НЕ отправлено для %s. Subject: %s", to, subject
        )
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = SMTP_USER
    msg["To"]      = to
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to, msg.as_string())
        logger.info("Email отправлен: %s → %s", subject, to)
        return True
    except Exception as exc:
        logger.error("Ошибка отправки email для %s: %s", to, exc)
        return False


def send_password_reset(to: str, token: str) -> bool:
    link = f"{APP_URL}/reset-password?token={token}"

    # Логируем ссылку в любом случае — видна в Railway logs
    logger.info("RESET LINK для %s: %s", to, link)

    html = f"""
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#000">Сброс пароля — InfluenceIQ</h2>
      <p>Вы запросили сброс пароля. Нажмите кнопку ниже:</p>
      <a href="{link}"
         style="display:inline-block;padding:12px 28px;background:#000;color:#fff;
                border-radius:10px;text-decoration:none;font-weight:600;margin:16px 0">
        Сбросить пароль
      </a>
      <p style="color:#666;font-size:13px">Ссылка действительна 1 час.<br>
         Если вы не запрашивали сброс — просто проигнорируйте это письмо.</p>
    </div>
    """
    return _send(to, "Сброс пароля — InfluenceIQ", html)


def send_verification(to: str, token: str) -> bool:
    link = f"{APP_URL}/verify-email?token={token}"
    logger.info("VERIFY LINK для %s: %s", to, link)

    html = f"""
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#000">Подтвердите email — InfluenceIQ</h2>
      <p>Нажмите кнопку чтобы подтвердить вашу почту:</p>
      <a href="{link}"
         style="display:inline-block;padding:12px 28px;background:#000;color:#fff;
                border-radius:10px;text-decoration:none;font-weight:600;margin:16px 0">
        Подтвердить email
      </a>
      <p style="color:#666;font-size:13px">Ссылка действительна 24 часа.</p>
    </div>
    """
    return _send(to, "Подтверждение email — InfluenceIQ", html)
