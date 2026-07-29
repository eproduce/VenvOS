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
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useOSStore } from "./store/index.js";
import Desktop from "./components/Desktop.vue";
import Window from "./components/Window.vue";
import Taskbar from "./components/Taskbar.vue";
import StartMenu from "./components/StartMenu.vue";

const store = useOSStore();

let timer;
onMounted(() => {
  store.updateTime();
  timer = setInterval(store.updateTime, 1000);
});
onUnmounted(() => clearInterval(timer));
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
