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

    <!-- 关于弹窗 -->
    <div v-if="showAbout" class="about-overlay" @click.self="showAbout = false">
      <div class="about-dialog">
        <div class="about-header">
          <span class="about-logo">◆</span>
          <h2>VenvOS</h2>
          <button class="about-close" @click="showAbout = false">✕</button>
        </div>
        <div class="about-body">
          <div class="about-row"><span class="about-label">版本</span><span>v1.0.0</span></div>
          <div class="about-row"><span class="about-label">前端</span><span>Vue 3 + Pinia + Vite</span></div>
          <div class="about-row"><span class="about-label">后端</span><span>Python Sanic</span></div>
          <div class="about-row"><span class="about-label">作者</span><span>eproduce</span></div>
        </div>
        <div class="about-footer">
          <button class="btn btn-primary" @click="showAbout = false">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useOSStore } from "../store/index.js";

const store = useOSStore();
const showAbout = ref(false);

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

/* 关于弹窗 */
.about-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.about-dialog {
  width: 380px;
  background: #1e1e30;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.about-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: var(--accent);
  color: #fff;
}
.about-logo { font-size: 32px; }
.about-header h2 { font-size: 22px; font-weight: 700; flex: 1; }
.about-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background var(--transition);
}
.about-close:hover { background: rgba(255,255,255,0.3); }

.about-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-primary);
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}
.about-label {
  color: var(--text-muted);
  font-size: 12px;
}

.about-footer {
  padding: 14px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}
</style>
