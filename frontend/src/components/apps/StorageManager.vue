<template>
  <div class="storage-manager">
    <!-- Tab 导航 -->
    <div class="sm-tabs">
      <button :class="{ active: tab === 'overview' }" @click="tab = 'overview'">概览</button>
      <button :class="{ active: tab === 'pools' }" @click="tab = 'pools'">存储池</button>
      <button :class="{ active: tab === 'disks' }" @click="tab = 'disks'">物理磁盘</button>
    </div>

    <!-- 概览 -->
    <div v-if="tab === 'overview'" class="sm-content">
      <div class="sm-cards">
        <div class="sm-card">
          <div class="sm-card-icon">🗄️</div>
          <div class="sm-card-num">{{ summary.pools_count }}</div>
          <div class="sm-card-label">存储池</div>
        </div>
        <div class="sm-card">
          <div class="sm-card-icon">💾</div>
          <div class="sm-card-num">{{ summary.disks_count }}</div>
          <div class="sm-card-label">物理磁盘</div>
        </div>
        <div class="sm-card">
          <div class="sm-card-icon">✅</div>
          <div class="sm-card-num healthy">{{ summary.disks_healthy }}</div>
          <div class="sm-card-label">健康磁盘</div>
        </div>
        <div class="sm-card">
          <div class="sm-card-icon">📊</div>
          <div class="sm-card-num">{{ formatSize(summary.pools_total) }}</div>
          <div class="sm-card-label">池总容量</div>
        </div>
      </div>
      <div class="sm-chart" v-if="summary.pools_total > 0">
        <div class="sm-chart-bar">
          <div class="sm-chart-fill" :style="{ width: poolPercent + '%' }"></div>
        </div>
        <div class="sm-chart-text">
          已用 {{ formatSize(summary.pools_used) }} / {{ formatSize(summary.pools_total) }}（{{ poolPercent }}%）
        </div>
      </div>
    </div>

    <!-- 存储池 -->
    <div v-if="tab === 'pools'" class="sm-content">
      <div class="sm-toolbar">
        <button class="btn btn-primary btn-sm" @click="showCreatePool = true">＋ 创建存储池</button>
      </div>
      <div v-if="pools.length === 0" class="empty-state">暂无存储池，点击上方创建</div>
      <div v-for="pool in pools" :key="pool.name" class="sm-pool-card" @click="selectPool(pool)">
        <div class="pool-header">
          <span class="pool-name">🗄️ {{ pool.name }}</span>
          <button class="btn btn-ghost btn-sm" @click.stop="deletePool(pool)">删除</button>
        </div>
        <div class="pool-usage">
          <div class="usage-bar"><div class="usage-fill" :style="{ width: getPercent(pool) + '%' }"></div></div>
          <div class="usage-text">{{ formatSize(pool.used) }} / {{ formatSize(pool.total) }}</div>
        </div>

        <!-- 卷列表 -->
        <div v-if="selectedPool?.name === pool.name" class="pool-volumes">
          <div class="vol-header">
            <span>卷列表</span>
            <button class="btn btn-primary btn-sm" @click.stop="showCreateVol = true; volPool = pool.name">＋ 创建卷</button>
          </div>
          <div v-if="poolVolumes.length === 0" class="empty-state" style="padding:12px;">暂无卷</div>
          <div v-for="vol in poolVolumes" :key="vol.name" class="vol-item">
            <span>{{ vol.name }}</span>
            <span class="vol-usage">{{ formatSize(vol.used) }} / {{ formatSize(vol.total) }}</span>
            <button class="btn btn-ghost btn-sm" @click.stop="deleteVolume(pool.name, vol)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 物理磁盘 -->
    <div v-if="tab === 'disks'" class="sm-content">
      <div v-for="disk in disks" :key="disk.device" class="sm-disk-card">
        <div class="disk-info">
          <span class="disk-icon">💽</span>
          <div class="disk-detail">
            <span class="disk-device">{{ disk.device }}</span>
            <span class="disk-mount">挂载: {{ disk.mountpoint }}</span>
            <span class="disk-fs">{{ disk.fstype }}</span>
          </div>
          <span class="disk-health" :class="disk.health?.health || 'unknown'">
            {{ disk.health?.smart || disk.health?.health || '未知' }}
          </span>
        </div>
        <div class="disk-usage-bar">
          <div class="usage-bar"><div class="usage-fill" :style="{ width: disk.percent + '%' }" :class="getDiskClass(disk.percent)"></div></div>
          <span class="usage-pct">{{ disk.percent.toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- 创建存储池弹窗 -->
    <div v-if="showCreatePool" class="modal-overlay" @click.self="showCreatePool = false">
      <div class="modal-dialog">
        <h3>创建存储池</h3>
        <input v-model="newPoolName" placeholder="存储池名称" @keydown.enter="createPool" />
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showCreatePool = false">取消</button>
          <button class="btn btn-primary" @click="createPool">创建</button>
        </div>
      </div>
    </div>

    <!-- 创建卷弹窗 -->
    <div v-if="showCreateVol" class="modal-overlay" @click.self="showCreateVol = false">
      <div class="modal-dialog">
        <h3>创建卷</h3>
        <input v-model="newVolName" placeholder="卷名称" @keydown.enter="createVolume" />
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showCreateVol = false">取消</button>
          <button class="btn btn-primary" @click="createVolume">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "../../api.js";

defineProps({ windowId: Number });

const tab = ref("overview");
const summary = ref({ pools_count: 0, disks_count: 0, disks_healthy: 0, pools_total: 0, pools_used: 0 });
const pools = ref([]);
const disks = ref([]);
const selectedPool = ref(null);
const poolVolumes = ref([]);

// 弹窗
const showCreatePool = ref(false);
const newPoolName = ref("");
const showCreateVol = ref(false);
const volPool = ref("");
const newVolName = ref("");

const poolPercent = computed(() => {
  if (!summary.value.pools_total) return 0;
  return ((summary.value.pools_used / summary.value.pools_total) * 100).toFixed(1);
});

async function loadAll() {
  try {
    const [s, p, d] = await Promise.all([
      api.get("/api/storage/summary"),
      api.get("/api/storage/pools"),
      api.get("/api/storage/disks"),
    ]);
    summary.value = s.data.data || {};
    pools.value = p.data.data || [];
    disks.value = d.data.data || [];
  } catch (e) { console.error(e); }
}

async function loadVolumes(poolName) {
  try {
    const res = await api.get(`/api/storage/pools/${poolName}/volumes`);
    poolVolumes.value = res.data.data || [];
  } catch { poolVolumes.value = []; }
}

function selectPool(pool) {
  if (selectedPool.value?.name === pool.name) {
    selectedPool.value = null;
    poolVolumes.value = [];
  } else {
    selectedPool.value = pool;
    loadVolumes(pool.name);
  }
}

async function createPool() {
  if (!newPoolName.value.trim()) return;
  try {
    await api.post("/api/storage/pools", { name: newPoolName.value.trim() });
    showCreatePool.value = false;
    newPoolName.value = "";
    loadAll();
  } catch (e) { alert("创建失败: " + (e.response?.data?.error || e.message)); }
}

async function deletePool(pool) {
  if (!confirm(`确定删除存储池 "${pool.name}" 及其所有数据吗？`)) return;
  try {
    await api.delete(`/api/storage/pools/${pool.name}`);
    selectedPool.value = null;
    loadAll();
  } catch (e) { alert("删除失败: " + (e.response?.data?.error || e.message)); }
}

async function createVolume() {
  if (!newVolName.value.trim()) return;
  try {
    await api.post(`/api/storage/pools/${volPool.value}/volumes`, { name: newVolName.value.trim() });
    showCreateVol.value = false;
    newVolName.value = "";
    loadVolumes(volPool.value);
    loadAll();
  } catch (e) { alert("创建失败: " + (e.response?.data?.error || e.message)); }
}

async function deleteVolume(poolName, vol) {
  if (!confirm(`确定删除卷 "${vol.name}" 吗？`)) return;
  try {
    await api.delete(`/api/storage/pools/${poolName}/volumes/${vol.name}`);
    loadVolumes(poolName);
  } catch (e) { alert("删除失败: " + (e.response?.data?.error || e.message)); }
}

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0, s = bytes;
  while (s >= 1024 && i < units.length - 1) { s /= 1024; i++; }
  return s.toFixed(i > 0 ? 1 : 0) + " " + units[i];
}

function getPercent(pool) {
  if (!pool.total) return 0;
  return ((pool.used / pool.total) * 100).toFixed(1);
}

function getDiskClass(pct) {
  if (pct >= 90) return "danger";
  if (pct >= 70) return "warning";
  return "";
}

onMounted(loadAll);
</script>

<style scoped>
.storage-manager { display: flex; flex-direction: column; height: 100%; width: 100%; }
.sm-tabs {
  display: flex; border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.sm-tabs button {
  padding: 10px 20px; font-size: 13px; color: var(--text-muted);
  background: none; border-bottom: 2px solid transparent;
  transition: all var(--transition);
}
.sm-tabs button:hover { color: var(--text-primary); }
.sm-tabs button.active { color: var(--accent); border-bottom-color: var(--accent); }

.sm-content { flex: 1; overflow-y: auto; padding: 16px; }

/* 概览卡片 */
.sm-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.sm-card {
  background: var(--bg-sidebar); border: 1px solid var(--border-color);
  border-radius: var(--radius); padding: 16px; text-align: center;
}
.sm-card-icon { font-size: 24px; margin-bottom: 6px; }
.sm-card-num { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.sm-card-num.healthy { color: var(--success); }
.sm-card-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

.sm-chart { margin-top: 8px; }
.sm-chart-bar { height: 10px; background: rgba(255,255,255,0.06); border-radius: 5px; overflow: hidden; }
.sm-chart-fill { height: 100%; background: var(--accent); border-radius: 5px; transition: width 0.6s; }
.sm-chart-text { font-size: 12px; color: var(--text-muted); margin-top: 6px; }

/* 存储池 */
.sm-toolbar { margin-bottom: 12px; }
.empty-state { text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px; }

.sm-pool-card {
  background: var(--bg-sidebar); border: 1px solid var(--border-color);
  border-radius: var(--radius); padding: 14px 16px; margin-bottom: 10px;
  cursor: pointer; transition: all var(--transition);
}
.sm-pool-card:hover { border-color: rgba(255,255,255,0.15); }
.pool-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.pool-name { font-size: 14px; font-weight: 600; }
.pool-usage { margin-bottom: 8px; }

.pool-volumes { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light); }
.vol-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
.vol-item {
  display: flex; align-items: center; gap: 12px; padding: 6px 10px;
  border-radius: var(--radius-sm); font-size: 12px;
}
.vol-item:hover { background: var(--bg-hover); }
.vol-usage { color: var(--text-muted); margin-left: auto; margin-right: 12px; }

/* 磁盘 */
.sm-disk-card {
  background: var(--bg-sidebar); border: 1px solid var(--border-color);
  border-radius: var(--radius); padding: 12px 16px; margin-bottom: 8px;
}
.disk-info { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.disk-icon { font-size: 28px; }
.disk-detail { flex: 1; display: flex; flex-direction: column; }
.disk-device { font-size: 14px; font-weight: 600; }
.disk-mount { font-size: 11px; color: var(--text-muted); }
.disk-fs {
  font-size: 10px; color: var(--text-muted); background: rgba(255,255,255,0.05);
  padding: 1px 8px; border-radius: 10px; display: inline-block; width: fit-content; margin-top: 2px;
}
.disk-health {
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px;
  background: rgba(62,207,142,0.1); color: var(--success);
}
.disk-health.unknown { background: rgba(255,180,60,0.1); color: var(--warning); }
.disk-usage-bar { display: flex; align-items: center; gap: 10px; }

.usage-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.usage-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.6s; }
.usage-fill.warning { background: var(--warning); }
.usage-fill.danger { background: var(--danger); }
.usage-text { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.usage-pct { font-size: 12px; font-weight: 600; color: var(--text-primary); }

/* 弹窗 */
.modal-overlay {
  position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
.modal-dialog {
  width: 360px; background: rgba(28,28,48,0.95);
  backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-xl);
  padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.modal-dialog h3 { font-size: 16px; margin-bottom: 16px; color: var(--text-primary); }
.modal-dialog input { width: 100%; margin-bottom: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
