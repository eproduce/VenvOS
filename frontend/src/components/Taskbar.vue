<template>
  <div class="taskbar">
    <div class="taskbar-left">
      <button class="start-btn" :class="{ active: store.startMenuOpen }" @click="store.toggleStartMenu()">
        <span class="logo">◆</span>
      </button>

      <div class="taskbar-apps">
        <button
          v-for="win in store.windows"
          :key="win.id"
          class="taskbar-app-btn"
          :class="{ active: store.activeWindowId === win.id && !win.minimized }"
          @click="onTaskbarAppClick(win)"
        >
          <span>{{ win.icon }}</span>
          <span class="app-label">{{ win.title }}</span>
        </button>
      </div>
    </div>
    <div class="taskbar-right">
      <div class="system-tray">
        <span class="tray-time">{{ store.currentTime }}</span>
        <span class="tray-date">{{ store.currentDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOSStore } from "../store/index.js";

const store = useOSStore();

function onTaskbarAppClick(win) {
  if (win.minimized) {
    store.focusWindow(win.id);
  } else if (store.activeWindowId === win.id) {
    store.minimizeWindow(win.id);
  } else {
    store.focusWindow(win.id);
  }
}
</script>

<style scoped>
.taskbar {
  height: var(--taskbar-height);
  background: var(--bg-taskbar);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  z-index: 100;
  position: relative;
}
.taskbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.taskbar-right {
  display: flex;
  align-items: center;
}

.start-btn {
  width: 38px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}
.start-btn:hover, .start-btn.active {
  background: rgba(124, 92, 252, 0.2);
}
.logo {
  font-size: 20px;
  color: var(--accent);
}

.taskbar-apps {
  display: flex;
  gap: 2px;
  overflow-x: auto;
  max-width: calc(100% - 50px);
}
.taskbar-apps::-webkit-scrollbar { height: 0; }

.taskbar-app-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  white-space: nowrap;
  border: 1px solid transparent;
}
.taskbar-app-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}
.taskbar-app-btn.active {
  background: rgba(124, 92, 252, 0.15);
  border-color: var(--accent);
  color: #fff;
}
.app-label {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.system-tray {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0 8px;
  cursor: default;
}
.tray-time {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}
.tray-date {
  font-size: 10px;
  color: var(--text-muted);
}
</style>
