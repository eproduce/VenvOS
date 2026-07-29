"""磁盘管理 API 路由"""
from sanic import Blueprint
from sanic.response import json

from services.disk_service import DiskService

disks_bp = Blueprint("disks", url_prefix="/api/disks")


@disks_bp.get("/partitions")
async def get_partitions(request):
    """获取所有分区信息 GET /api/disks/partitions"""
    partitions = DiskService.get_partitions()
    return json({"success": True, "data": partitions})


@disks_bp.get("/usage")
async def get_disk_usage(request):
    """获取磁盘使用情况 GET /api/disks/usage?path=/"""
    path = request.args.get("path", "/")
    usage = DiskService.get_disk_usage(path)
    return json({"success": True, "data": usage})


@disks_bp.get("/io")
async def get_disk_io(request):
    """获取磁盘IO统计 GET /api/disks/io"""
    io = DiskService.get_disk_io()
    return json({"success": True, "data": io})


@disks_bp.get("/io_per_disk")
async def get_disk_io_per_disk(request):
    """获取每个磁盘的IO统计 GET /api/disks/io_per_disk"""
    io_data = DiskService.get_disk_io_per_disk()
    return json({"success": True, "data": io_data})


@disks_bp.get("/system")
async def get_system_info(request):
    """获取系统信息 GET /api/disks/system"""
    info = DiskService.get_system_info()
    return json({"success": True, "data": info})
