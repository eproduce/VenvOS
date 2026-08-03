<template>
  <div class="file-manager">
    <!-- 侧边栏 -->
    <div class="fm-sidebar">
      <div class="sidebar-header">快速访问</div>
      <div
        v-for="item in quickAccess"
        :key="item.path"
        class="sidebar-item"
        :class="{ active: currentPath === item.path }"
        @click="navigateTo(item.path)"
      >
        <AppIcon :name="item.icon" :size="16" class="si-icon" />
        <span class="si-label">{{ item.label }}</span>
      </div>
    </div>

    <!-- 主区域 -->
    <div class="fm-main">
      <!-- Tab 导航 -->
      <div class="fm-tabs">
        <button :class="{ active: tab === 'files' }" @click="tab = 'files'">📂 文件</button>
        <button :class="{ active: tab === 'shares' }" @click="tab = 'shares'; loadShares()">🪟 共享</button>
      </div>

      <!-- 文件 Tab -->
      <template v-if="tab === 'files'">
      <!-- 工具栏 -->
      <div class="fm-toolbar">
        <div class="toolbar-nav">
          <button class="btn btn-ghost btn-sm" @click="goBack" :disabled="historyIndex <= 0" title="后退">
            <AppIcon name="arrow-left" :size="14" />
          </button>
          <button class="btn btn-ghost btn-sm" @click="goForward" :disabled="historyIndex >= history.length - 1" title="前进">
            <AppIcon name="arrow-right" :size="14" />
          </button>
          <button class="btn btn-ghost btn-sm" @click="refresh" title="刷新">
            <AppIcon name="refresh" :size="14" />
          </button>
        </div>
        <div class="toolbar-path">
          <input
            class="path-input"
            :value="currentPath"
            @keydown.enter="navigateTo($event.target.value)"
            @blur="navigateTo($event.target.value)"
          />
        </div>
        <div class="toolbar-search">
          <input
            class="search-input"
            v-model="searchQuery"
            @keydown.enter="doSearch"
            placeholder="搜索文件..."
          />
          <button class="btn btn-ghost btn-sm" @click="doSearch">
            <AppIcon name="search" :size="14" />
          </button>
        </div>
        <div class="toolbar-actions">
          <button class="btn btn-primary btn-sm" @click="showCreateMenu = !showCreateMenu">
            <AppIcon name="plus" :size="13" /> 新建
          </button>
          <div v-if="showCreateMenu" class="create-dropdown">
            <div class="context-menu-item" @click="createNew('folder')">
              <AppIcon name="folder" :size="13" /> 新建文件夹
            </div>
            <div class="context-menu-item" @click="createNew('file')">
              <AppIcon name="file" :size="13" /> 新建文件
            </div>
          </div>
        </div>
      </div>

      <!-- 路径面包屑 -->
      <div class="fm-breadcrumb">
        <span
          v-for="(part, idx) in pathParts"
          :key="idx"
          class="breadcrumb-item"
          @click="navigateTo(part.path)"
        >
          {{ part.name }}
          <span v-if="idx < pathParts.length - 1" class="breadcrumb-sep"> › </span>
        </span>
      </div>

      <!-- 文件列表 -->
      <div class="fm-list" @contextmenu.prevent="onContextMenu">
        <div class="list-header">
          <span class="col-name">名称</span>
          <span class="col-size">大小</span>
          <span class="col-modified">修改时间</span>
          <span class="col-type">类型</span>
        </div>

        <div v-if="loading" class="list-loading">加载中...</div>

        <div v-else-if="displayItems.length === 0" class="list-empty">此文件夹为空</div>

        <div
          v-else
          v-for="item in displayItems"
          :key="item.path"
          class="list-item"
          :class="{ selected: selectedItem?.path === item.path }"
          @click="onSelectItem(item, $event)"
          @dblclick="onOpenItem(item)"
          @contextmenu.stop.prevent="onItemContextMenu(item, $event)"
        >
          <span class="col-name">
            <AppIcon :name="item.type === 'directory' ? 'folder' : getFileIcon(item.extension)" :size="18" class="item-icon" />
            <span class="item-name" v-if="renamingItem?.path !== item.path">{{ item.name }}</span>
            <input
              v-else
              class="rename-input"
              v-model="renameValue"
              @keydown.enter="confirmRename"
              @keydown.escape="cancelRename"
              @blur="confirmRename"
              ref="renameInputRef"
            />
          </span>
          <span class="col-size">{{ item.type === 'directory' ? '--' : formatSize(item.size) }}</span>
          <span class="col-modified">{{ formatDate(item.modified) }}</span>
          <span class="col-type">{{ item.type === 'directory' ? '文件夹' : (item.extension || '文件') }}</span>
        </div>
      </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <template v-if="contextMenu.item">
        <div class="context-menu-item" @click="openItem(contextMenu.item)">
          <AppIcon name="folder" :size="13" /> 打开
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" @click="startRename(contextMenu.item)">
          <AppIcon name="edit" :size="13" /> 重命名
        </div>
        <div class="context-menu-item" @click="deleteItem(contextMenu.item)">
          <AppIcon name="trash" :size="13" /> 删除
        </div>
      </template>
      <template v-else>
        <div class="context-menu-item" @click="createNew('folder')">
          <AppIcon name="folder" :size="13" /> 新建文件夹
        </div>
        <div class="context-menu-item" @click="createNew('file')">
          <AppIcon name="file" :size="13" /> 新建文件
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" @click="refresh">
          <AppIcon name="refresh" :size="13" /> 刷新
        </div>
      </template>
    </div>
    </template>

    <!-- 共享 Tab -->
    <template v-if="tab === 'shares'">
    <div class="shares-section">
      <div class="share-toolbar">
        <button class="btn btn-primary btn-sm" @click="showShareModal = true">＋ 新建共享</button>
      </div>
      <div v-if="shares.length === 0" class="empty-state">暂无文件共享</div>
      <div v-for="s in shares" :key="s.name" class="share-card" :class="{ disabled: !s.enabled }">
        <div class="share-main">
          <span class="share-icon">{{ {SMB:'🪟',NFS:'🐧',WebDAV:'🌐',FTP:'📁'}[s.protocol] || '📂' }}</span>
          <div class="share-info">
            <span class="share-name">{{ s.name }}</span>
            <div class="share-meta">
              <span class="share-tag">{{ s.protocol }}</span>
              <span class="share-tag" :class="s.read_only ? 'ro' : 'rw'">{{ s.read_only ? '只读' : '读写' }}</span>
              <span :class="s.exists ? '' : 'missing'">{{ s.path }}</span>
            </div>
          </div>
          <div class="share-actions">
            <button class="btn btn-ghost btn-sm" @click="toggleShare(s)">{{ s.enabled ? '停用' : '启用' }}</button>
            <button class="btn btn-ghost btn-sm" @click="deleteShare(s)" style="color:var(--danger)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建共享弹窗 -->
    <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
      <div class="modal-dialog">
        <h3>新建文件共享</h3>
        <label class="field-label">共享名称</label>
        <input v-model="shareForm.name" placeholder="如：家庭照片" />
        <label class="field-label">文件夹路径</label>
        <input v-model="shareForm.path" placeholder="如：/Users/xxx/Pictures" />
        <label class="field-label">共享协议</label>
        <select v-model="shareForm.protocol">
          <option v-for="p in shareProtocols" :key="p" :value="p">{{ p }}</option>
        </select>
        <label class="field-label">权限</label>
        <select v-model="shareForm.readOnly">
          <option :value="false">读写</option>
          <option :value="true">只读</option>
        </select>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showShareModal = false">取消</button>
          <button class="btn btn-primary" @click="createShare">创建</button>
        </div>
      </div>
    </div>
    </template>
  </div>
</div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from "vue";
import api from "../../api.js";
import AppIcon from "../AppIcon.vue";

const props = defineProps({ windowId: Number, params: Object });

const tab = ref("files");

// ==================== 文件管理 ====================
const quickAccess = [
  { label: "主目录", icon: "folder", path: "/Users" },
  { label: "桌面", icon: "monitor", path: "/Users/" + (props.params?.username || "") + "/Desktop" },
  { label: "文档", icon: "file", path: "/Users/" + (props.params?.username || "") + "/Documents" },
  { label: "下载", icon: "save", path: "/Users/" + (props.params?.username || "") + "/Downloads" },
  { label: "根目录", icon: "disk", path: "/" },
];

const currentPath = ref(props.params?.path || "/Users");
const items = ref([]);
const loading = ref(false);
const selectedItem = ref(null);
const searchQuery = ref("");
const showCreateMenu = ref(false);

// 历史导航
const history = ref([currentPath.value]);
const historyIndex = ref(0);

// 上下文菜单
const contextMenu = reactive({ show: false, x: 0, y: 0, item: null });

// 重命名
const renamingItem = ref(null);
const renameValue = ref("");
const renameInputRef = ref(null);

// 面包屑
const pathParts = computed(() => {
  const parts = currentPath.value.split("/").filter(Boolean);
  const result = [{ name: "根目录", path: "/" }];
  let cumulative = "";
  for (const part of parts) {
    cumulative += "/" + part;
    result.push({ name: part, path: cumulative });
  }
  return result;
});

// 显示项目
const displayItems = computed(() => {
  if (!searchQuery.value.trim()) return items.value;
  const q = searchQuery.value.toLowerCase();
  return items.value.filter((item) => item.name.toLowerCase().includes(q));
});

// 加载目录
async function loadDirectory(path) {
  loading.value = true;
  selectedItem.value = null;
  try {
    const res = await api.get("/api/files/list", { params: { path } });
    items.value = res.data.data || [];
    currentPath.value = path;
  } catch (e) {
    console.error("加载目录失败:", e);
  } finally {
    loading.value = false;
  }
}

// 导航
function navigateTo(path) {
  if (path === currentPath.value) return;
  // 截断前进历史
  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push(path);
  historyIndex.value = history.value.length - 1;
  loadDirectory(path);
}

function goBack() {
  if (historyIndex.value > 0) {
    historyIndex.value--;
    loadDirectory(history.value[historyIndex.value]);
  }
}

function goForward() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++;
    loadDirectory(history.value[historyIndex.value]);
  }
}

function refresh() {
  loadDirectory(currentPath.value);
}

// 选择与打开
function onSelectItem(item, e) {
  selectedItem.value = item;
  if (e.ctrlKey) {
    // 多选可扩展
  }
}

function onOpenItem(item) {
  if (item.type === "directory") {
    navigateTo(item.path);
  } else {
    // 可以打开文件预览
    console.log("打开文件:", item.path);
  }
}

function openItem(item) {
  contextMenu.show = false;
  onOpenItem(item);
}

// 创建
async function createNew(type) {
  showCreateMenu.value = false;
  contextMenu.show = false;
  const name = prompt(type === "folder" ? "新建文件夹名称:" : "新建文件名称:");
  if (!name) return;
  const fullPath = currentPath.value + "/" + name;
  try {
    if (type === "folder") {
      await api.post("/api/files/directory", { path: fullPath });
    } else {
      await api.post("/api/files/file", { path: fullPath, content: "" });
    }
    refresh();
  } catch (e) {
    alert("创建失败: " + (e.response?.data?.error || e.message));
  }
}

// 重命名
function startRename(item) {
  contextMenu.show = false;
  renamingItem.value = item;
  renameValue.value = item.name;
  nextTick(() => {
    renameInputRef.value?.focus();
    renameInputRef.value?.select();
  });
}

async function confirmRename() {
  if (!renamingItem.value) return;
  if (renameValue.value && renameValue.value !== renamingItem.value.name) {
    try {
      await api.put("/api/files/rename", {
        path: renamingItem.value.path,
        new_name: renameValue.value,
      });
    } catch (e) {
      console.error("重命名失败:", e);
    }
  }
  renamingItem.value = null;
  refresh();
}

function cancelRename() {
  renamingItem.value = null;
}

// 删除
async function deleteItem(item) {
  contextMenu.show = false;
  if (!confirm(`确定要删除 "${item.name}" 吗？`)) return;
  try {
    await api.delete("/api/files/delete", { data: { path: item.path } });
    refresh();
  } catch (e) {
    alert("删除失败: " + (e.response?.data?.error || e.message));
  }
}

// 搜索
function doSearch() {
  if (!searchQuery.value.trim()) return;
  // 在当前目录过滤显示
}

// 右键菜单
function onContextMenu(e) {
  contextMenu.show = true;
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  contextMenu.item = null;
}

function onItemContextMenu(item, e) {
  contextMenu.show = true;
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  contextMenu.item = item;
  selectedItem.value = item;
}

// 工具函数
function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return size.toFixed(i > 0 ? 1 : 0) + " " + units[i];
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN") + " " + d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function getFileIcon(ext) {
  return "file";
}

// 初始化
loadDirectory(currentPath.value);

// ==================== 文件共享 ====================
const shares = ref([]);
const showShareModal = ref(false);
const shareProtocols = ["SMB", "NFS", "WebDAV", "FTP"];
const shareForm = ref({ name: "", path: "", protocol: "SMB", readOnly: false });

async function loadShares() {
  try { const res = await api.get("/api/share"); shares.value = res.data.data || []; } catch {}
}
async function createShare() {
  if (!shareForm.value.name || !shareForm.value.path) return;
  try {
    await api.post("/api/share", { name: shareForm.value.name, path: shareForm.value.path, protocol: shareForm.value.protocol, read_only: shareForm.value.readOnly });
    showShareModal.value = false;
    shareForm.value = { name: "", path: "", protocol: "SMB", readOnly: false };
    loadShares();
  } catch (e) { alert("创建失败: " + (e.response?.data?.error || e.message)); }
}
async function toggleShare(s) {
  try { await api.post(`/api/share/${s.name}/toggle`); loadShares(); } catch {}
}
async function deleteShare(s) {
  if (!confirm(`确定删除共享 "${s.name}" 吗？`)) return;
  try { await api.delete(`/api/share/${s.name}`); loadShares(); } catch {}
}
</script>

<style scoped>
.file-manager {
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--bg-window);
}

/* 侧边栏 */
.fm-sidebar {
  width: 180px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  padding: 8px;
  overflow-y: auto;
  flex-shrink: 0;
}
.sidebar-header {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 6px 10px;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all var(--transition);
}
.sidebar-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.sidebar-item.active { background: rgba(124,92,252,0.12); color: var(--accent); }
.si-icon { font-size: 16px; }

/* 主区域 */
.fm-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* Tabs */
.fm-tabs {
  display: flex; border-bottom: 1px solid var(--border-color); flex-shrink: 0;
}
.fm-tabs button {
  padding: 8px 20px; font-size: 12.5px; color: var(--text-muted);
  background: none; border-bottom: 2px solid transparent;
  transition: all var(--transition);
}
.fm-tabs button:hover { color: var(--text-primary); }
.fm-tabs button.active { color: var(--accent); border-bottom-color: var(--accent); }

/* 工具栏 */
.fm-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.toolbar-nav { display: flex; gap: 2px; }
.path-input, .search-input {
  height: 28px;
  font-size: 12px;
  padding: 4px 10px;
}
.path-input { width: 280px; }
.search-input { width: 150px; }
.toolbar-actions { position: relative; }

.create-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: #1e1e30;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 4px;
  z-index: 50;
  min-width: 140px;
}

/* 面包屑 */
.fm-breadcrumb {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}
.breadcrumb-item {
  cursor: pointer;
  transition: color var(--transition);
}
.breadcrumb-item:hover { color: var(--accent); }
.breadcrumb-sep { margin: 0 4px; color: var(--text-muted); }

/* 文件列表 */
.fm-list {
  flex: 1;
  overflow-y: auto;
  font-size: 12px;
}
.list-header {
  display: flex;
  padding: 6px 12px;
  color: var(--text-muted);
  font-size: 11px;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background: var(--bg-window);
  z-index: 1;
}
.list-loading, .list-empty {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}
.list-item {
  display: flex;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background var(--transition);
}
.list-item:hover { background: var(--bg-hover); }
.list-item.selected { background: rgba(124,92,252,0.1); }

.col-name {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.col-size { flex: 1; text-align: right; color: var(--text-secondary); }
.col-modified { flex: 1.2; text-align: right; color: var(--text-secondary); }
.col-type { flex: 0.8; text-align: right; color: var(--text-secondary); }

.item-icon { font-size: 18px; flex-shrink: 0; }
.item-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.rename-input {
  height: 22px;
  padding: 2px 6px;
  font-size: 12px;
  width: 200px;
}

/* 共享 */
.shares-section { padding: 16px; overflow-y: auto; flex: 1; }
.share-toolbar { margin-bottom: 14px; }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px; }
.share-card {
  background: var(--bg-sidebar); border: 1px solid var(--border-color);
  border-radius: var(--radius); padding: 12px 16px; margin-bottom: 8px;
}
.share-card.disabled { opacity: 0.45; }
.share-main { display: flex; align-items: center; gap: 12px; }
.share-icon { font-size: 28px; flex-shrink: 0; }
.share-info { flex: 1; min-width: 0; }
.share-name { font-size: 13px; font-weight: 600; display: block; }
.share-meta { display: flex; gap: 6px; align-items: center; margin-top: 4px; font-size: 11px; color: var(--text-muted); }
.share-tag { padding: 1px 8px; border-radius: 100px; font-weight: 600; background: rgba(59,130,246,0.1); color: var(--accent); }
.share-tag.ro { background: rgba(255,180,60,0.1); color: var(--warning); }
.share-tag.rw { background: rgba(62,207,142,0.1); color: var(--success); }
.share-meta .missing { color: var(--danger); }
.share-actions { display: flex; gap: 4px; flex-shrink: 0; }

.modal-overlay {
  position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
}
.modal-dialog {
  width: 360px; background: rgba(28,28,48,0.95);
  backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-xl);
  padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.modal-dialog h3 { font-size: 16px; margin-bottom: 16px; }
.field-label { display: block; font-size: 12px; color: var(--text-muted); margin: 8px 0 4px; }
.modal-dialog input, .modal-dialog select { width: 100%; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
</style>
