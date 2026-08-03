"""文件共享服务 — SMB / NFS / WebDAV / FTP 配置管理"""
from __future__ import annotations

import json
import os
from pathlib import Path
from datetime import datetime

CONFIG_DIR = Path(__file__).parent.parent.parent / "data"
CONFIG_FILE = CONFIG_DIR / "shares.json"


class ShareService:
    """文件共享配置管理"""

    PROTOCOLS = ["SMB", "NFS", "WebDAV", "FTP"]

    @classmethod
    def _load(cls) -> dict:
        """加载共享配置"""
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        if CONFIG_FILE.exists():
            return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        return {"shares": []}

    @classmethod
    def _save(cls, data: dict):
        CONFIG_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    @classmethod
    def list_shares(cls) -> list[dict]:
        """列出所有共享"""
        data = cls._load()
        shares = data.get("shares", [])
        for s in shares:
            path = Path(s["path"])
            s["exists"] = path.exists()
            s["is_dir"] = path.is_dir() if path.exists() else False
        return shares

    @classmethod
    def create_share(cls, name: str, path: str, protocol: str, read_only: bool = False,
                     allowed_users: list[str] = None, comment: str = "") -> dict:
        """创建共享"""
        if protocol not in cls.PROTOCOLS:
            return {"error": f"不支持的协议: {protocol}"}

        target = Path(path).resolve()
        if not target.exists():
            target.mkdir(parents=True, exist_ok=True)

        data = cls._load()
        shares = data.get("shares", [])

        # 检查重名
        for s in shares:
            if s["name"] == name:
                return {"error": "共享名称已存在"}

        share = {
            "name": name,
            "path": str(target),
            "protocol": protocol,
            "read_only": read_only,
            "allowed_users": allowed_users or [],
            "comment": comment,
            "enabled": True,
            "created_at": datetime.now().isoformat(),
        }
        shares.append(share)
        data["shares"] = shares
        cls._save(data)
        return {"success": True, "share": share}

    @classmethod
    def update_share(cls, name: str, updates: dict) -> dict:
        """更新共享"""
        data = cls._load()
        for s in data.get("shares", []):
            if s["name"] == name:
                for key in ("read_only", "allowed_users", "comment", "enabled"):
                    if key in updates:
                        s[key] = updates[key]
                cls._save(data)
                return {"success": True, "share": s}
        return {"error": "共享不存在"}

    @classmethod
    def delete_share(cls, name: str) -> dict:
        """删除共享"""
        data = cls._load()
        data["shares"] = [s for s in data.get("shares", []) if s["name"] != name]
        cls._save(data)
        return {"success": True}

    @classmethod
    def toggle_share(cls, name: str) -> dict:
        """启用/禁用共享"""
        data = cls._load()
        for s in data.get("shares", []):
            if s["name"] == name:
                s["enabled"] = not s.get("enabled", True)
                cls._save(data)
                return {"success": True, "share": s}
        return {"error": "共享不存在"}

    @classmethod
    def get_share_status(cls, name: str) -> dict:
        """获取共享状态"""
        data = cls._load()
        for s in data.get("shares", []):
            if s["name"] == name:
                path = Path(s["path"])
                return {
                    "name": s["name"],
                    "protocol": s["protocol"],
                    "enabled": s.get("enabled", True),
                    "path_exists": path.exists(),
                    "clients": 0,  # 模拟
                    "throughput": "0 B/s",
                }
        return {"error": "共享不存在"}
