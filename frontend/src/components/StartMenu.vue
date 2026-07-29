<template>
  <div
    class="start-menu-backdrop"
    @click="store.startMenuOpen = false"
  >
    <div class="start-menu" @click.stop>
      <div class="start-menu-header">
        <span class="os-logo">◆</span>
        <span class="os-name">VenvOS</span>
        <span class="os-ver">v1.0</span>
      </div>
      <div class="start-menu-list">
        <div
          v-for="item in store.desktopIcons"
          :key="item.id"
          class="start-menu-item"
          @click="openApp(item.app)"
        >
          <span class="item-icon">{{ item.icon }}</span>
          <span class="item-label">{{ item.name }}</span>
        </div>
      </div>
      <div class="start-menu-footer">
        <div class="start-menu-item" @click="showAbout = true">
          <span class="item-icon">ℹ️</span>
          <span class="item-label">关于 VenvOS</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOSStore } from "../store/index.js";

const store = useOSStore();

function openApp(appName) {
  store.startMenuOpen = false;
  store.openApp(appName);
}
</script>

<style scoped>
.start-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
}
.start-menu {
  position: absolute;
  bottom: calc(var(--taskbar-height) + 8px);
  left: 8px;
  width: 300px;
  background: #1c1c30;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
}
.start-menu-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: var(--accent);
  color: #fff;
}
.os-logo { font-size: 24px; }
.os-name { font-size: 18px; font-weight: 700; }
.os-ver { margin-left: auto; font-size: 11px; opacity: 0.7; }

.start-menu-list {
  padding: 8px;
}
.start-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition);
}
.start-menu-item:hover {
  background: var(--bg-hover);
}
.item-icon { font-size: 20px; width: 28px; text-align: center; }
.item-label { font-size: 13px; color: var(--text-primary); }

.start-menu-footer {
  border-top: 1px solid var(--border-color);
  padding: 8px;
}
</style>
