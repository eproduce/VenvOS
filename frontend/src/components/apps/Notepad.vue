<template>
  <div class="notepad">
    <div class="np-toolbar">
      <button class="btn btn-ghost btn-sm" @click="newFile">📄 新建</button>
      <button class="btn btn-ghost btn-sm" @click="openFile">📂 打开</button>
      <button class="btn btn-ghost btn-sm" @click="saveFile" :disabled="!currentFilePath">💾 保存</button>
      <span class="np-filename" v-if="currentFilePath">{{ currentFilePath }}</span>
    </div>
    <textarea
      class="np-editor"
      v-model="content"
      placeholder="开始输入..."
      spellcheck="false"
    ></textarea>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../../api.js";

defineProps({ windowId: Number, params: Object });

const content = ref("");
const currentFilePath = ref(null);

function newFile() {
  content.value = "";
  currentFilePath.value = null;
}

async function openFile() {
  const path = prompt("输入文件路径:");
  if (!path) return;
  try {
    const res = await api.get("/api/files/read", { params: { path } });
    content.value = res.data.data.content;
    currentFilePath.value = path;
  } catch (e) {
    alert("打开文件失败: " + (e.response?.data?.error || e.message));
  }
}

async function saveFile() {
  if (!currentFilePath.value) {
    const path = prompt("输入保存路径:");
    if (!path) return;
    currentFilePath.value = path;
  }
  try {
    await api.put("/api/files/write", { path: currentFilePath.value, content: content.value });
  } catch (e) {
    alert("保存失败: " + (e.response?.data?.error || e.message));
  }
}
</script>

<style scoped>
.notepad {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
.np-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.np-filename {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-muted);
}
.np-editor {
  flex: 1;
  background: var(--bg-input);
  color: var(--text-primary);
  border: none;
  padding: 16px;
  font-size: 14px;
  font-family: "Cascadia Code", "Fira Code", "SF Mono", "Menlo", monospace;
  line-height: 1.6;
  resize: none;
  outline: none;
}
.np-editor::placeholder { color: var(--text-muted); }
</style>
