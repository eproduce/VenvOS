<template>
  <div
    v-if="store.showCalendar"
    class="calendar-backdrop"
    @mousedown.self="store.showCalendar = false"
  >
    <div class="calendar-panel">
      <!-- 头部：年月导航 -->
      <div class="cal-header">
        <button class="cal-nav" @click="prevMonth"><AppIcon name="arrow-left" :size="14" /></button>
        <span class="cal-title">{{ viewYear }}年 {{ viewMonth }}月</span>
        <button class="cal-nav" @click="nextMonth"><AppIcon name="arrow-right" :size="14" /></button>
      </div>

      <!-- 星期头 -->
      <div class="cal-weekdays">
        <span v-for="w in weekLabels" :key="w" :class="{ weekend: w === '六' || w === '日' }">{{ w }}</span>
      </div>

      <!-- 日期网格 -->
      <div class="cal-grid">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="cal-cell"
          :class="{
            other: !cell.current,
            today: cell.isToday,
            weekend: cell.weekend,
            holiday: cell.holiday?.type === 'solar' || cell.holiday?.type === 'lunar',
            term: cell.holiday?.type === 'term',
          }"
        >
          <div class="cal-solar">{{ cell.day }}</div>
          <div class="cal-lunar">{{ cell.lunarText }}</div>
          <div v-if="cell.holiday && cell.holiday.type !== 'term'" class="cal-holiday-dot"></div>
        </div>
      </div>

      <!-- 底部节日详情 -->
      <div v-if="selectedHoliday" class="cal-footer">
        <span class="cal-footer-icon">{{ selectedHoliday.type === 'lunar' ? '🏮' : '🎉' }}</span>
        <span>{{ selectedHoliday.name }}</span>
        <span v-if="selectedHoliday.days > 0" class="cal-footer-days">放假 {{ selectedHoliday.days }} 天</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useOSStore } from "../store/index.js";
import { solarToLunar, getHoliday, isToday, isWeekend } from "../lunar.js";
import AppIcon from "./AppIcon.vue";

const store = useOSStore();
const viewDate = ref(new Date());

const viewYear = computed(() => viewDate.value.getFullYear());
const viewMonth = computed(() => viewDate.value.getMonth() + 1);
const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];

const today = new Date();

const calendarCells = computed(() => {
  const year = viewYear.value;
  const month = viewMonth.value - 1; // JS month 0-based
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 计算起始偏移（周一为第0天）
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const cells = [];

  // 上月填充
  const prevLastDay = new Date(year, month, 0);
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevLastDay.getDate() - i);
    const lunar = solarToLunar(d);
    cells.push({
      day: d.getDate(),
      date: d,
      current: false,
      isToday: false,
      weekend: isWeekend(d),
      lunarText: lunar.dayName,
      holiday: null,
    });
  }

  // 当月
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    const lunar = solarToLunar(d);
    const holidays = getHoliday(d, lunar);
    const primaryHoliday = holidays.find(h => h.type === "lunar" || h.type === "solar") || holidays[0];
    cells.push({
      day: i,
      date: d,
      current: true,
      isToday: isToday(d, today),
      weekend: isWeekend(d),
      lunarText: primaryHoliday && primaryHoliday.type !== "term" ? primaryHoliday.name : lunar.dayName === "初一" ? lunar.monthName : lunar.dayName,
      holiday: primaryHoliday || null,
    });
  }

  // 下月填充
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const lunar = solarToLunar(d);
    cells.push({
      day: i,
      date: d,
      current: false,
      isToday: false,
      weekend: isWeekend(d),
      lunarText: lunar.dayName,
      holiday: null,
    });
  }

  return cells;
});

const selectedHoliday = computed(() => {
  return null; // 可以之后扩展为 hover 显示
});

function prevMonth() {
  const d = new Date(viewDate.value);
  d.setMonth(d.getMonth() - 1);
  viewDate.value = d;
}

function nextMonth() {
  const d = new Date(viewDate.value);
  d.setMonth(d.getMonth() + 1);
  viewDate.value = d;
}
</script>

<style scoped>
.calendar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
}
.calendar-panel {
  position: absolute;
  bottom: calc(var(--taskbar-height) + 8px);
  right: 12px;
  width: 300px;
  background: rgba(22, 22, 40, 0.94);
  backdrop-filter: blur(28px) saturate(1.8);
  -webkit-backdrop-filter: blur(28px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
  padding: 16px;
  animation: calSlideUp 0.2s cubic-bezier(0.2, 0, 0.2, 1);
}
@keyframes calSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.cal-nav {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}
.cal-nav:hover { background: var(--bg-hover); color: var(--text-primary); }
.cal-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.cal-weekdays .weekend { color: var(--warning); }

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition);
  position: relative;
  padding: 2px;
}
.cal-cell:hover { background: rgba(255,255,255,0.05); }
.cal-cell.other { opacity: 0.3; }
.cal-cell.today {
  background: var(--accent-soft);
  color: var(--accent-hover);
}
.cal-cell.today .cal-solar {
  font-weight: 700;
}
.cal-cell.weekend .cal-solar { color: var(--warning); }
.cal-cell.holiday .cal-lunar { color: var(--danger); font-weight: 600; }
.cal-cell.term .cal-lunar { color: var(--success); }

.cal-solar {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.cal-lunar {
  font-size: 9.5px;
  color: var(--text-muted);
  line-height: 1;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 36px;
}
.cal-holiday-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--danger);
  position: absolute;
  bottom: 3px;
}

.cal-footer {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.04);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}
.cal-footer-icon { font-size: 14px; }
.cal-footer-days {
  margin-left: auto;
  color: var(--accent);
  font-weight: 600;
  font-size: 11px;
}
</style>
