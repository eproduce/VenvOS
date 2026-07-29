<template>
  <div
    v-show="!window.minimized"
    class="window"
    :class="{ maximized: window.maximized, 'is-active': isActive }"
    :style="windowStyle"
    @mousedown="onFocus"
  >
    <!-- 标题栏 -->
    <div class="window-titlebar" @mousedown.stop="onDragStart">
      <div class="titlebar-left">
        <AppIcon :name="window.icon" :size="14" class="title-icon" />
        <span class="title-text">{{ window.title }}</span>
      </div>
      <div class="titlebar-actions">
        <button class="traffic-btn traffic-close" @click.stop="store.closeWindow(window.id)" title="关闭">
          <AppIcon name="x" :size="10" />
        </button>
        <button class="traffic-btn traffic-min" @click.stop="store.minimizeWindow(window.id)" title="最小化">
          <AppIcon name="minimize" :size="10" />
        </button>
        <button class="traffic-btn traffic-max" @click.stop="store.maximizeWindow(window.id)" title="最大化">
          <AppIcon name="maximize" :size="10" />
        </button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="window-body">
      <FileManager
        v-if="window.app === 'FileManager'"
        :window-id="window.id"
        :params="window.params"
      />
      <DiskManager
        v-else-if="window.app === 'DiskManager'"
        :window-id="window.id"
      />
      <SystemInfo
        v-else-if="window.app === 'SystemInfo'"
        :window-id="window.id"
      />
      <Notepad
        v-else-if="window.app === 'Notepad'"
        :window-id="window.id"
        :params="window.params"
      />
      <WallpaperSettings
        v-else-if="window.app === 'WallpaperSettings'"
        :window-id="window.id"
      />
      <div v-else class="app-placeholder">
        <AppIcon :name="window.icon" :size="48" />
        <h3>{{ window.title }}</h3>
      </div>
    </div>

    <!-- 调整大小手柄 -->
    <template v-if="!window.maximized">
      <div class="resize-handle resize-n" @mousedown.stop="onResizeStart('n', $event)"></div>
      <div class="resize-handle resize-s" @mousedown.stop="onResizeStart('s', $event)"></div>
      <div class="resize-handle resize-e" @mousedown.stop="onResizeStart('e', $event)"></div>
      <div class="resize-handle resize-w" @mousedown.stop="onResizeStart('w', $event)"></div>
      <div class="resize-handle resize-ne" @mousedown.stop="onResizeStart('ne', $event)"></div>
      <div class="resize-handle resize-nw" @mousedown.stop="onResizeStart('nw', $event)"></div>
      <div class="resize-handle resize-se" @mousedown.stop="onResizeStart('se', $event)"></div>
      <div class="resize-handle resize-sw" @mousedown.stop="onResizeStart('sw', $event)"></div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted, onUnmounted } from "vue";
import { useOSStore } from "../store/index.js";
import FileManager from "./apps/FileManager.vue";
import DiskManager from "./apps/DiskManager.vue";
import SystemInfo from "./apps/SystemInfo.vue";
import Notepad from "./apps/Notepad.vue";
import WallpaperSettings from "./apps/WallpaperSettings.vue";
import AppIcon from "./AppIcon.vue";

const props = defineProps({
  window: Object,
  isActive: Boolean,
});

const store = useOSStore();

const windowStyle = computed(() => {
  const w = props.window;
  if (w.maximized) {
    return {
      left: "0px",
      top: "0px",
      width: "100vw",
      height: "calc(100vh - var(--taskbar-height))",
      zIndex: w.zIndex,
      borderRadius: "0",
    };
  }
  return {
    left: w.x + "px",
    top: w.y + "px",
    width: w.width + "px",
    height: w.height + "px",
    zIndex: w.zIndex,
  };
});

function onFocus() {
  store.focusWindow(props.window.id);
}

// ==================== 拖拽逻辑 ====================
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

function onDragStart(e) {
  if (props.window.maximized) return;
  dragging = true;
  dragOffsetX = e.clientX - props.window.x;
  dragOffsetY = e.clientY - props.window.y;
  document.addEventListener("mousemove", onDragMove);
  document.addEventListener("mouseup", onDragEnd);
}

function onDragMove(e) {
  if (!dragging) return;
  const win = props.window;
  win.x = Math.max(-win.width + 100, Math.min(e.clientX - dragOffsetX, window.innerWidth - 100));
  win.y = Math.max(0, Math.min(e.clientY - dragOffsetY, window.innerHeight - 60));
}

function onDragEnd() {
  dragging = false;
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);
}

// ==================== 调整大小逻辑 ====================
let resizing = false;
let resizeDir = "";
let resizeStartX, resizeStartY, resizeStartW, resizeStartH, resizeStartL, resizeStartT;

function onResizeStart(dir, e) {
  resizing = true;
  resizeDir = dir;
  const win = props.window;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = win.width;
  resizeStartH = win.height;
  resizeStartL = win.x;
  resizeStartT = win.y;
  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", onResizeEnd);
}

function onResizeMove(e) {
  if (!resizing) return;
  const win = props.window;
  const dx = e.clientX - resizeStartX;
  const dy = e.clientY - resizeStartY;

  if (resizeDir.includes("e")) {
    win.width = Math.max(300, resizeStartW + dx);
  }
  if (resizeDir.includes("s")) {
    win.height = Math.max(200, resizeStartH + dy);
  }
  if (resizeDir.includes("w")) {
    const newW = Math.max(300, resizeStartW - dx);
    win.x = resizeStartL + resizeStartW - newW;
    win.width = newW;
  }
  if (resizeDir.includes("n")) {
    const newH = Math.max(200, resizeStartH - dy);
    win.y = resizeStartT + resizeStartH - newH;
    win.height = newH;
  }
}

function onResizeEnd() {
  resizing = false;
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
}

onUnmounted(() => {
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
});
</script>

<style scoped>
.window {
  position: absolute;
  background: rgba(22, 22, 42, 0.75);
  backdrop-filter: blur(28px) saturate(1.8);
  -webkit-backdrop-filter: blur(28px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow:
    0 1px 2px rgba(0,0,0,0.25),
    0 8px 24px rgba(0,0,0,0.35),
    0 0 0 0.5px rgba(255,255,255,0.06),
    inset 0 0.5px 0 rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow var(--transition-slow), border-color var(--transition-slow);
}
.window.is-active {
  box-shadow:
    0 1px 3px rgba(0,0,0,0.3),
    0 16px 48px rgba(0,0,0,0.5),
    0 0 0 1px rgba(59,130,246,0.25),
    inset 0 0.5px 0 rgba(255,255,255,0.1);
  border-color: rgba(255, 255, 255, 0.14);
}
.window.maximized {
  border-radius: 0 !important;
  border: none;
}

/* 标题栏 — macOS Tahoe 风格 */
.window-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  background: rgba(16, 16, 32, 0.7);
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);
  padding: 0 14px;
  cursor: grab;
  flex-shrink: 0;
}
.window-titlebar:active { cursor: grabbing; }
.maximized .window-titlebar { cursor: default; }

.titlebar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.title-icon {
  color: var(--accent);
  opacity: 0.85;
  flex-shrink: 0;
}
.title-text {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.01em;
}
.titlebar-actions {
  display: flex;
  gap: 8px;
}
.traffic-btn {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all var(--transition);
  position: relative;
}
.traffic-btn svg {
  opacity: 0;
  transition: opacity 0.15s ease;
  color: rgba(0,0,0,0.6);
}
.traffic-btn:hover svg { opacity: 1; }

.traffic-close {
  background: #ff5f57;
}
.traffic-close:hover { background: #ff3b30; }

.traffic-min {
  background: #febc2e;
}
.traffic-min:hover { background: #f5a623; }

.traffic-max {
  background: #28c840;
}
.traffic-max:hover { background: #1da82b; }

/* 非激活窗口按钮变灰 */
.window:not(.is-active) .traffic-btn {
  background: rgba(255,255,255,0.12);
}
.window:not(.is-active) .traffic-btn svg { opacity: 0; }

/* 内容区 — 微弱的内部玻璃感 */
.window-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  background: rgba(12, 12, 24, 0.4);
}

/* 调整大小手柄 */
.resize-handle {
  position: absolute;
  z-index: 20;
}
.resize-n, .resize-s { left: 8px; right: 8px; height: 6px; cursor: ns-resize; }
.resize-n { top: 0; }
.resize-s { bottom: 0; }
.resize-e, .resize-w { top: 8px; bottom: 8px; width: 6px; cursor: ew-resize; }
.resize-e { right: 0; }
.resize-w { left: 0; }
.resize-ne, .resize-nw, .resize-se, .resize-sw { width: 14px; height: 14px; }
.resize-ne { top: 0; right: 0; cursor: nesw-resize; }
.resize-nw { top: 0; left: 0; cursor: nwse-resize; }
.resize-se { bottom: 0; right: 0; cursor: nwse-resize; }
.resize-sw { bottom: 0; left: 0; cursor: nesw-resize; }

.app-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--text-muted);
}
.app-placeholder h3 { font-weight: 600; font-size: 15px; }
</style>
