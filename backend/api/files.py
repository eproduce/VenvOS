"""文件管理 API 路由"""
from sanic import Blueprint
from sanic.response import json
from sanic.exceptions import InvalidUsage

from services.file_service import FileService

files_bp = Blueprint("files", url_prefix="/api/files")


@files_bp.get("/list")
async def list_directory(request):
    """列出目录内容 GET /api/files/list?path=/"""
    path = request.args.get("path", "/")
    items = FileService.list_directory(path)
    return json({"success": True, "data": items, "path": path})


@files_bp.get("/info")
async def file_info(request):
    """获取文件信息 GET /api/files/info?path=/path/to/file"""
    path = request.args.get("path")
    if not path:
        raise InvalidUsage("缺少 path 参数")
    info = FileService.get_file_info(path)
    if info is None:
        return json({"success": False, "error": "路径不存在"}, status=404)
    return json({"success": True, "data": info})


@files_bp.post("/directory")
async def create_directory(request):
    """创建目录 POST /api/files/directory  body: {path: "..."}"""
    data = request.json or {}
    path = data.get("path")
    if not path:
        raise InvalidUsage("缺少 path 参数")
    result = FileService.create_directory(path)
    return json({"success": True, "data": result})


@files_bp.post("/file")
async def create_file(request):
    """创建文件 POST /api/files/file  body: {path: "...", content: "..."}"""
    data = request.json or {}
    path = data.get("path")
    content = data.get("content", "")
    if not path:
        raise InvalidUsage("缺少 path 参数")
    result = FileService.create_file(path, content)
    return json({"success": True, "data": result})


@files_bp.get("/read")
async def read_file(request):
    """读取文件 GET /api/files/read?path=/path/to/file"""
    path = request.args.get("path")
    if not path:
        raise InvalidUsage("缺少 path 参数")
    result = FileService.read_file(path)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=404)
    return json({"success": True, "data": result})


@files_bp.put("/write")
async def write_file(request):
    """写入文件 PUT /api/files/write  body: {path: "...", content: "..."}"""
    data = request.json or {}
    path = data.get("path")
    content = data.get("content", "")
    if not path:
        raise InvalidUsage("缺少 path 参数")
    result = FileService.write_file(path, content)
    return json({"success": True, "data": result})


@files_bp.delete("/delete")
async def delete_item(request):
    """删除文件或目录 DELETE /api/files/delete  body: {path: "..."}"""
    data = request.json or {}
    path = data.get("path")
    if not path:
        raise InvalidUsage("缺少 path 参数")
    result = FileService.delete_item(path)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@files_bp.put("/rename")
async def rename_item(request):
    """重命名 PUT /api/files/rename  body: {path: "...", new_name: "..."}"""
    data = request.json or {}
    path = data.get("path")
    new_name = data.get("new_name")
    if not path or not new_name:
        raise InvalidUsage("缺少 path 或 new_name 参数")
    result = FileService.rename_item(path, new_name)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@files_bp.post("/move")
async def move_item(request):
    """移动文件 POST /api/files/move  body: {src: "...", dst: "..."}"""
    data = request.json or {}
    src = data.get("src")
    dst = data.get("dst")
    if not src or not dst:
        raise InvalidUsage("缺少 src 或 dst 参数")
    result = FileService.move_item(src, dst)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@files_bp.post("/copy")
async def copy_item(request):
    """复制文件 POST /api/files/copy  body: {src: "...", dst: "..."}"""
    data = request.json or {}
    src = data.get("src")
    dst = data.get("dst")
    if not src or not dst:
        raise InvalidUsage("缺少 src 或 dst 参数")
    result = FileService.copy_item(src, dst)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@files_bp.get("/search")
async def search_files(request):
    """搜索文件 GET /api/files/search?path=/&query=keyword"""
    path = request.args.get("path", "/")
    query = request.args.get("query", "")
    if not query:
        return json({"success": True, "data": []})
    results = FileService.search_files(path, query)
    return json({"success": True, "data": results})
