<template>
  <div class="lock-screen">
    <div class="lock-bg">
      <div class="lock-gradient"></div>
    </div>

    <div class="lock-content">
      <!-- 时间日期 -->
      <div class="lock-time">{{ timeText }}</div>
      <div class="lock-date">{{ dateText }}</div>

      <!-- 用户头像区 -->
      <div class="lock-avatar">
        <div class="avatar-circle">{{ avatarLetter }}</div>
      </div>

      <!-- 登录表单 -->
      <div class="lock-form" v-if="!isRegistering">
        <div class="lock-greeting">{{ greeting }}</div>
        <input
          class="lock-input"
          v-model="loginForm.username"
          placeholder="用户名"
          @keydown.enter="focusPassword"
          autofocus
        />
        <input
          ref="passwordInput"
          class="lock-input"
          v-model="loginForm.password"
          type="password"
          placeholder="密码"
          @keydown.enter="doLogin"
        />
        <div v-if="error" class="lock-error">{{ error }}</div>
        <button class="lock-btn" @click="doLogin" :disabled="submitting">
          {{ submitting ? "登录中..." : "登 录" }}
        </button>
        <div class="lock-switch" @click="isRegistering = true; error = ''">
          没有账号？注册一个新账号
        </div>
      </div>

      <!-- 注册表单 -->
      <div class="lock-form" v-else>
        <div class="lock-greeting">创建新账号</div>
        <input class="lock-input" v-model="registerForm.username" placeholder="用户名" />
        <input class="lock-input" v-model="registerForm.displayName" placeholder="显示名称（可选）" />
        <input class="lock-input" v-model="registerForm.password" type="password" placeholder="密码（至少4位）" />
        <div v-if="error" class="lock-error">{{ error }}</div>
        <button class="lock-btn" @click="doRegister" :disabled="submitting">
          {{ submitting ? "注册中..." : "注 册" }}
        </button>
        <div class="lock-switch" @click="isRegistering = false; error = ''">
          已有账号？返回登录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useAuth } from "../auth.js";

const emit = defineEmits(["login-success"]);
const { login, register } = useAuth();

const isRegistering = ref(false);
const submitting = ref(false);
const error = ref("");
const passwordInput = ref(null);

const loginForm = reactive({ username: "", password: "" });
const registerForm = reactive({ username: "", displayName: "", password: "" });

const timeText = ref("");
const dateText = ref("");

let timer;
onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});
onUnmounted(() => clearInterval(timer));

function updateClock() {
  const now = new Date();
  timeText.value = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  dateText.value = now.toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });
}

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 9) return "早上好";
  if (h < 12) return "上午好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
});

const avatarLetter = computed(() => {
  const name = loginForm.username || registerForm.username || "U";
  return name[0].toUpperCase();
});

function focusPassword() {
  passwordInput.value?.focus();
}

async function doLogin() {
  if (!loginForm.username || !loginForm.password) {
    error.value = "请输入用户名和密码";
    return;
  }
  submitting.value = true;
  error.value = "";
  const result = await login(loginForm.username, loginForm.password);
  submitting.value = false;
  if (result.success) {
    emit("login-success");
  } else {
    error.value = result.error || "登录失败";
  }
}

async function doRegister() {
  if (!registerForm.username || !registerForm.password) {
    error.value = "用户名和密码不能为空";
    return;
  }
  if (registerForm.password.length < 4) {
    error.value = "密码至少4位";
    return;
  }
  submitting.value = true;
  error.value = "";
  const result = await register(registerForm.username, registerForm.password, registerForm.displayName);
  submitting.value = false;
  if (result.success) {
    // 注册成功后自动登录
    loginForm.username = registerForm.username;
    loginForm.password = registerForm.password;
    isRegistering.value = false;
    await doLogin();
  } else {
    error.value = result.error || "注册失败";
  }
}
</script>

<style scoped>
.lock-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lock-bg {
  position: absolute;
  inset: 0;
}
.lock-gradient {
  width: 100%;
  height: 100%;
  background:
    radial-gradient(ellipse 60% 50% at 50% 40%, rgba(59,130,246,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 30% 70%, rgba(59,130,246,0.08) 0%, transparent 50%),
    linear-gradient(160deg, #0a0e1a 0%, #101830 40%, #0d1222 100%);
}
.lock-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.lock-time {
  font-size: 56px;
  font-weight: 200;
  color: #fff;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 20px rgba(0,0,0,0.3);
}
.lock-date {
  font-size: 16px;
  color: rgba(255,255,255,0.7);
  font-weight: 400;
  margin-bottom: 30px;
}
.lock-avatar {
  margin-bottom: 16px;
}
.avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #1d4ed8);
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(59,130,246,0.3);
}
.lock-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 280px;
}
.lock-greeting {
  font-size: 15px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 6px;
}
.lock-input {
  width: 100%;
  height: 42px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  padding: 0 16px;
  outline: none;
  transition: all 0.2s;
  text-align: center;
}
.lock-input::placeholder { color: rgba(255,255,255,0.3); }
.lock-input:focus {
  border-color: var(--accent);
  background: rgba(255,255,255,0.1);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.lock-error {
  font-size: 13px;
  color: var(--danger);
}
.lock-btn {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: all 0.2s;
  border: none;
}
.lock-btn:hover { background: var(--accent-hover); }
.lock-btn:disabled { opacity: 0.5; cursor: default; }
.lock-switch {
  font-size: 12.5px;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: color 0.2s;
  margin-top: 8px;
}
.lock-switch:hover { color: var(--accent); }
</style>
