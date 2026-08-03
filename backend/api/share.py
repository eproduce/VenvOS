"""文件共享 API 路由"""
from sanic import Blueprint
from sanic.response import json

from services.share_service import ShareService

share_bp = Blueprint("share", url_prefix="/api/share")


@share_bp.get("/")
async def list_shares(request):
    shares = ShareService.list_shares()
    return json({"success": True, "data": shares})


@share_bp.post("/")
async def create_share(request):
    data = request.json or {}
    name = (data.get("name") or "").strip()
    path = (data.get("path") or "").strip()
    protocol = (data.get("protocol") or "SMB").strip()
    read_only = data.get("read_only", False)
    allowed_users = data.get("allowed_users", [])
    comment = data.get("comment", "")

    if not name or not path:
        return json({"success": False, "error": "名称和路径不能为空"}, status=400)

    result = ShareService.create_share(name, path, protocol, read_only, allowed_users, comment)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@share_bp.put("/<name:str>")
async def update_share(request, name):
    data = request.json or {}
    result = ShareService.update_share(name, data)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@share_bp.delete("/<name:str>")
async def delete_share(request, name):
    result = ShareService.delete_share(name)
    return json({"success": True, "data": result})


@share_bp.post("/<name:str>/toggle")
async def toggle_share(request, name):
    result = ShareService.toggle_share(name)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@share_bp.get("/<name:str>/status")
async def share_status(request, name):
    result = ShareService.get_share_status(name)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=404)
    return json({"success": True, "data": result})
