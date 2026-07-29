"""节假日 API 路由"""
from sanic import Blueprint
from sanic.response import json

from services.holiday_service import HolidayService

holidays_bp = Blueprint("holidays", url_prefix="/api/holidays")


@holidays_bp.get("/")
async def get_holidays(request):
    """获取节假日数据 GET /api/holidays?year=2026"""
    try:
        year = int(request.args.get("year", 2026))
    except ValueError:
        return json({"success": False, "error": "无效的年份"}, status=400)

    try:
        data = await HolidayService.get_holidays(year)
        return json({"success": True, "data": data})
    except Exception as e:
        return json({"success": False, "error": str(e)}, status=502)
