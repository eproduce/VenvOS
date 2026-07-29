"""节假日数据服务 — 从 globalholidayscalendar.com 抓取并缓存"""
from __future__ import annotations

import csv
import json
import os
import io
from datetime import datetime, timedelta
from pathlib import Path

import aiohttp

CACHE_DIR = Path(__file__).parent.parent / ".cache"
CACHE_TTL_HOURS = 24  # 缓存24小时


class HolidayService:
    CSV_URL = "https://oss.globalholidayscalendar.com/holidays/zh/china-public-holidays-{year}.csv"

    @staticmethod
    def _cache_path(year: int) -> Path:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        return CACHE_DIR / f"holidays-{year}.json"

    @staticmethod
    def _is_cache_valid(cache_path: Path) -> bool:
        if not cache_path.exists():
            return False
        mtime = datetime.fromtimestamp(cache_path.stat().st_mtime)
        return (datetime.now() - mtime) < timedelta(hours=CACHE_TTL_HOURS)

    @classmethod
    async def get_holidays(cls, year: int) -> dict:
        """获取指定年份的节假日数据，优先读缓存"""
        cache_path = cls._cache_path(year)

        # 检查缓存
        if cls._is_cache_valid(cache_path):
            return json.loads(cache_path.read_text(encoding="utf-8"))

        # 从网络抓取
        try:
            data = await cls._fetch_and_parse(year)
            cache_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            return data
        except Exception as e:
            # 如果抓取失败但缓存存在（可能过期），仍使用缓存
            if cache_path.exists():
                return json.loads(cache_path.read_text(encoding="utf-8"))
            raise e

    @classmethod
    async def _fetch_and_parse(cls, year: int) -> dict:
        url = cls.CSV_URL.format(year=year)
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    raise Exception(f"HTTP {resp.status}")
                text = await resp.text()

        return cls._parse_csv(text, year)

    @classmethod
    def _parse_csv(cls, text: str, year: int) -> dict:
        reader = csv.DictReader(io.StringIO(text))
        holidays = []
        workdays = []

        for row in reader:
            entry_type = row.get("type", "").strip()
            date_str = row.get("date", "").strip()
            end_date_str = row.get("end_date", "").strip()
            name = row.get("name", "").strip()

            if entry_type == "public_holiday":
                holidays.append({
                    "name": name,
                    "start": date_str,
                    "end": end_date_str or date_str,
                })
            elif entry_type == "makeup_workday":
                workdays.append({
                    "name": name,
                    "date": date_str,
                })

        return {
            "year": year,
            "source": f"https://globalholidayscalendar.com/zh/countries/china/{year}",
            "updated": datetime.now().isoformat(),
            "holidays": holidays,
            "workdays": workdays,
        }

    @classmethod
    async def get_years_available(cls) -> list[int]:
        """探测哪些年份有数据（当前年 ±2）"""
        current = datetime.now().year
        years = []
        for y in range(current - 1, current + 3):
            try:
                await cls.get_holidays(y)
                years.append(y)
            except Exception:
                pass
        return years
