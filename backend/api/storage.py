"""存储管理 API 路由"""
from sanic import Blueprint
from sanic.response import json

from services.storage_service import StorageService

storage_bp = Blueprint("storage", url_prefix="/api/storage")


# ==================== 存储概览 ====================

@storage_bp.get("/summary")
async def storage_summary(request):
    data = StorageService.get_storage_summary()
    return json({"success": True, "data": data})


# ==================== 存储池 ====================

@storage_bp.get("/pools")
async def list_pools(request):
    pools = StorageService.list_pools()
    return json({"success": True, "data": pools})


@storage_bp.post("/pools")
async def create_pool(request):
    data = request.json or {}
    name = (data.get("name") or "").strip()
    if not name:
        return json({"success": False, "error": "缺少存储池名称"}, status=400)
    result = StorageService.create_pool(name)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@storage_bp.delete("/pools/<name:str>")
async def delete_pool(request, name):
    result = StorageService.delete_pool(name)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


# ==================== 卷 ====================

@storage_bp.get("/pools/<pool_name:str>/volumes")
async def list_volumes(request, pool_name):
    volumes = StorageService.list_volumes(pool_name)
    return json({"success": True, "data": volumes})


@storage_bp.post("/pools/<pool_name:str>/volumes")
async def create_volume(request, pool_name):
    data = request.json or {}
    name = (data.get("name") or "").strip()
    size = int(data.get("size_gb", 0))
    if not name:
        return json({"success": False, "error": "缺少卷名称"}, status=400)
    result = StorageService.create_volume(pool_name, name, size)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@storage_bp.delete("/pools/<pool_name:str>/volumes/<vol_name:str>")
async def delete_volume(request, pool_name, vol_name):
    result = StorageService.delete_volume(pool_name, vol_name)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


# ==================== 磁盘 ====================

@storage_bp.get("/disks")
async def list_disks(request):
    disks = StorageService.list_disks()
    return json({"success": True, "data": disks})


@storage_bp.get("/disks/<device:path>")
async def disk_detail(request, device):
    # URL 中的 / 需要处理
    device_path = "/" + device
    info = StorageService.get_disk_detail(device_path)
    return json({"success": True, "data": info})
