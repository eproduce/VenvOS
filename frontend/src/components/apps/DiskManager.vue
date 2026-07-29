<template>
  <div class="disk-manager">
    <!-- 分区列表 -->
    <div class="dm-section">
      <h3 class="dm-section-title">💽 磁盘分区</h3>
      <div class="partition-grid">
        <div v-for="(part, idx) in partitions" :key="idx" class="partition-card">
          <div class="part-info">
            <span class="part-icon">{{ getPartIcon(part.fstype) }}</span>
            <div class="part-details">
              <span class="part-device">{{ part.device }}</span>
              <span class="part-mount">{{ part.mountpoint }}</span>
              <span class="part-fs">{{ part.fstype || '未知' }}</span>
            </div>
          </div>
          <div class="part-usage">
            <div class="usage-bar">
              <div
                class="usage-fill"
                :style="{ width: part.percent + '%' }"
                :class="getUsageClass(part.percent)"
              ></div>
            </div>
            <div class="usage-text">
              <span>{{ formatSize(part.used) }} / {{ formatSize(part.total) }}</span>
              <span class="usage-pct">{{ part.percent.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
        <div v-if="partitions.length === 0" class="empty-state">正在加载分区信息...</div>
      </div>
    </div>

    <!-- 磁盘IO -->
    <div class="dm-section" v-if="diskIO">
      <h3 class="dm-section-title">📊 磁盘 I/O 统计</h3>
      <div class="io-stats">
        <div class="io-card">
          <span class="io-label">读取次数</span>
          <span class="io-value">{{ formatNumber(diskIO.read_count) }}</span>
        </div>
        <div class="io-card">
          <span class="io-label">写入次数</span>
          <span class="io-value">{{ formatNumber(diskIO.write_count) }}</span>
        </div>
        <div class="io-card">
          <span class="io-label">读取字节</span>
          <span class="io-value">{{ formatSize(diskIO.read_bytes) }}</span>
        </div>
        <div class="io-card">
          <span class="io-label">写入字节</span>
          <span class="io-value">{{ formatSize(diskIO.write_bytes) }}</span>
        </div>
        <div class="io-card">
          <span class="io-label">读取耗时</span>
          <span class="io-value">{{ diskIO.read_time }} ms</span>
        </div>
        <div class="io-card">
          <span class="io-label">写入耗时</span>
          <span class="io-value">{{ diskIO.write_time }} ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../api.js";

defineProps({ windowId: Number });

const partitions = ref([]);
const diskIO = ref(null);

async function loadData() {
  try {
    const [partRes, ioRes] = await Promise.all([
      api.get("/api/disks/partitions"),
      api.get("/api/disks/io"),
    ]);
    partitions.value = partRes.data.data || [];
    diskIO.value = ioRes.data.data || null;
  } catch (e) {
    console.error("加载磁盘信息失败:", e);
  }
}

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return size.toFixed(i > 0 ? 1 : 0) + " " + units[i];
}

function formatNumber(n) {
  if (!n) return "0";
  return n.toLocaleString();
}

function getUsageClass(pct) {
  if (pct >= 90) return "danger";
  if (pct >= 70) return "warning";
  return "normal";
}

function getPartIcon(fs) {
  if (!fs) return "💾";
  const map = { apfs: "🍎", ntfs: "🪟", ext4: "🐧", fat32: "💾", exfat: "💾" };
  return map[fs.toLowerCase()] || "💾";
}

onMounted(loadData);
</script>

<style scoped>
.disk-manager {
  padding: 16px 20px;
  overflow-y: auto;
  height: 100%;
  width: 100%;
}

.dm-section {
  margin-bottom: 24px;
}
.dm-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

/* 分区卡片 */
.partition-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.partition-card {
  background: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 14px 16px;
  transition: border-color var(--transition);
}
.partition-card:hover { border-color: rgba(255,255,255,0.15); }

.part-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.part-icon { font-size: 28px; }
.part-details { display: flex; flex-direction: column; gap: 2px; }
.part-device { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.part-mount { font-size: 12px; color: var(--text-secondary); }
.part-fs {
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(255,255,255,0.05);
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
  margin-top: 2px;
  width: fit-content;
}

.part-usage { }
.usage-bar {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}
.usage-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}
.usage-fill.normal { background: var(--accent); }
.usage-fill.warning { background: var(--warning); }
.usage-fill.danger { background: var(--danger); }

.usage-text {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}
.usage-pct { font-weight: 600; }

/* I/O 统计 */
.io-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.io-card {
  background: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.io-label { font-size: 11px; color: var(--text-muted); }
.io-value { font-size: 16px; font-weight: 600; color: var(--text-primary); }

.empty-state {
  text-align: center;
  padding: 30px;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
