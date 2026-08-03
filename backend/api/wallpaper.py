"""壁纸图片 API"""
from pathlib import Path

from sanic import Blueprint
from sanic.response import json, file as sanic_file

WP_DIR = Path(__file__).parent.parent / "wallpapers"

wallpaper_bp = Blueprint("wallpaper", url_prefix="/api/wallpaper")


@wallpaper_bp.get("/list")
async def list_wallpapers(request):
    """列出所有壁纸图片"""
    images = []
    if WP_DIR.exists():
        for f in sorted(WP_DIR.iterdir()):
            if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
                images.append({"name": f.stem, "file": f.name, "size": f.stat().st_size})
    return json({"success": True, "data": images})


@wallpaper_bp.get("/thumb/<filename:str>")
async def thumbnail(request, filename):
    """提供壁纸缩略图（200px宽）"""
    # 直接返回原图，前端CSS控制大小
    path = WP_DIR / filename
    if not path.exists():
        return json({"error": "not found"}, status=404)
    return await sanic_file(str(path))


@wallpaper_bp.get("/image/<filename:str>")
async def full_image(request, filename):
    """提供完整壁纸图片"""
    path = WP_DIR / filename
    if not path.exists():
        return json({"error": "not found"}, status=404)
    return await sanic_file(str(path))
