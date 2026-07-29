<template>
  <div class="taskbar">
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
      <div class="system-tray" @click="store.toggleStartMenu()">
        <span class="tray-time">{{ store.currentTime }}</span>
        <span class="tray-date">{{ store.currentDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOSStore } from "../store/index.js";
import AppIcon from "./AppIcon.vue";

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
  background: rgba(12, 12, 24, 0.82);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  z-index: 100;
  position: relative;
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
  background: rgba(108, 140, 255, 0.15);
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
  position: absolute;
  right: 12px;
}
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
