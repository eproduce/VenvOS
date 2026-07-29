<template>
  <div class="os-container" @click.self="store.startMenuOpen = false">
    <Desktop />
    <div class="windows-layer">
      <Window
        v-for="win in store.windows"
        :key="win.id"
        :window="win"
        :is-active="store.activeWindowId === win.id"
      />
    </div>
    <Taskbar />
    <StartMenu v-if="store.startMenuOpen" />
    <Calendar v-if="store.showCalendar" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useOSStore } from "./store/index.js";
import Desktop from "./components/Desktop.vue";
import Window from "./components/Window.vue";
import Taskbar from "./components/Taskbar.vue";
import StartMenu from "./components/StartMenu.vue";
import Calendar from "./components/Calendar.vue";

const store = useOSStore();

let timer, wallpaperTimer;
onMounted(() => {
  store.loadWallpaper();
  store.updateTime();
  store.updateDynamicWallpaper();
  timer = setInterval(store.updateTime, 1000);
  wallpaperTimer = setInterval(store.updateDynamicWallpaper, 60000);
});
onUnmounted(() => {
  clearInterval(timer);
  clearInterval(wallpaperTimer);
});
</script>

<style scoped>
.os-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}
.windows-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: var(--taskbar-height);
  pointer-events: none;
  z-index: 10;
}
.windows-layer > * {
  pointer-events: auto;
}
</style>
