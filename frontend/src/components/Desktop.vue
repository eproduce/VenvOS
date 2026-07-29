<template>
  <div
    class="desktop"
    @click.self="store.startMenuOpen = false"
    @contextmenu.prevent="onContextMenu"
    @dblclick.self="openApp('FileManager')"
  >
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
        <span>📁</span> 打开文件管理器
      </div>
      <div class="context-menu-item" @click="openApp('DiskManager')">
        <span>💾</span> 磁盘管理
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" @click="openApp('Notepad')">
        <span>📝</span> 新建文本文档
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" @click="contextMenu.show = false">
        <span>🔄</span> 刷新桌面
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useOSStore } from "../store/index.js";
import DesktopIcon from "./DesktopIcon.vue";

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
  background:
    radial-gradient(ellipse at 30% 20%, rgba(124, 92, 252, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba(76, 175, 125, 0.06) 0%, transparent 60%),
    linear-gradient(135deg, var(--bg-desktop) 0%, var(--bg-desktop-alt) 100%);
  position: relative;
  overflow: hidden;
}
.desktop-icons {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 6px;
  padding: 20px;
  max-height: 100%;
}
</style>
