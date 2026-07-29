<template>
  <!-- 登录界面 -->
  <LoginScreen v-if="!auth.isLoggedIn.value && !auth.loading.value" @login-success="onLoginSuccess" />

  <!-- 加载中 -->
  <div v-else-if="auth.loading.value" class="loading-screen">
    <div class="loading-spinner"></div>
  </div>

  <!-- 桌面 -->
  <div v-else class="os-container" @click.self="store.startMenuOpen = false">
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
    <NotificationPanel v-if="store.showNotifications" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useOSStore } from "./store/index.js";
import { useAuth } from "./auth.js";
import Desktop from "./components/Desktop.vue";
import Window from "./components/Window.vue";
import Taskbar from "./components/Taskbar.vue";
import StartMenu from "./components/StartMenu.vue";
import Calendar from "./components/Calendar.vue";
import LoginScreen from "./components/LoginScreen.vue";
import NotificationPanel from "./components/NotificationPanel.vue";

const store = useOSStore();
const auth = useAuth();

let timer, wallpaperTimer;
onMounted(() => {
  auth.initAuth();
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

function onLoginSuccess() {
  store.loadWallpaper();
  store.updateDynamicWallpaper();
}
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
.loading-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0e1a;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
