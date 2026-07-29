<template>
  <div
    class="start-menu-backdrop"
    @mousedown.self="store.startMenuOpen = false"
  >
    <div class="start-menu" @click.stop>
      <div class="start-menu-header">
        <AppIcon name="logo" :size="28" />
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
          <AppIcon :name="item.icon" :size="22" />
          <span class="item-label">{{ item.name }}</span>
        </div>
      </div>
      <!-- 用户区域 -->
      <div class="start-menu-user">
        <div class="start-user-avatar">{{ userInitial }}</div>
        <div class="start-user-info">
          <span class="start-user-name">{{ userName }}</span>
          <span class="start-user-role">{{ userRole }}</span>
        </div>
        <button class="start-user-logout" @click="showLogoutConfirm = true" title="退出登录">
          <AppIcon name="x" :size="14" />
        </button>
      </div>
      <div class="start-menu-footer">
        <div class="start-menu-item" @click="showAbout = true">
          <AppIcon name="info" :size="22" />
          <span class="item-label">关于 VenvOS</span>
        </div>
      </div>
    </div>

    <!-- 关于弹窗 -->
    <div v-if="showAbout" class="about-overlay" @click.self="showAbout = false">
      <div class="about-dialog">
        <div class="about-header">
          <AppIcon name="logo" :size="32" />
          <h2>VenvOS</h2>
          <button class="about-close" @click="showAbout = false">
            <AppIcon name="x" :size="16" />
          </button>
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

    <!-- 退出确认弹窗 -->
    <div v-if="showLogoutConfirm" class="about-overlay" @click.self="showLogoutConfirm = false">
      <div class="about-dialog" style="width: 320px;">
        <div class="about-header">
          <AppIcon name="x" :size="22" />
          <h2>退出登录</h2>
        </div>
        <div class="about-body">
          <p style="text-align:center;color:var(--text-secondary);font-size:14px;">
            确定要退出当前账号吗？
          </p>
        </div>
        <div class="about-footer" style="justify-content:center;gap:12px;">
          <button class="btn btn-ghost" @click="showLogoutConfirm = false">取消</button>
          <button class="btn btn-danger" @click="doLogout">确定退出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useOSStore } from "../store/index.js";
import { useAuth } from "../auth.js";
import AppIcon from "./AppIcon.vue";

const store = useOSStore();
const auth = useAuth();
const showAbout = ref(false);
const showLogoutConfirm = ref(false);

const userName = computed(() => auth.user.value?.display_name || auth.user.value?.username || "用户");
const userInitial = computed(() => userName.value[0].toUpperCase());
const userRole = computed(() => auth.user.value?.role === "admin" ? "管理员" : "用户");

function openApp(appName) {
  store.startMenuOpen = false;
  store.openApp(appName);
}

function doLogout() {
  showLogoutConfirm.value = false;
  store.startMenuOpen = false;
  auth.logout();
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
  bottom: calc(var(--taskbar-height) + 10px);
  left: 10px;
  width: 300px;
  background: rgba(22, 22, 40, 0.92);
  backdrop-filter: blur(28px) saturate(1.8);
  -webkit-backdrop-filter: blur(28px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  animation: menuSlideUp 0.2s cubic-bezier(0.2, 0, 0.2, 1);
}
@keyframes menuSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.start-menu-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.45));
  color: #fff;
}
.os-name { font-size: 17px; font-weight: 700; letter-spacing: 0.02em; }
.os-ver { margin-left: auto; font-size: 10.5px; opacity: 0.7; font-weight: 500; }

.start-menu-list { padding: 8px; }
.start-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text-secondary);
}
.start-menu-item:hover {
  background: var(--accent-subtle);
  color: var(--text-primary);
}
.start-menu-item svg { opacity: 0.65; }
.start-menu-item:hover svg { opacity: 1; color: var(--accent); }
.item-label { font-size: 13px; }

.start-menu-footer {
  border-top: 1px solid var(--border-light);
  padding: 8px;
}

/* 用户区域 */
.start-menu-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-light);
}
.start-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #1d4ed8);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.start-user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.start-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.start-user-role {
  font-size: 11px;
  color: var(--text-muted);
}
.start-user-logout {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
  flex-shrink: 0;
}
.start-user-logout:hover {
  background: rgba(255, 95, 107, 0.15);
  color: var(--danger);
}

/* 关于弹窗 */
.about-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.about-dialog {
  width: 380px;
  background: rgba(28, 28, 48, 0.95);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
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
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(40, 100, 220, 0.35));
  color: #fff;
}
.about-header h2 { font-size: 20px; font-weight: 700; flex: 1; }
.about-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all var(--transition);
}
.about-close:hover { background: rgba(255,255,255,0.25); transform: scale(1.05); }

.about-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-primary);
  padding: 7px 0;
  border-bottom: 1px solid var(--border-light);
}
.about-label {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
}

.about-footer {
  padding: 14px 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
}
</style>
