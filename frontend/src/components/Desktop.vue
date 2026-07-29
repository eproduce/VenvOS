<template>
  <div
    class="desktop"
    @click.self="store.startMenuOpen = false"
    @contextmenu.prevent="onContextMenu"
    @dblclick.self="openApp('FileManager')"
  >
    <!-- 桌面背景层 -->
    <div class="desktop-bg">
      <div class="bg-gradient-1"></div>
      <div class="bg-gradient-2"></div>
      <div class="bg-gradient-3"></div>
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
import { reactive } from "vue";
import { useOSStore } from "../store/index.js";
import DesktopIcon from "./DesktopIcon.vue";
import AppIcon from "./AppIcon.vue";

const store = useOSStore();
const contextMenu = reactive({ show: false, x: 0, y: 0 });

function onContextMenu(e) {
  contextMenu.show = true;
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  store.startMenuOpen = false;
}

function openApp(appName) {
  contextMenu.show = false;
  store.openApp(appName);
}
</script>

<style scoped>
.desktop {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 现代化背景 */
.desktop-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.bg-gradient-1 {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 30%, #0f111a 60%, #0d1117 100%);
}
.bg-gradient-2 {
  position: absolute;
  top: -40%;
  left: -20%;
  width: 70%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(108, 140, 255, 0.06) 0%, transparent 70%);
  animation: bgFloat1 20s ease-in-out infinite;
}
.bg-gradient-3 {
  position: absolute;
  bottom: -30%;
  right: -10%;
  width: 60%;
  height: 80%;
  background: radial-gradient(ellipse at center, rgba(62, 207, 142, 0.04) 0%, transparent 70%);
  animation: bgFloat2 25s ease-in-out infinite;
}
@keyframes bgFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.05); }
}
@keyframes bgFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, 30px) scale(1.08); }
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
