<template>
  <div
    class="desktop"
    @click.self="onDesktopClick"
    @contextmenu.prevent="onContextMenu"
    @dblclick.self="openApp('FileManager')"
  >
    <!-- 壁纸层 -->
    <div class="desktop-bg">
      <WallpaperCanvas
        v-if="store.currentWallpaper?.type === 'static' && store.currentWallpaper?.svg"
        :name="store.currentWallpaper.svg"
      />
      <WallpaperCanvas
        v-else
        name="dynamic"
      />
      <div class="bg-soft-light"></div>
    </div>

    <!-- 桌面图标 -->
    <div class="desktop-icons">
      <DesktopIcon
        v-for="item in store.desktopIcons"
        :key="item.id"
        :icon-data="item"
        @dblclick="openApp(item.app)"
      />
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div class="context-menu-item" @click="openApp('FileManager')">
        <AppIcon name="folder" :size="14" /> 打开文件管理器
      </div>
      <div class="context-menu-item" @click="openApp('DiskManager')">
        <AppIcon name="disk" :size="14" /> 磁盘管理
      </div>
      <div class="context-menu-item" @click="openApp('WallpaperSettings')">
        <AppIcon name="settings" :size="14" /> 更换壁纸...
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" @click="openApp('Notepad')">
        <AppIcon name="file" :size="14" /> 新建文本文档
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" @click="contextMenu.show = false">
        <AppIcon name="refresh" :size="14" /> 刷新桌面
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from "vue";
import { useOSStore } from "../store/index.js";
import DesktopIcon from "./DesktopIcon.vue";
import AppIcon from "./AppIcon.vue";
import WallpaperCanvas from "./WallpaperCanvas.vue";

const store = useOSStore();
const contextMenu = reactive({ show: false, x: 0, y: 0 });

function onContextMenu(e) {
  contextMenu.show = true;
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  store.startMenuOpen = false;
}

function onDesktopClick() {
  store.startMenuOpen = false;
  contextMenu.show = false;
}

function openApp(appName) {
  contextMenu.show = false;
  store.openApp(appName);
}

// 点击桌面空白区域或任意位置关闭右键菜单
function onDocumentMouseDown(e) {
  if (!contextMenu.show) return;
  // 检查点击是否在右键菜单内
  const menu = document.querySelector(".context-menu");
  if (menu && menu.contains(e.target)) return;
  contextMenu.show = false;
}

onMounted(() => document.addEventListener("mousedown", onDocumentMouseDown, true));
onUnmounted(() => document.removeEventListener("mousedown", onDocumentMouseDown, true));
</script>

<style scoped>
.desktop {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 壁纸背景 */
.desktop-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.bg-wallpaper {
  position: absolute;
  inset: 0;
  transition: background 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
/* 柔光玻璃层：macOS Tahoe 风格的柔光效果 */
.bg-soft-light {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 100%, rgba(255,255,255,0.03) 0%, transparent 50%);
  pointer-events: none;
}

.desktop-icons {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 4px;
  padding: 18px 14px;
  max-height: 100%;
}
</style>
