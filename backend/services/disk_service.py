"""磁盘管理服务"""
from __future__ import annotations

import psutil
import platform
from pathlib import Path


class DiskService:
    """提供磁盘和系统信息服务"""

    @staticmethod
    def get_partitions() -> list[dict]:
        """获取所有磁盘分区信息"""
        partitions = []
        for part in psutil.disk_partitions(all=False):
            try:
                usage = psutil.disk_usage(part.mountpoint)
                partitions.append({
                    "device": part.device,
                    "mountpoint": part.mountpoint,
                    "fstype": part.fstype,
                    "opts": part.opts,
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "percent": usage.percent,
                })
            except PermissionError:
                partitions.append({
                    "device": part.device,
                    "mountpoint": part.mountpoint,
                    "fstype": part.fstype,
                    "opts": part.opts,
                    "total": 0,
                    "used": 0,
                    "free": 0,
                    "percent": 0,
                })
        return partitions

    @staticmethod
    def get_disk_usage(path: str = "/") -> dict:
        """获取指定路径的磁盘使用情况"""
        usage = psutil.disk_usage(path)
        return {
            "path": path,
            "total": usage.total,
            "used": usage.used,
            "free": usage.free,
            "percent": usage.percent,
        }

    @staticmethod
    def get_disk_io() -> dict:
        """获取磁盘IO统计"""
        io = psutil.disk_io_counters(perdisk=False)
        if io:
            return {
                "read_count": io.read_count,
                "write_count": io.write_count,
                "read_bytes": io.read_bytes,
                "write_bytes": io.write_bytes,
                "read_time": io.read_time,
                "write_time": io.write_time,
            }
        return {}

    @staticmethod
    def get_disk_io_per_disk() -> dict:
        """获取每个磁盘的IO统计"""
        io_per_disk = psutil.disk_io_counters(perdisk=True)
        result = {}
        if io_per_disk:
            for disk, io in io_per_disk.items():
                result[disk] = {
                    "read_count": io.read_count,
                    "write_count": io.write_count,
                    "read_bytes": io.read_bytes,
                    "write_bytes": io.write_bytes,
                    "read_time": io.read_time,
                    "write_time": io.write_time,
                }
        return result

    @staticmethod
    def get_system_info() -> dict:
        """获取系统基本信息"""
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()
        return {
            "platform": platform.system(),
            "platform_release": platform.release(),
            "platform_version": platform.version(),
            "architecture": platform.machine(),
            "hostname": platform.node(),
            "processor": platform.processor(),
            "cpu_count": psutil.cpu_count(logical=True),
            "cpu_count_physical": psutil.cpu_count(logical=False),
            "memory_total": mem.total,
            "memory_available": mem.available,
            "memory_percent": mem.percent,
            "swap_total": swap.total,
            "swap_used": swap.used,
            "swap_percent": swap.percent,
            "boot_time": psutil.boot_time(),
        }
