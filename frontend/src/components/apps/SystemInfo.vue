<template>
  <div class="system-info">
    <div v-if="loading" class="si-loading">正在获取系统信息...</div>
    <template v-else>
      <!-- 系统概览 -->
      <div class="si-section">
        <h3 class="si-section-title">🖥️ 系统概览</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">主机名</span>
            <span class="info-value">{{ info.hostname }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">操作系统</span>
            <span class="info-value">{{ info.platform }} {{ info.platform_release }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">架构</span>
            <span class="info-value">{{ info.architecture }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">处理器</span>
            <span class="info-value">{{ info.processor }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">逻辑CPU</span>
            <span class="info-value">{{ info.cpu_count }} 核</span>
          </div>
          <div class="info-item">
            <span class="info-label">物理CPU</span>
            <span class="info-value">{{ info.cpu_count_physical }} 核</span>
          </div>
        </div>
      </div>

      <!-- 内存 -->
      <div class="si-section">
        <h3 class="si-section-title">🧠 内存</h3>
        <div class="memory-section">
          <div class="mem-card">
            <div class="mem-header">
              <span>物理内存</span>
              <span class="mem-pct">{{ info.memory_percent }}%</span>
            </div>
            <div class="mem-bar">
              <div class="mem-fill" :style="{ width: info.memory_percent + '%' }"></div>
            </div>
            <div class="mem-detail">
              {{ formatSize(info.memory_total - info.memory_available) }} / {{ formatSize(info.memory_total) }}
            </div>
          </div>
          <div class="mem-card">
            <div class="mem-header">
              <span>交换空间</span>
              <span class="mem-pct">{{ info.swap_percent }}%</span>
            </div>
            <div class="mem-bar">
              <div class="mem-fill swap" :style="{ width: info.swap_percent + '%' }"></div>
            </div>
            <div class="mem-detail">
              {{ formatSize(info.swap_used) }} / {{ formatSize(info.swap_total) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 启动时间 -->
      <div class="si-section">
        <h3 class="si-section-title">⏱️ 运行时间</h3>
        <div class="info-value" style="font-size: 24px; font-weight: 700; color: var(--accent);">
          {{ uptime }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../api.js";

defineProps({ windowId: Number });

const info = ref({});
const loading = ref(true);
const uptime = ref("");

async function loadInfo() {
  try {
    const res = await api.get("/api/disks/system");
    info.value = res.data.data || {};
    calcUptime();
  } catch (e) {
    console.error("加载系统信息失败:", e);
  } finally {
    loading.value = false;
  }
}

function calcUptime() {
  if (!info.value.boot_time) return;
  const boot = new Date(info.value.boot_time * 1000);
  const now = new Date();
  const diff = Math.floor((now - boot) / 1000);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  uptime.value = `${days} 天 ${hours} 小时 ${mins} 分钟`;
}

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return size.toFixed(i > 0 ? 1 : 0) + " " + units[i];
}

onMounted(loadInfo);
</script>

<style scoped>
.system-info {
  padding: 16px 20px;
  overflow-y: auto;
  height: 100%;
  width: 100%;
}
.si-loading {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.si-section {
  margin-bottom: 24px;
}
.si-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.info-item {
  background: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label { font-size: 11px; color: var(--text-muted); }
.info-value { font-size: 13px; color: var(--text-primary); font-weight: 500; word-break: break-all; }

.memory-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mem-card {
  background: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 14px 16px;
}
.mem-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}
.mem-pct { font-weight: 700; color: var(--accent); }
.mem-bar {
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}
.mem-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.6s ease;
}
.mem-fill.swap { background: var(--warning); }
.mem-detail { font-size: 11px; color: var(--text-muted); }
</style>
