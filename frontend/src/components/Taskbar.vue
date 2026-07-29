<template>
  <div class="taskbar">
    <div class="taskbar-left">
      <button class="start-btn" :class="{ active: store.startMenuOpen }" @click.stop="store.toggleStartMenu()">
        <AppIcon name="logo" :size="20" />
      </button>
    </div>
    <div class="taskbar-center">
      <div class="taskbar-apps">
        <button
          v-for="win in store.windows"
          :key="win.id"
          class="taskbar-app-btn"
          :class="{ active: store.activeWindowId === win.id && !win.minimized }"
          @click="onTaskbarAppClick(win)"
        >
          <AppIcon :name="win.icon" :size="16" />
          <span class="app-label">{{ win.title }}</span>
        </button>
      </div>
    </div>
    <div class="taskbar-right">
      <button class="tray-icon" @click.stop="store.toggleNotifications()" title="通知">
        <AppIcon name="info" :size="16" />
      </button>
      <span class="tray-user" @click.stop="onUserClick">{{ auth.user.value?.display_name || auth.user.value?.username || '用户' }}</span>
      <div class="system-tray" @click.stop="store.toggleCalendar()">
        <span class="tray-time">{{ store.currentTime }}</span>
        <span class="tray-date">{{ store.currentDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOSStore } from "../store/index.js";
import { useAuth } from "../auth.js";
import AppIcon from "./AppIcon.vue";

const store = useOSStore();
const auth = useAuth();

function onTaskbarAppClick(win) {
  if (win.minimized) {
    store.focusWindow(win.id);
  } else if (store.activeWindowId === win.id) {
    store.minimizeWindow(win.id);
  } else {
    store.focusWindow(win.id);
  }
}

function onUserClick() {
  const action = confirm("确定要退出登录吗？");
  if (action) auth.logout();
}
</script>

<style scoped>
.taskbar {
  height: var(--taskbar-height);
  background: rgba(12, 12, 24, 0.82);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  padding: 0 8px;
  z-index: 100;
  position: relative;
}

.taskbar-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.start-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}
.start-btn:hover {
  background: var(--accent-soft);
}
.start-btn.active {
  background: var(--accent-soft);
}

.taskbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.taskbar-apps {
  display: flex;
  gap: 4px;
  overflow-x: auto;
}
.taskbar-apps::-webkit-scrollbar { height: 0; }

.taskbar-app-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 11.5px;
  white-space: nowrap;
  transition: all var(--transition);
}
.taskbar-app-btn svg { opacity: 0.7; }
.taskbar-app-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}
.taskbar-app-btn:hover svg { opacity: 1; }
.taskbar-app-btn.active {
  background: rgba(59, 130, 246, 0.15);
  color: var(--text-primary);
}
.taskbar-app-btn.active svg {
  opacity: 1;
  color: var(--accent);
}
.app-label {
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.taskbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  right: 12px;
}
.tray-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}
.tray-icon:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
.tray-user {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tray-user:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
.system-tray {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background var(--transition);
}
.system-tray:hover {
  background: rgba(255, 255, 255, 0.04);
}
.tray-time {
  font-size: 12.5px;
  color: var(--text-primary);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.tray-date {
  font-size: 10px;
  color: var(--text-muted);
}
</style>
