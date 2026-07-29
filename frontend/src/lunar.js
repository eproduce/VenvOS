/**
 * 中国农历 + 节假日工具
 * 使用预计算数据覆盖 2024-2030 年
 */

// 农历每月天数（闰月用负数表示）
// 数据格式：每个数字编码 (闰月 << 5) | 大小月，每年 12-13 个月
// 此处使用简化查表法，基于 1900-2100 年农历数据
const LUNAR_INFO = [
  // year, leapMonth, daysOfYear(hex encoded)
  // 数据来源：香港天文台农历数据
  { y: 2024, leap: 0, months: [29,30,29,30,29,29,30,29,30,29,30,29] },
  { y: 2025, leap: 6, months: [29,30,29,29,30,29,30,29,30,29,29,30,30] },
  { y: 2026, leap: 0, months: [29,29,30,29,30,29,29,30,29,30,29,30] },
  { y: 2027, leap: 0, months: [30,29,30,29,29,30,29,30,29,29,30,29] },
  { y: 2028, leap: 5, months: [30,29,30,29,29,30,29,29,30,30,29,30,29] },
  { y: 2029, leap: 0, months: [30,30,29,29,30,29,29,30,29,30,29,30] },
  { y: 2030, leap: 0, months: [29,30,30,29,29,30,29,30,29,30,29,29] },
];

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const ZODIAC = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];

// 农历月名
const LUNAR_MONTH_NAMES = ["","正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","冬月","腊月"];
const LUNAR_DAY_NAMES = [
  "","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
  "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
  "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"
];

// ==================== 中国节假日（公历 + 农历） ====================

// 公历节假日
const SOLAR_HOLIDAYS = {
  "0101": { name: "元旦", days: 1 },
  "0214": { name: "情人节", days: 0 },
  "0308": { name: "妇女节", days: 0 },
  "0312": { name: "植树节", days: 0 },
  "0401": { name: "愚人节", days: 0 },
  "0501": { name: "劳动节", days: 5 },
  "0504": { name: "青年节", days: 0 },
  "0601": { name: "儿童节", days: 0 },
  "0701": { name: "建党节", days: 0 },
  "0801": { name: "建军节", days: 0 },
  "0910": { name: "教师节", days: 0 },
  "1001": { name: "国庆节", days: 7 },
  "1031": { name: "万圣节", days: 0 },
  "1225": { name: "圣诞节", days: 0 },
};

// ==================== 中国放假 & 补班安排 ====================
// 数据来源：国务院办公厅放假通知
// type: "holiday" = 放假, "workday" = 调休补班
const HOLIDAY_SCHEDULE = {
  // ===== 2024 =====
  // 元旦: 2023-12-30 ~ 2024-01-01
  "2024-01-01": { name: "元旦", type: "holiday" },

  // 春节: 02-10 ~ 02-17 放假, 02-04(周日) 02-18(周日) 补班
  "2024-02-04": { name: "春节补班", type: "workday" },
  "2024-02-10": { name: "春节", type: "holiday" },
  "2024-02-11": { name: "春节", type: "holiday" },
  "2024-02-12": { name: "春节", type: "holiday" },
  "2024-02-13": { name: "春节", type: "holiday" },
  "2024-02-14": { name: "春节", type: "holiday" },
  "2024-02-15": { name: "春节", type: "holiday" },
  "2024-02-16": { name: "春节", type: "holiday" },
  "2024-02-17": { name: "春节", type: "holiday" },
  "2024-02-18": { name: "春节补班", type: "workday" },

  // 清明: 04-04 ~ 04-06, 04-07(周日) 补班
  "2024-04-04": { name: "清明节", type: "holiday" },
  "2024-04-05": { name: "清明节", type: "holiday" },
  "2024-04-06": { name: "清明节", type: "holiday" },
  "2024-04-07": { name: "清明补班", type: "workday" },

  // 劳动节: 05-01 ~ 05-05, 04-28(周日) 05-11(周六) 补班
  "2024-04-28": { name: "劳动节补班", type: "workday" },
  "2024-05-01": { name: "劳动节", type: "holiday" },
  "2024-05-02": { name: "劳动节", type: "holiday" },
  "2024-05-03": { name: "劳动节", type: "holiday" },
  "2024-05-04": { name: "劳动节", type: "holiday" },
  "2024-05-05": { name: "劳动节", type: "holiday" },
  "2024-05-11": { name: "劳动节补班", type: "workday" },

  // 端午: 06-08 ~ 06-10
  "2024-06-08": { name: "端午节", type: "holiday" },
  "2024-06-09": { name: "端午节", type: "holiday" },
  "2024-06-10": { name: "端午节", type: "holiday" },

  // 中秋: 09-15 ~ 09-17, 09-14(周六) 补班
  "2024-09-14": { name: "中秋补班", type: "workday" },
  "2024-09-15": { name: "中秋节", type: "holiday" },
  "2024-09-16": { name: "中秋节", type: "holiday" },
  "2024-09-17": { name: "中秋节", type: "holiday" },

  // 国庆: 10-01 ~ 10-07, 09-29(周日) 10-12(周六) 补班
  "2024-09-29": { name: "国庆补班", type: "workday" },
  "2024-10-01": { name: "国庆节", type: "holiday" },
  "2024-10-02": { name: "国庆节", type: "holiday" },
  "2024-10-03": { name: "国庆节", type: "holiday" },
  "2024-10-04": { name: "国庆节", type: "holiday" },
  "2024-10-05": { name: "国庆节", type: "holiday" },
  "2024-10-06": { name: "国庆节", type: "holiday" },
  "2024-10-07": { name: "国庆节", type: "holiday" },
  "2024-10-12": { name: "国庆补班", type: "workday" },

  // ===== 2025 =====
  "2025-01-01": { name: "元旦", type: "holiday" },

  // 春节: 01-28 ~ 02-04, 01-26(周日) 02-08(周六) 补班
  "2025-01-26": { name: "春节补班", type: "workday" },
  "2025-01-28": { name: "春节", type: "holiday" },
  "2025-01-29": { name: "春节", type: "holiday" },
  "2025-01-30": { name: "春节", type: "holiday" },
  "2025-01-31": { name: "春节", type: "holiday" },
  "2025-02-01": { name: "春节", type: "holiday" },
  "2025-02-02": { name: "春节", type: "holiday" },
  "2025-02-03": { name: "春节", type: "holiday" },
  "2025-02-04": { name: "春节", type: "holiday" },
  "2025-02-08": { name: "春节补班", type: "workday" },

  // 清明: 04-04 ~ 04-06
  "2025-04-04": { name: "清明节", type: "holiday" },
  "2025-04-05": { name: "清明节", type: "holiday" },
  "2025-04-06": { name: "清明节", type: "holiday" },

  // 劳动节: 05-01 ~ 05-05, 04-27(周日) 补班
  "2025-04-27": { name: "劳动节补班", type: "workday" },
  "2025-05-01": { name: "劳动节", type: "holiday" },
  "2025-05-02": { name: "劳动节", type: "holiday" },
  "2025-05-03": { name: "劳动节", type: "holiday" },
  "2025-05-04": { name: "劳动节", type: "holiday" },
  "2025-05-05": { name: "劳动节", type: "holiday" },

  // 端午: 05-31 ~ 06-02
  "2025-05-31": { name: "端午节", type: "holiday" },
  "2025-06-01": { name: "端午节", type: "holiday" },
  "2025-06-02": { name: "端午节", type: "holiday" },

  // 国庆+中秋: 10-01 ~ 10-08, 09-28(周日) 10-11(周六) 补班
  "2025-09-28": { name: "国庆补班", type: "workday" },
  "2025-10-01": { name: "国庆节", type: "holiday" },
  "2025-10-02": { name: "国庆节", type: "holiday" },
  "2025-10-03": { name: "国庆节", type: "holiday" },
  "2025-10-04": { name: "中秋节", type: "holiday" },
  "2025-10-05": { name: "国庆节", type: "holiday" },
  "2025-10-06": { name: "中秋节", type: "holiday" },
  "2025-10-07": { name: "国庆节", type: "holiday" },
  "2025-10-08": { name: "国庆节", type: "holiday" },
  "2025-10-11": { name: "国庆补班", type: "workday" },

  // ===== 2026 =====
  "2026-01-01": { name: "元旦", type: "holiday" },
  "2026-01-02": { name: "元旦", type: "holiday" },
  "2026-01-03": { name: "元旦", type: "holiday" },

  // 春节: 02-17 ~ 02-23, 02-28(周六) 补班（预计）
  "2026-02-17": { name: "春节", type: "holiday" },
  "2026-02-18": { name: "春节", type: "holiday" },
  "2026-02-19": { name: "春节", type: "holiday" },
  "2026-02-20": { name: "春节", type: "holiday" },
  "2026-02-21": { name: "春节", type: "holiday" },
  "2026-02-22": { name: "春节", type: "holiday" },
  "2026-02-23": { name: "春节", type: "holiday" },
  "2026-02-28": { name: "春节补班", type: "workday" },

  // 清明: 04-05 ~ 04-07（预计）
  "2026-04-05": { name: "清明节", type: "holiday" },
  "2026-04-06": { name: "清明节", type: "holiday" },

  // 劳动节: 05-01 ~ 05-05（预计）
  "2026-05-01": { name: "劳动节", type: "holiday" },
  "2026-05-02": { name: "劳动节", type: "holiday" },
  "2026-05-03": { name: "劳动节", type: "holiday" },
  "2026-05-04": { name: "劳动节", type: "holiday" },
  "2026-05-05": { name: "劳动节", type: "holiday" },

  // 端午: 06-19 ~ 06-21（预计）
  "2026-06-19": { name: "端午节", type: "holiday" },
  "2026-06-20": { name: "端午节", type: "holiday" },
  "2026-06-21": { name: "端午节", type: "holiday" },

  // 中秋: 09-25 ~ 09-27（预计）
  "2026-09-25": { name: "中秋节", type: "holiday" },
  "2026-09-26": { name: "中秋节", type: "holiday" },
  "2026-09-27": { name: "中秋节", type: "holiday" },

  // 国庆: 10-01 ~ 10-07, 补班预计
  "2026-10-01": { name: "国庆节", type: "holiday" },
  "2026-10-02": { name: "国庆节", type: "holiday" },
  "2026-10-03": { name: "国庆节", type: "holiday" },
  "2026-10-04": { name: "国庆节", type: "holiday" },
  "2026-10-05": { name: "国庆节", type: "holiday" },
  "2026-10-06": { name: "国庆节", type: "holiday" },
  "2026-10-07": { name: "国庆节", type: "holiday" },

  // ===== 2027 =====
  "2027-01-01": { name: "元旦", type: "holiday" },

  // 春节: 02-06 ~ 02-12（预计）
  "2027-02-06": { name: "春节", type: "holiday" },
  "2027-02-07": { name: "春节", type: "holiday" },
  "2027-02-08": { name: "春节", type: "holiday" },
  "2027-02-09": { name: "春节", type: "holiday" },
  "2027-02-10": { name: "春节", type: "holiday" },
  "2027-02-11": { name: "春节", type: "holiday" },
  "2027-02-12": { name: "春节", type: "holiday" },

  // 清明: 04-05 ~ 04-07（预计）
  "2027-04-05": { name: "清明节", type: "holiday" },
  "2027-04-06": { name: "清明节", type: "holiday" },

  // 劳动节: 05-01 ~ 05-05（预计）
  "2027-05-01": { name: "劳动节", type: "holiday" },
  "2027-05-02": { name: "劳动节", type: "holiday" },
  "2027-05-03": { name: "劳动节", type: "holiday" },

  // 端午: 06-09 ~ 06-11（预计）
  "2027-06-09": { name: "端午节", type: "holiday" },
  "2027-06-10": { name: "端午节", type: "holiday" },
  "2027-06-11": { name: "端午节", type: "holiday" },

  // 中秋+国庆: 2027年中秋 10-01左右（预计）
  "2027-10-01": { name: "国庆节", type: "holiday" },
  "2027-10-02": { name: "国庆节", type: "holiday" },
  "2027-10-03": { name: "国庆节", type: "holiday" },
  "2027-10-04": { name: "中秋节", type: "holiday" },
  "2027-10-05": { name: "国庆节", type: "holiday" },
  "2027-10-06": { name: "国庆节", type: "holiday" },
  "2027-10-07": { name: "国庆节", type: "holiday" },
};

// 活跃的放假安排（可被外部动态注入以覆盖默认数据）
let _activeSchedule = HOLIDAY_SCHEDULE;

/** 从外部注入新的放假安排数据 */
export function setHolidaySchedule(newSchedule) {
  if (newSchedule && Object.keys(newSchedule).length > 0) {
    _activeSchedule = newSchedule;
  }
}

// 农历节假日（格式：月-日）
const LUNAR_HOLIDAYS = {
  "1-1":  { name: "春节", days: 7 },
  "1-15": { name: "元宵节", days: 0 },
  "2-2":  { name: "龙抬头", days: 0 },
  "5-5":  { name: "端午节", days: 3 },
  "7-7":  { name: "七夕", days: 0 },
  "7-15": { name: "中元节", days: 0 },
  "8-15": { name: "中秋节", days: 3 },
  "9-9":  { name: "重阳节", days: 0 },
  "12-29": { name: "除夕", days: 0 },
  "12-30": { name: "除夕", days: 0 },
};

// 节气日期表（简化版，基于 2024-2030 近似日期）
const SOLAR_TERMS = [
  "小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨",
  "立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑",
  "白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"
];

// ==================== 公历 → 农历转换 ====================

// 农历基准日：2024-01-01 对应 农历 2023-11-20
const BASE_DATE = new Date(2024, 0, 1);
const BASE_LUNAR = { year: 2023, month: 11, day: 20, isLeap: false };

function getLunarInfo(year) {
  return LUNAR_INFO.find((li) => li.y === year) || LUNAR_INFO[0];
}

/**
 * 将公历日期转换为农历日期
 */
export function solarToLunar(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // 使用查表法：遍历从基准日到目标日的每一天
  let currentDate = new Date(BASE_DATE);
  let lunarYear = BASE_LUNAR.year;
  let lunarMonth = BASE_LUNAR.month;
  let lunarDay = BASE_LUNAR.day;
  let isLeap = BASE_LUNAR.isLeap;

  while (currentDate.getFullYear() < y ||
         (currentDate.getFullYear() === y && currentDate.getMonth() + 1 < m) ||
         (currentDate.getFullYear() === y && currentDate.getMonth() + 1 === m && currentDate.getDate() < d)) {

    currentDate.setDate(currentDate.getDate() + 1);
    lunarDay++;

    const info = getLunarInfo(lunarYear);
    const months = [...info.months];
    if (info.leap > 0) {
      months.splice(info.leap, 0, months[info.leap - 1]); // 插入闰月
    }

    // 确定当前月有多少天
    let currentMonthDays;
    if (isLeap) {
      currentMonthDays = months[lunarMonth]; // 闰月天数
    } else {
      let monthIdx = lunarMonth - 1;
      // 如果当前月之前有闰月，调整索引
      if (info.leap > 0 && info.leap < lunarMonth) {
        monthIdx++;
      }
      currentMonthDays = months[monthIdx];
    }

    if (lunarDay > Math.abs(currentMonthDays)) {
      lunarDay = 1;
      // 判断下个月是闰月还是平月
      if (isLeap) {
        isLeap = false;
        lunarMonth++;
      } else if (info.leap === lunarMonth) {
        isLeap = true;
      } else {
        lunarMonth++;
      }
    }

    // 跨年
    if (lunarMonth > 12 + (info.leap > 0 ? 1 : 0)) {
      lunarMonth = 1;
      lunarYear++;
      isLeap = false;
    }
  }

  // 获取当前年的天干地支
  const stemIdx = (lunarYear - 4) % 10;
  const branchIdx = (lunarYear - 4) % 12;
  const yearName = STEMS[stemIdx] + BRANCHES[branchIdx] + "年";
  const zodiacAnimal = ZODIAC[branchIdx];

  const monthName = (isLeap ? "闰" : "") + LUNAR_MONTH_NAMES[lunarMonth];
  const dayName = LUNAR_DAY_NAMES[lunarDay];

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeap,
    yearName,
    zodiacAnimal,
    monthName,
    dayName,
    key: `${lunarMonth}-${lunarDay}`,
  };
}

/**
 * 获取指定日期的节气
 */
export function getSolarTerm(date) {
  // 简化节气计算 — 使用近似日期
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const termDays = [6,4,6,5,6,6,7,7,8,8,7,7,7,8,8,7,7,8,8,7,7,8,7,7]; // 大致日期
  const idx = (m - 1) * 2;
  const t1 = termDays[idx], t2 = termDays[idx + 1];

  if (d === t1) return SOLAR_TERMS[idx];
  if (d === t2) return SOLAR_TERMS[idx + 1];
  // 前后1天容差
  if (Math.abs(d - t1) <= 1) return null; // 太粗略，不做近似
  if (Math.abs(d - t2) <= 1) return null;
  return null;
}

/**
 * 获取指定日期的节假日/放假/补班信息
 */
export function getHoliday(date, lunar) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateKey = `${y}-${m}-${d}`;

  // 优先检查官方放假补班安排
  const schedule = _activeSchedule[dateKey];
  if (schedule) {
    return { name: schedule.name, type: schedule.type, days: 0 };
  }

  // 检查公历节日
  const solarKey = m + d;
  if (SOLAR_HOLIDAYS[solarKey]) {
    return { ...SOLAR_HOLIDAYS[solarKey], type: "solar" };
  }

  // 检查农历节日
  if (lunar) {
    const lunarKey = lunar.key;
    if (LUNAR_HOLIDAYS[lunarKey]) {
      return { ...LUNAR_HOLIDAYS[lunarKey], type: "lunar" };
    }
  }

  // 检查节气
  const term = getSolarTerm(date);
  if (term) {
    return { name: term, days: 0, type: "term" };
  }

  return null;
}

/**
 * 批量获取某月的放假补班映射（供日历使用）
 */
export function getMonthSchedule(year, month) {
  const map = {};
  const days = new Date(year, month, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (_activeSchedule[key]) {
      map[d] = _activeSchedule[key];
    }
  }
  return map;
}

/**
 * 判断是否为周末
 */
export function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

/**
 * 判断是否为今天
 */
export function isToday(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}
