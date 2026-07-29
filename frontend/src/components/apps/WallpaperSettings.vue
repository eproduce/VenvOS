<template>
  <div class="wallpaper-settings">
    <div class="ws-intro">选择一张壁纸来个性化你的桌面</div>
    <div class="ws-grid">
      <div
        v-for="wp in wallpapers"
        :key="wp.id"
        class="ws-card"
        :class="{ active: store.currentWallpaperId === wp.id }"
        @click="selectWallpaper(wp.id)"
      >
        <div class="ws-preview" :style="{ background: wp.thumbnail }">
          <div v-if="wp.type === 'dynamic'" class="ws-badge">
            <AppIcon name="refresh" :size="11" /> 动态
          </div>
          <div v-if="store.currentWallpaperId === wp.id" class="ws-check">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <span class="ws-name">{{ wp.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { wallpapers } from "../../store/index.js";
import { useOSStore } from "../../store/index.js";
import AppIcon from "../AppIcon.vue";

defineProps({ windowId: Number });
const store = useOSStore();

function selectWallpaper(id) {
  store.setWallpaper(id);
}
</script>

<style scoped>
.wallpaper-settings {
  padding: 20px 24px;
  height: 100%;
  overflow-y: auto;
}
.ws-intro {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.ws-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.ws-card {
  cursor: pointer;
  border-radius: var(--radius);
  overflow: hidden;
  border: 2px solid transparent;
  transition: all var(--transition);
}
.ws-card:hover { border-color: rgba(255,255,255,0.15); }
.ws-card.active { border-color: var(--accent); }

.ws-preview {
  height: 90px;
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}
.ws-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(4px);
}
.ws-check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(108,140,255,0.3);
}

.ws-name {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 6px 4px;
  text-align: center;
}
</style>
