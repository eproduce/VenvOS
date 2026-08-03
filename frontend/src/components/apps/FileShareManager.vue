<template>
  <div class="share-manager">
    <div class="sm-toolbar">
      <button class="btn btn-primary btn-sm" @click="showCreate = true">＋ 新建共享</button>
    </div>

    <div v-if="shares.length === 0" class="empty-state">暂无文件共享，点击上方创建</div>

    <div v-for="s in shares" :key="s.name" class="share-card" :class="{ disabled: !s.enabled }">
      <div class="share-main">
        <div class="share-icon">{{ protoIcon(s.protocol) }}</div>
        <div class="share-info">
          <div class="share-name">{{ s.name }}</div>
          <div class="share-meta">
            <span class="share-tag">{{ s.protocol }}</span>
            <span class="share-tag" :class="s.read_only ? 'ro' : 'rw'">{{ s.read_only ? '只读' : '读写' }}</span>
            <span :class="s.exists ? '' : 'missing'">{{ s.exists ? s.path : '路径不存在: ' + s.path }}</span>
          </div>
        </div>
        <div class="share-actions">
          <button class="btn btn-ghost btn-sm" @click="toggleShare(s)">
            {{ s.enabled ? '停用' : '启用' }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="editShare(s)">编辑</button>
          <button class="btn btn-ghost btn-sm" @click="deleteShare(s)" style="color:var(--danger)">删除</button>
        </div>
      </div>
      <div class="share-detail" v-if="s.comment">{{ s.comment }}</div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <div v-if="showCreate" class="modal-overlay" @click.self="closeModal">
      <div class="modal-dialog" style="width:420px;">
        <h3>{{ editing ? '编辑共享' : '新建文件共享' }}</h3>

        <label class="field-label">共享名称</label>
        <input v-model="form.name" placeholder="如：家庭照片" />

        <label class="field-label">文件夹路径</label>
        <input v-model="form.path" placeholder="如：/Users/xxx/Pictures" />

        <label class="field-label">共享协议</label>
        <select v-model="form.protocol">
          <option v-for="p in protocols" :key="p" :value="p">{{ p }}</option>
        </select>

        <label class="field-label">权限</label>
        <select v-model="form.readOnly">
          <option :value="false">读写</option>
          <option :value="true">只读</option>
        </select>

        <label class="field-label">备注（可选）</label>
        <input v-model="form.comment" placeholder="描述此共享的用途" />

        <div class="modal-actions">
          <button class="btn btn-ghost" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveShare">{{ editing ? '保存' : '创建' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../api.js";

defineProps({ windowId: Number });

const shares = ref([]);
const protocols = ["SMB", "NFS", "WebDAV", "FTP"];
const showCreate = ref(false);
const editing = ref(false);
const form = ref({ name: "", path: "", protocol: "SMB", readOnly: false, comment: "" });

async function loadShares() {
  try {
    const res = await api.get("/api/share");
    shares.value = res.data.data || [];
  } catch {}
}

function protoIcon(p) {
  return ({ SMB: "🪟", NFS: "🐧", WebDAV: "🌐", FTP: "📁" })[p] || "📂";
}

async function saveShare() {
  const f = form.value;
  if (!f.name || !f.path) return;
  try {
    if (editing.value) {
      await api.put(`/api/share/${editing.value}`, {
        read_only: f.readOnly, comment: f.comment,
      });
    } else {
      await api.post("/api/share", {
        name: f.name, path: f.path, protocol: f.protocol,
        read_only: f.readOnly, comment: f.comment,
      });
    }
    closeModal();
    loadShares();
  } catch (e) { alert("操作失败: " + (e.response?.data?.error || e.message)); }
}

function editShare(s) {
  form.value = { name: s.name, path: s.path, protocol: s.protocol, readOnly: s.read_only, comment: s.comment || "" };
  editing.value = s.name;
  showCreate.value = true;
}

function closeModal() {
  showCreate.value = false;
  editing.value = false;
  form.value = { name: "", path: "", protocol: "SMB", readOnly: false, comment: "" };
}

async function toggleShare(s) {
  try {
    await api.post(`/api/share/${s.name}/toggle`);
    loadShares();
  } catch {}
}

async function deleteShare(s) {
  if (!confirm(`确定删除共享 "${s.name}" 吗？`)) return;
  try {
    await api.delete(`/api/share/${s.name}`);
    loadShares();
  } catch {}
}

onMounted(loadShares);
</script>

<style scoped>
.share-manager { padding: 16px; height: 100%; overflow-y: auto; }
.sm-toolbar { margin-bottom: 14px; }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px; }

.share-card {
  background: var(--bg-sidebar); border: 1px solid var(--border-color);
  border-radius: var(--radius); padding: 14px 16px; margin-bottom: 10px;
  transition: opacity 0.2s;
}
.share-card.disabled { opacity: 0.45; }
.share-main { display: flex; align-items: center; gap: 14px; }
.share-icon { font-size: 32px; flex-shrink: 0; }
.share-info { flex: 1; min-width: 0; }
.share-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.share-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 11px; color: var(--text-muted); }
.share-tag {
  padding: 1px 8px; border-radius: 100px; font-weight: 600;
  background: rgba(59,130,246,0.1); color: var(--accent);
}
.share-tag.ro { background: rgba(255,180,60,0.1); color: var(--warning); }
.share-tag.rw { background: rgba(62,207,142,0.1); color: var(--success); }
.share-meta .missing { color: var(--danger); }
.share-actions { display: flex; gap: 4px; flex-shrink: 0; }
.share-detail { font-size: 12px; color: var(--text-muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-light); }

/* 弹窗 */
.modal-overlay {
  position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
.modal-dialog {
  background: rgba(28,28,48,0.95);
  backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-xl);
  padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.modal-dialog h3 { font-size: 16px; margin-bottom: 16px; }
.field-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; margin-top: 10px; }
.modal-dialog input, .modal-dialog select { width: 100%; margin-bottom: 2px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
</style>
