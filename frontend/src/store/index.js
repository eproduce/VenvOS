import { defineStore } from "pinia";
import { ref, computed } from "vue";

let windowIdCounter = 1000;

export const useOSStore = defineStore("os", () => {
  // 打开的窗口列表
  const windows = ref([]);
  // 当前焦点窗口 ID
  const activeWindowId = ref(null);
  // 开始菜单是否打开
  const startMenuOpen = ref(false);
  // 系统时间
  const currentTime = ref("");
  const currentDate = ref("");

  // 桌面图标
  const desktopIcons = ref([
    { id: "file-manager", name: "文件管理器", icon: "folder", app: "FileManager" },
    { id: "disk-manager", name: "磁盘管理", icon: "disk", app: "DiskManager" },
    { id: "system-info", name: "系统信息", icon: "monitor", app: "SystemInfo" },
    { id: "notepad", name: "记事本", icon: "file", app: "Notepad" },
  ]);

  // 应用注册表
  const appRegistry = {
    FileManager: { title: "文件管理器", icon: "folder", width: 900, height: 600 },
    DiskManager: { title: "磁盘管理", icon: "disk", width: 800, height: 550 },
    SystemInfo: { title: "系统信息", icon: "monitor", width: 700, height: 500 },
    Notepad: { title: "记事本", icon: "file", width: 600, height: 450 },
  };

  function openApp(appName, params = {}) {
    const existing = windows.value.find((w) => w.app === appName && !w.minimized);
    if (existing && params.reuse !== false) {
      focusWindow(existing.id);
      return existing.id;
    }
    const appInfo = appRegistry[appName] || { title: appName, icon: "file", width: 600, height: 400 };
    const id = ++windowIdCounter;
    windows.value.push({
      id,
      app: appName,
      title: appInfo.title,
      icon: appInfo.icon,
      x: 50 + (windows.value.length % 5) * 30,
      y: 40 + (windows.value.length % 5) * 30,
      width: appInfo.width,
      height: appInfo.height,
      minimized: false,
      maximized: false,
      zIndex: windows.value.length + 1,
      params,
    });
    focusWindow(id);
    return id;
  }

  function closeWindow(id) {
    windows.value = windows.value.filter((w) => w.id !== id);
    if (activeWindowId.value === id) {
      const remaining = windows.value.filter((w) => !w.minimized);
      activeWindowId.value = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
    }
  }

  function focusWindow(id) {
    activeWindowId.value = id;
    const maxZ = Math.max(...windows.value.map((w) => w.zIndex), 0);
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.zIndex = maxZ + 1;
      if (win.minimized) win.minimized = false;
    }
  }

  function minimizeWindow(id) {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.minimized = !win.minimized;
      if (win.minimized && activeWindowId.value === id) {
        const visible = windows.value.filter((w) => !w.minimized && w.id !== id);
        activeWindowId.value = visible.length > 0 ? visible[visible.length - 1].id : null;
      } else if (!win.minimized) {
        focusWindow(id);
      }
    }
  }

  function maximizeWindow(id) {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.maximized = !win.maximized;
      focusWindow(id);
    }
  }

  function toggleStartMenu() {
    startMenuOpen.value = !startMenuOpen.value;
  }

  function updateTime() {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    currentDate.value = now.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" });
  }

  return {
    windows,
    activeWindowId,
    startMenuOpen,
    currentTime,
    currentDate,
    desktopIcons,
    openApp,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    toggleStartMenu,
    updateTime,
  };
});
