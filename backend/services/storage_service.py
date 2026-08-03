"""存储管理服务 — 存储池、卷、S.M.A.R.T. 健康"""
from __future__ import annotations

import os
import subprocess
import shutil
from pathlib import Path
from datetime import datetime

import psutil


class StorageService:
    """存储池与卷管理"""

    POOLS_DIR = Path("/tmp/venvos-pools")  # 模拟存储池目录

    @classmethod
    def _ensure_pools_dir(cls):
        cls.POOLS_DIR.mkdir(parents=True, exist_ok=True)

    # ==================== 存储池 ====================

    @classmethod
    def list_pools(cls) -> list[dict]:
        """列出所有存储池"""
        cls._ensure_pools_dir()
        pools = []
        for item in sorted(cls.POOLS_DIR.iterdir()):
            if item.is_dir():
                usage = shutil.disk_usage(str(item))
                pools.append({
                    "name": item.name,
                    "path": str(item),
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "created": datetime.fromtimestamp(item.stat().st_ctime).isoformat(),
                })
        return pools

    @classmethod
    def create_pool(cls, name: str, disks: list[str] = None) -> dict:
        """创建存储池"""
        cls._ensure_pools_dir()
        pool_path = cls.POOLS_DIR / name
        if pool_path.exists():
            return {"error": "存储池已存在"}
        pool_path.mkdir(parents=True)
        return {"success": True, "name": name, "path": str(pool_path)}

    @classmethod
    def delete_pool(cls, name: str) -> dict:
        """删除存储池"""
        pool_path = cls.POOLS_DIR / name
        if not pool_path.exists():
            return {"error": "存储池不存在"}
        shutil.rmtree(str(pool_path))
        return {"success": True}

    # ==================== 卷 / 数据集 ====================

    @classmethod
    def list_volumes(cls, pool_name: str) -> list[dict]:
        """列出存储池下的所有卷"""
        pool_path = cls.POOLS_DIR / pool_name
        if not pool_path.exists():
            return []
        volumes = []
        for item in sorted(pool_path.iterdir()):
            if item.is_dir():
                usage = shutil.disk_usage(str(item))
                volumes.append({
                    "name": item.name,
                    "path": str(item),
                    "pool": pool_name,
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "created": datetime.fromtimestamp(item.stat().st_ctime).isoformat(),
                })
        return volumes

    @classmethod
    def create_volume(cls, pool_name: str, volume_name: str, size_gb: int = 0) -> dict:
        """在存储池中创建卷"""
        pool_path = cls.POOLS_DIR / pool_name
        if not pool_path.exists():
            return {"error": "存储池不存在"}
        vol_path = pool_path / volume_name
        if vol_path.exists():
            return {"error": "卷已存在"}
        vol_path.mkdir(parents=True)
        return {"success": True, "name": volume_name, "path": str(vol_path), "pool": pool_name}

    @classmethod
    def delete_volume(cls, pool_name: str, volume_name: str) -> dict:
        """删除卷"""
        vol_path = cls.POOLS_DIR / pool_name / volume_name
        if not vol_path.exists():
            return {"error": "卷不存在"}
        shutil.rmtree(str(vol_path))
        return {"success": True}

    # ==================== 物理磁盘 ====================

    @classmethod
    def list_disks(cls) -> list[dict]:
        """列出所有物理磁盘"""
        disks = []
        for part in psutil.disk_partitions(all=False):
            try:
                usage = psutil.disk_usage(part.mountpoint)
            except Exception:
                usage = None
            disks.append({
                "device": part.device,
                "mountpoint": part.mountpoint,
                "fstype": part.fstype or "unknown",
                "total": usage.total if usage else 0,
                "used": usage.used if usage else 0,
                "free": usage.free if usage else 0,
                "percent": usage.percent if usage else 0,
                "opts": part.opts,
                "health": cls._get_disk_health(part.device),
            })
        return disks

    @classmethod
    def _get_disk_health(cls, device: str) -> dict:
        """获取磁盘 S.M.A.R.T. 健康信息"""
        # macOS: 使用 diskutil info
        try:
            result = subprocess.run(
                ["diskutil", "info", device],
                capture_output=True, text=True, timeout=10
            )
            info = {}
            for line in result.stdout.split("\n"):
                line = line.strip()
                if "SMART Status" in line:
                    info["smart"] = line.split(":")[-1].strip()
                if "Disk Size" in line:
                    info["size"] = line.split(":")[-1].strip()
                if "Device / Media Name" in line:
                    info["model"] = line.split(":")[-1].strip()
            info["health"] = "ok" if info.get("smart") == "Verified" else "unknown"
            return info
        except Exception:
            return {"health": "unknown"}

    @classmethod
    def get_disk_detail(cls, device: str) -> dict:
        """获取单个磁盘详细信息"""
        try:
            result = subprocess.run(
                ["diskutil", "info", device],
                capture_output=True, text=True, timeout=10
            )
            lines = result.stdout.strip().split("\n")
            info = {"device": device}
            for line in lines:
                if ":" in line:
                    key, val = line.split(":", 1)
                    key = key.strip().lower().replace(" ", "_")
                    val = val.strip()
                    info[key] = val

            # 获取分区使用情况
            for part in psutil.disk_partitions(all=False):
                if part.device == device or device in part.device:
                    try:
                        usage = psutil.disk_usage(part.mountpoint)
                        info["mountpoint"] = part.mountpoint
                        info["total"] = usage.total
                        info["used"] = usage.used
                        info["free"] = usage.free
                        info["percent"] = usage.percent
                    except Exception:
                        pass
            return info
        except Exception as e:
            return {"device": device, "error": str(e)}

    # ==================== 存储概览 ====================

    @classmethod
    def get_storage_summary(cls) -> dict:
        """存储概览仪表盘数据"""
        pools = cls.list_pools()
        disks = cls.list_disks()

        total_pool = sum(p["total"] for p in pools)
        used_pool = sum(p["used"] for p in pools)

        total_disk = sum(d["total"] for d in disks)
        healthy_disks = sum(1 for d in disks if d.get("health", {}).get("health") == "ok")
        warning_disks = sum(1 for d in disks if d.get("health", {}).get("health") == "unknown")

        return {
            "pools_count": len(pools),
            "pools_total": total_pool,
            "pools_used": used_pool,
            "pools_free": total_pool - used_pool,
            "disks_count": len(disks),
            "disks_total": total_disk,
            "disks_healthy": healthy_disks,
            "disks_warning": warning_disks,
        }
