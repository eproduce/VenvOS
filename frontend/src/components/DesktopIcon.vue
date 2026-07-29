<template>
  <div
    class="desktop-icon"
    :class="{ selected: isSelected }"
    @click="onClick"
    @dblclick="$emit('dblclick')"
    @contextmenu.prevent="onContextMenu"
  >
    <div class="icon-wrapper">
      <AppIcon :name="iconData.icon" :size="28" />
    </div>
    <div class="icon-label">{{ iconData.name }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppIcon from "./AppIcon.vue";

const props = defineProps({ iconData: Object });
defineEmits(["dblclick"]);

const isSelected = ref(false);

function onClick() {
  isSelected.value = !isSelected.value;
}

function onContextMenu() {
  isSelected.value = true;
}
</script>

<style scoped>
.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 82px;
  padding: 10px 6px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  border: 1px solid transparent;
}
.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}
.desktop-icon.selected {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.3);
}
.icon-wrapper {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  color: var(--accent);
  transition: transform var(--transition);
}
.desktop-icon:hover .icon-wrapper {
  transform: scale(1.06);
}
.icon-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  word-break: break-all;
  line-height: 1.35;
  max-width: 78px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
