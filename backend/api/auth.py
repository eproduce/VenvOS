"""认证与用户 API 路由"""
from sanic import Blueprint
from sanic.response import json
from sanic.exceptions import Unauthorized

from services.auth_service import AuthService

auth_bp = Blueprint("auth", url_prefix="/api/auth")


def get_token(request) -> str:
    """从请求头中提取 Token"""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return ""


async def require_auth(request):
    """中间件：验证登录态"""
    token = get_token(request)
    if not token:
        raise Unauthorized("未登录")
    user = await AuthService.get_user_by_token(token)
    if not user:
        raise Unauthorized("登录已过期")
    request.ctx.user = user


# ==================== 公开接口（无需登录） ====================

@auth_bp.post("/register")
async def register(request):
    data = request.json or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "")
    display_name = (data.get("display_name") or "").strip()

    if not username or not password:
        return json({"success": False, "error": "用户名和密码不能为空"}, status=400)
    if len(password) < 4:
        return json({"success": False, "error": "密码至少4位"}, status=400)

    result = await AuthService.register(username, password, display_name)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True, "data": result})


@auth_bp.post("/login")
async def login(request):
    data = request.json or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return json({"success": False, "error": "用户名和密码不能为空"}, status=400)

    result = await AuthService.login(username, password)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=401)
    return json({"success": True, "data": result})


@auth_bp.post("/logout")
async def logout(request):
    token = get_token(request)
    if token:
        await AuthService.logout(token)
    return json({"success": True})


# ==================== 需要登录的接口 ====================

@auth_bp.get("/me")
async def get_me(request):
    await require_auth(request)
    return json({"success": True, "data": AuthService._user_to_dict(request.ctx.user)})


@auth_bp.put("/password")
async def change_password(request):
    await require_auth(request)
    data = request.json or {}
    old = data.get("old_password", "")
    new = data.get("new_password", "")
    if not old or not new:
        return json({"success": False, "error": "缺少参数"}, status=400)
    result = await AuthService.change_password(request.ctx.user.id, old, new)
    if "error" in result:
        return json({"success": False, "error": result["error"]}, status=400)
    return json({"success": True})


@auth_bp.get("/users")
async def list_users(request):
    await require_auth(request)
    if request.ctx.user.role.value != "admin":
        return json({"success": False, "error": "无权限"}, status=403)
    users = await AuthService.get_users()
    return json({"success": True, "data": users})


@auth_bp.delete("/users/<user_id:int>")
async def delete_user(request, user_id):
    await require_auth(request)
    if request.ctx.user.role.value != "admin":
        return json({"success": False, "error": "无权限"}, status=403)
    result = await AuthService.delete_user(user_id)
    return json({"success": True, "data": result})


# ==================== 设置接口 ====================

@auth_bp.get("/settings")
async def get_settings(request):
    await require_auth(request)
    settings = await AuthService.get_settings(request.ctx.user.id)
    return json({"success": True, "data": settings})


@auth_bp.put("/settings")
async def set_setting(request):
    await require_auth(request)
    data = request.json or {}
    key = data.get("key", "")
    value = data.get("value", "")
    if not key:
        return json({"success": False, "error": "缺少 key"}, status=400)
    await AuthService.set_setting(request.ctx.user.id, key, str(value))
    return json({"success": True})


# ==================== 通知接口 ====================

@auth_bp.get("/notifications")
async def get_notifications(request):
    await require_auth(request)
    notifs = await AuthService.get_notifications(request.ctx.user.id)
    return json({"success": True, "data": notifs})


@auth_bp.put("/notifications/<notif_id:int>/read")
async def mark_read(request, notif_id):
    await require_auth(request)
    await AuthService.mark_notification_read(notif_id)
    return json({"success": True})
