<template>
  <div
    class="notif-backdrop"
    @mousedown.self="store.showNotifications = false"
  >
    <div class="notif-panel">
      <div class="notif-header">
        <span>通知中心</span>
        <button class="notif-close" @click="store.showNotifications = false">
          <AppIcon name="x" :size="14" />
        </button>
      </div>
      <div class="notif-list">
        <div v-if="notifications.length === 0" class="notif-empty">暂无通知</div>
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notif-item"
          :class="{ unread: !n.is_read, ['level-' + n.level]: true }"
          @click="markRead(n)"
        >
          <div class="notif-dot" v-if="!n.is_read"></div>
          <div class="notif-body">
            <div class="notif-title">{{ n.title }}</div>
            <div class="notif-text" v-if="n.body">{{ n.body }}</div>
            <div class="notif-time">{{ formatTime(n.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useOSStore } from "../store/index.js";
import api from "../api.js";
import AppIcon from "./AppIcon.vue";

const store = useOSStore();
const notifications = ref([]);

async function loadNotifications() {
  try {
    const res = await api.get("/api/auth/notifications");
    notifications.value = res.data.data || [];
  } catch {}
}

async function markRead(n) {
  if (n.is_read) return;
  try {
    await api.put(`/api/auth/notifications/${n.id}/read`);
    n.is_read = true;
  } catch {}
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return Math.floor(diff / 60000) + " 分钟前";
  if (diff < 86400000) return Math.floor(diff / 3600000) + " 小时前";
  return d.toLocaleDateString("zh-CN");
}

onMounted(loadNotifications);
</script>

<style scoped>
.notif-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
}
.notif-panel {
  position: absolute;
  bottom: calc(var(--taskbar-height) + 8px);
  right: 12px;
  width: 340px;
  max-height: 420px;
  background: rgba(22, 22, 40, 0.94);
  backdrop-filter: blur(28px) saturate(1.8);
  -webkit-backdrop-filter: blur(28px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: calSlideUp 0.2s cubic-bezier(0.2, 0, 0.2, 1);
}
@keyframes calSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
}
.notif-close {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.notif-close:hover { background: var(--bg-hover); }

.notif-list { overflow-y: auto; flex: 1; }
.notif-empty {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 18px;
  cursor: pointer;
  transition: background var(--transition);
  border-bottom: 1px solid var(--border-light);
}
.notif-item:hover { background: rgba(255,255,255,0.03); }
.notif-item.unread { background: rgba(59,130,246,0.04); }
.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 4px;
  flex-shrink: 0;
}
.notif-body { flex: 1; min-width: 0; }
.notif-title { font-size: 13px; color: var(--text-primary); }
.notif-text { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.notif-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
</style>
