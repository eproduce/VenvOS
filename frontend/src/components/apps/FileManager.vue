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
        <span class="si-icon">{{ item.icon }}</span>
        <span class="si-label">{{ item.label }}</span>
      </div>
    </div>

    <!-- 主区域 -->
    <div class="fm-main">
      <!-- 工具栏 -->
      <div class="fm-toolbar">
        <div class="toolbar-nav">
          <button class="btn btn-ghost btn-sm" @click="goBack" :disabled="historyIndex <= 0" title="后退">◀</button>
          <button class="btn btn-ghost btn-sm" @click="goForward" :disabled="historyIndex >= history.length - 1" title="前进">▶</button>
          <button class="btn btn-ghost btn-sm" @click="refresh" title="刷新">🔄</button>
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
          <button class="btn btn-ghost btn-sm" @click="doSearch">🔍</button>
        </div>
        <div class="toolbar-actions">
          <button class="btn btn-primary btn-sm" @click="showCreateMenu = !showCreateMenu">＋ 新建</button>
          <div v-if="showCreateMenu" class="create-dropdown">
            <div class="context-menu-item" @click="createNew('folder')">📁 新建文件夹</div>
            <div class="context-menu-item" @click="createNew('file')">📄 新建文件</div>
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
            <span class="item-icon">{{ item.type === 'directory' ? '📁' : getFileIcon(item.extension) }}</span>
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
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <template v-if="contextMenu.item">
        <div class="context-menu-item" @click="openItem(contextMenu.item)">
          <span>📂</span> 打开
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" @click="startRename(contextMenu.item)">
          <span>✏️</span> 重命名
        </div>
        <div class="context-menu-item" @click="deleteItem(contextMenu.item)">
          <span>🗑️</span> 删除
        </div>
      </template>
      <template v-else>
        <div class="context-menu-item" @click="createNew('folder')">
          <span>📁</span> 新建文件夹
        </div>
        <div class="context-menu-item" @click="createNew('file')">
          <span>📄</span> 新建文件
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" @click="refresh">
          <span>🔄</span> 刷新
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from "vue";
import api from "../../api.js";

const props = defineProps({ windowId: Number, params: Object });

// 快速访问
const quickAccess = [
  { label: "主目录", icon: "🏠", path: "/Users" },
  { label: "桌面", icon: "🖥️", path: "/Users/" + (props.params?.username || "") + "/Desktop" },
  { label: "文档", icon: "📄", path: "/Users/" + (props.params?.username || "") + "/Documents" },
  { label: "下载", icon: "⬇️", path: "/Users/" + (props.params?.username || "") + "/Downloads" },
  { label: "根目录", icon: "💻", path: "/" },
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
  const map = {
    ".txt": "📝", ".md": "📘", ".json": "📋", ".xml": "📋",
    ".png": "🖼️", ".jpg": "🖼️", ".jpeg": "🖼️", ".gif": "🖼️", ".svg": "🖼️",
    ".mp3": "🎵", ".wav": "🎵", ".mp4": "🎬", ".avi": "🎬",
    ".zip": "📦", ".tar": "📦", ".gz": "📦",
    ".py": "🐍", ".js": "📜", ".ts": "📜", ".html": "🌐", ".css": "🎨",
    ".pdf": "📕", ".doc": "📄", ".docx": "📄", ".xls": "📊",
  };
  return map[ext] || "📄";
}

// 初始化
loadDirectory(currentPath.value);
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
</style>
