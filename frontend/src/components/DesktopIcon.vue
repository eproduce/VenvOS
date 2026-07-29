<template>
  <div
    class="desktop-icon"
    :class="{ selected: isSelected }"
    @click="onClick"
    @dblclick="$emit('dblclick')"
    @contextmenu.prevent="onContextMenu"
  >
    <div class="icon-image">{{ iconData.icon }}</div>
    <div class="icon-label">{{ iconData.name }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";

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
  width: 80px;
  padding: 10px 6px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background var(--transition);
  border: 1px solid transparent;
}
.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}
.desktop-icon.selected {
  background: rgba(124, 92, 252, 0.15);
  border-color: var(--accent);
}
.icon-image {
  font-size: 36px;
  margin-bottom: 4px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}
.icon-label {
  font-size: 11px;
  color: var(--text-primary);
  text-align: center;
  word-break: break-all;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
