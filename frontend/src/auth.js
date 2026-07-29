/**
 * 认证服务：管理登录态、Token 持久化
 */
import { ref, reactive } from "vue";
import api from "./api.js";

const token = ref(localStorage.getItem("venvos-token") || "");
const user = ref(null);
const isLoggedIn = ref(false);
const loading = ref(true);

// 设置 token
function setToken(t) {
  token.value = t;
  if (t) {
    localStorage.setItem("venvos-token", t);
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  } else {
    localStorage.removeItem("venvos-token");
    delete api.defaults.headers.common["Authorization"];
  }
}

// 初始化：检查登录态
async function initAuth() {
  if (token.value) {
    setToken(token.value);
    try {
      const res = await api.get("/api/auth/me");
      user.value = res.data.data;
      isLoggedIn.value = true;
    } catch {
      setToken("");
      user.value = null;
      isLoggedIn.value = false;
    }
  }
  loading.value = false;
}

async function login(username, password) {
  const res = await api.post("/api/auth/login", { username, password });
  if (res.data.success) {
    setToken(res.data.data.token);
    user.value = res.data.data.user;
    isLoggedIn.value = true;
    return { success: true };
  }
  return { success: false, error: res.data.error };
}

async function logout() {
  try { await api.post("/api/auth/logout"); } catch {}
  setToken("");
  user.value = null;
  isLoggedIn.value = false;
}

async function register(username, password, displayName) {
  const res = await api.post("/api/auth/register", { username, password, display_name: displayName });
  return res.data;
}

export function useAuth() {
  return { token, user, isLoggedIn, loading, initAuth, login, logout, register };
}
