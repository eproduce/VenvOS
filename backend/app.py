"""VenvOS - 网页版操作系统后端服务"""
import os
from pathlib import Path

from sanic import Sanic
from sanic.response import json, file
from sanic.exceptions import NotFound

from api.files import files_bp
from api.disks import disks_bp
from api.holidays import holidays_bp
from api.auth import auth_bp
from api.storage import storage_bp
from api.share import share_bp
from api.wallpaper import wallpaper_bp

from database import init_db
from services.auth_service import AuthService

# 获取前端构建目录（开发时指向 frontend 目录，生产时指向 dist）
BASE_DIR = Path(__file__).parent.parent
FRONTEND_DIR = BASE_DIR / "frontend" / "dist"
STATIC_DIR = BASE_DIR / "frontend"

app = Sanic("VenvOS")

# 注册 API 蓝图
app.blueprint(files_bp)
app.blueprint(disks_bp)
app.blueprint(holidays_bp)
app.blueprint(auth_bp)
app.blueprint(storage_bp)
app.blueprint(share_bp)
app.blueprint(wallpaper_bp)

# 启动时初始化数据库
@app.before_server_start
async def startup(app, _):
    await init_db()
    await AuthService.create_admin_if_not_exists()


# ==================== 静态文件服务 ====================

# 先尝试从 dist 目录提供（生产模式），否则从 frontend 目录（开发模式）
def get_static_root():
    if FRONTEND_DIR.exists():
        return FRONTEND_DIR
    return STATIC_DIR


app.static("/assets", str(get_static_root() / "src" / "assets"), name="assets")
app.static("/src", str(get_static_root() / "src"), name="src")


@app.get("/")
async def serve_index(request):
    """提供前端入口页面"""
    root = get_static_root()
    index_path = root / "index.html"
    if index_path.exists():
        return await file(str(index_path))
    return json({"message": "VenvOS API Server Running", "frontend": "请构建前端或直接访问 API"})


@app.get("/<path:path>")
async def serve_static(request, path):
    """提供静态文件"""
    root = get_static_root()
    file_path = root / path
    if file_path.exists() and file_path.is_file():
        return await file(str(file_path))
    # SPA fallback: 返回 index.html
    index_path = root / "index.html"
    if index_path.exists():
        return await file(str(index_path))
    raise NotFound("页面未找到")


# ==================== 健康检查 ====================

@app.get("/api/health")
async def health_check(request):
    return json({"status": "ok", "service": "VenvOS"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(
        host="0.0.0.0",
        port=port,
        dev=False,
        single_process=True,
    )
