"""认证与用户服务"""
from __future__ import annotations

import hashlib
import os
import secrets
import datetime
from pathlib import Path

import bcrypt

from sqlalchemy import select, delete

from database import async_session
from models import User, UserSession, UserRole, UserSetting, Notification


class AuthService:

    SESSION_DAYS = 7  # Token 有效期 7 天

    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))

    @staticmethod
    def generate_token() -> str:
        return secrets.token_hex(32)

    @classmethod
    async def create_admin_if_not_exists(cls, username="admin", password="admin"):
        """初始化管理员账号"""
        async with async_session() as db:
            existing = (await db.execute(select(User).where(User.username == username))).scalar()
            if existing:
                return
            user = User(
                username=username,
                password_hash=cls.hash_password(password),
                display_name="管理员",
                role=UserRole.admin,
                home_dir=str(Path.home()),
            )
            db.add(user)
            await db.commit()

    @classmethod
    async def register(cls, username: str, password: str, display_name: str = "") -> dict:
        async with async_session() as db:
            existing = (await db.execute(select(User).where(User.username == username))).scalar()
            if existing:
                return {"error": "用户名已存在"}

            home = str(Path.home() / username)
            user = User(
                username=username,
                password_hash=cls.hash_password(password),
                display_name=display_name or username,
                role=UserRole.user,
                home_dir=home,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

            # 创建家目录
            Path(home).mkdir(parents=True, exist_ok=True)

            return {"success": True, "user": cls._user_to_dict(user)}

    @classmethod
    async def login(cls, username: str, password: str) -> dict:
        async with async_session() as db:
            user = (await db.execute(select(User).where(User.username == username))).scalar()
            if not user:
                return {"error": "用户名或密码错误"}
            if not cls.verify_password(password, user.password_hash):
                return {"error": "用户名或密码错误"}

            # 更新最后登录时间
            user.last_login = datetime.datetime.utcnow()

            # 创建 session token
            token = cls.generate_token()
            session = UserSession(
                user_id=user.id,
                token=token,
                expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=cls.SESSION_DAYS),
            )
            db.add(session)
            await db.commit()

            return {"success": True, "token": token, "user": cls._user_to_dict(user)}

    @classmethod
    async def logout(cls, token: str) -> dict:
        async with async_session() as db:
            await db.execute(delete(UserSession).where(UserSession.token == token))
            await db.commit()
            return {"success": True}

    @classmethod
    async def get_user_by_token(cls, token: str) -> User | None:
        async with async_session() as db:
            session = (await db.execute(
                select(UserSession).where(
                    UserSession.token == token,
                    UserSession.is_active == True,
                    UserSession.expires_at > datetime.datetime.utcnow(),
                )
            )).scalar()
            if not session:
                return None
            user = (await db.execute(select(User).where(User.id == session.user_id))).scalar()
            return user

    @classmethod
    async def change_password(cls, user_id: int, old_password: str, new_password: str) -> dict:
        async with async_session() as db:
            user = (await db.execute(select(User).where(User.id == user_id))).scalar()
            if not user:
                return {"error": "用户不存在"}
            if not cls.verify_password(old_password, user.password_hash):
                return {"error": "原密码错误"}
            user.password_hash = cls.hash_password(new_password)
            await db.commit()
            return {"success": True}

    @classmethod
    async def get_users(cls) -> list[dict]:
        async with async_session() as db:
            users = (await db.execute(select(User).order_by(User.id))).scalars().all()
            return [cls._user_to_dict(u) for u in users]

    @classmethod
    async def delete_user(cls, user_id: int) -> dict:
        async with async_session() as db:
            user = (await db.execute(select(User).where(User.id == user_id))).scalar()
            if not user:
                return {"error": "用户不存在"}
            await db.delete(user)
            await db.commit()
            return {"success": True}

    @classmethod
    async def get_settings(cls, user_id: int) -> dict:
        async with async_session() as db:
            settings = (await db.execute(
                select(UserSetting).where(UserSetting.user_id == user_id)
            )).scalars().all()
            return {s.key: s.value for s in settings}

    @classmethod
    async def set_setting(cls, user_id: int, key: str, value: str) -> dict:
        async with async_session() as db:
            setting = (await db.execute(
                select(UserSetting).where(
                    UserSetting.user_id == user_id,
                    UserSetting.key == key,
                )
            )).scalar()
            if setting:
                setting.value = value
            else:
                setting = UserSetting(user_id=user_id, key=key, value=value)
                db.add(setting)
            await db.commit()
            return {"success": True}

    @classmethod
    async def get_notifications(cls, user_id: int, limit: int = 50) -> list[dict]:
        async with async_session() as db:
            notifs = (await db.execute(
                select(Notification)
                .where(Notification.user_id == user_id)
                .order_by(Notification.created_at.desc())
                .limit(limit)
            )).scalars().all()
            return [cls._notif_to_dict(n) for n in notifs]

    @classmethod
    async def mark_notification_read(cls, notif_id: int) -> dict:
        async with async_session() as db:
            notif = (await db.execute(select(Notification).where(Notification.id == notif_id))).scalar()
            if notif:
                notif.is_read = True
                await db.commit()
            return {"success": True}

    @classmethod
    async def add_notification(cls, user_id: int, title: str, body: str = "", level: str = "info") -> dict:
        async with async_session() as db:
            notif = Notification(user_id=user_id, title=title, body=body, level=level)
            db.add(notif)
            await db.commit()
            return {"success": True}

    @staticmethod
    def _user_to_dict(user: User) -> dict:
        return {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "role": user.role.value if user.role else "user",
            "home_dir": user.home_dir,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
        }

    @staticmethod
    def _notif_to_dict(notif: Notification) -> dict:
        return {
            "id": notif.id,
            "title": notif.title,
            "body": notif.body,
            "level": notif.level,
            "is_read": notif.is_read,
            "created_at": notif.created_at.isoformat() if notif.created_at else None,
        }
