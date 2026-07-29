/**
 * 节假日数据服务
 * 策略：后端 API → localStorage 缓存 → 硬编码降级
 */
import api from "./api.js";
import { setHolidaySchedule } from "./lunar.js";

const CACHE_KEY = "venvos-holiday-schedule";
const CACHE_VERSION = 1;

/**
 * 将后端返回的 JSON 转换为前端使用的 HOLIDAY_SCHEDULE 格式
 */
function parseHolidayData(data) {
  const schedule = {};
  if (!data || !data.holidays) return schedule;

  // 解析放假区间
  for (const h of data.holidays) {
    const start = new Date(h.start);
    const end = new Date(h.end);
    const current = new Date(start);
    while (current <= end) {
      const key = formatDateKey(current);
      schedule[key] = { name: h.name, type: "holiday" };
      current.setDate(current.getDate() + 1);
    }
  }

  // 解析补班日
  for (const w of data.workdays) {
    const key = w.date;
    schedule[key] = { name: w.name, type: "workday" };
  }

  return schedule;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 获取一年中所有需要覆盖的年份
 */
function getRelevantYears() {
  const current = new Date().getFullYear();
  return [current - 1, current, current + 1];
}

/**
 * 从后端加载节假日并合并到缓存
 */
async function fetchYearFromBackend(year) {
  try {
    const res = await api.get(`/api/holidays?year=${year}`);
    if (res.data?.success && res.data?.data) {
      return parseHolidayData(res.data.data);
    }
  } catch (e) {
    console.warn(`后端节假日 API 不可用 (${year}):`, e.message);
  }
  return null;
}

/**
 * 主加载函数：尝试从后端拉取所有年份，合并缓存
 */
export async function loadHolidaySchedule() {
  const years = getRelevantYears();
  let allSchedule = {};

  // 尝试从后端加载
  for (const year of years) {
    const schedule = await fetchYearFromBackend(year);
    if (schedule) {
      allSchedule = { ...allSchedule, ...schedule };
    }
  }

  // 如果有从后端获取的数据，更新缓存并注入 lunar.js
  if (Object.keys(allSchedule).length > 0) {
    const cache = {
      version: CACHE_VERSION,
      updated: new Date().toISOString(),
      schedule: allSchedule,
    };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {}
    setHolidaySchedule(allSchedule);
    return allSchedule;
  }

  // 尝试从 localStorage 缓存
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.version === CACHE_VERSION && parsed.schedule) {
        setHolidaySchedule(parsed.schedule);
        return parsed.schedule;
      }
    }
  } catch {}

  // 最终降级：lunar.js 自带硬编码数据
  return null;
}

/**
 * 导出当前有效的 schedule（初始化后使用）
 */
let _schedule = null;
let _loading = false;

export async function getSchedule() {
  if (_schedule) return _schedule;
  if (_loading) {
    // 等待加载完成
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (_schedule) { clearInterval(check); resolve(_schedule); }
      }, 50);
    });
  }
  _loading = true;
  _schedule = await loadHolidaySchedule();
  _loading = false;
  return _schedule;
}

/**
 * 清除缓存强制重新拉取
 */
export function invalidateCache() {
  _schedule = null;
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}
