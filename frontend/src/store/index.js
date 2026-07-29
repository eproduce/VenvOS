import { defineStore } from "pinia";
import { ref, computed } from "vue";

let windowIdCounter = 1000;

// ==================== 壁纸定义 ====================
// 静态壁纸：用 CSS 渐变模拟 macOS Tahoe 风格景观
export const wallpapers = [
  {
    id: "tahoe-morning",
    name: "Tahoe 晨光",
    type: "static",
    thumbnail: "linear-gradient(180deg, #1a1a3e 0%, #3d5a80 30%, #98c1d9 60%, #e0cfa5 100%)",
    background: `
      radial-gradient(ellipse 80% 50% at 50% 35%, rgba(255,198,120,0.25) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 20% 20%, rgba(130,180,240,0.2) 0%, transparent 50%),
      linear-gradient(180deg, #1e2440 0%, #2d3e62 20%, #4a6d8c 45%, #8db4c8 65%, #d4c9a8 85%, #ebd9b0 100%)
    `,
  },
  {
    id: "tahoe-noon",
    name: "Tahoe 正午",
    type: "static",
    thumbnail: "linear-gradient(180deg, #1a5276 0%, #2980b9 40%, #85c1e9 70%, #d4e6f1 100%)",
    background: `
      radial-gradient(ellipse 70% 50% at 50% 30%, rgba(255,255,255,0.3) 0%, transparent 55%),
      radial-gradient(ellipse 50% 30% at 75% 15%, rgba(255,240,200,0.25) 0%, transparent 50%),
      linear-gradient(180deg, #144a72 0%, #1d6fa5 25%, #3498c8 50%, #6db9d8 70%, #9ad0e6 85%, #c5e3f0 100%)
    `,
  },
  {
    id: "tahoe-dusk",
    name: "Tahoe 黄昏",
    type: "static",
    thumbnail: "linear-gradient(180deg, #2c1654 0%, #7b3f61 40%, #e8785a 70%, #f4b871 100%)",
    background: `
      radial-gradient(ellipse 80% 40% at 50% 55%, rgba(240,130,80,0.3) 0%, transparent 55%),
      radial-gradient(ellipse 50% 35% at 30% 25%, rgba(160,100,140,0.2) 0%, transparent 50%),
      linear-gradient(180deg, #181438 0%, #2d1a4e 20%, #5a3058 40%, #8b3d5c 60%, #c4685a 80%, #e89860 100%)
    `,
  },
  {
    id: "tahoe-night",
    name: "Tahoe 夜色",
    type: "static",
    thumbnail: "linear-gradient(180deg, #0a0a1a 0%, #1a1040 50%, #0d1b2a 100%)",
    background: `
      radial-gradient(ellipse 1px 1px at 20% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(ellipse 1px 1px at 70% 25%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(ellipse 2px 2px at 45% 40%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(ellipse 60% 50% at 50% 80%, rgba(30,40,80,0.4) 0%, transparent 60%),
      linear-gradient(180deg, #07071a 0%, #0d0f28 30%, #11163a 55%, #0d1428 80%, #080e1e 100%)
    `,
  },
  {
    id: "tahoe-forest",
    name: "Tahoe 森林",
    type: "static",
    thumbnail: "linear-gradient(180deg, #0b2e1f 0%, #1a6b3c 40%, #4caf7d 70%, #a5d6a7 100%)",
    background: `
      radial-gradient(ellipse 70% 45% at 50% 35%, rgba(200,255,200,0.15) 0%, transparent 55%),
      radial-gradient(ellipse 50% 30% at 40% 20%, rgba(255,255,220,0.12) 0%, transparent 50%),
      linear-gradient(180deg, #0a2418 0%, #113826 20%, #1a5c34 45%, #2d8050 65%, #4ea870 82%, #82c99a 100%)
    `,
  },
  {
    id: "tahoe-ocean",
    name: "Tahoe 海岸",
    type: "static",
    thumbnail: "linear-gradient(180deg, #053b5e 0%, #0a6e9e 40%, #3ba5c8 70%, #9cddec 100%)",
    background: `
      radial-gradient(ellipse 80% 40% at 50% 30%, rgba(255,255,255,0.25) 0%, transparent 50%),
      radial-gradient(ellipse 50% 35% at 25% 60%, rgba(100,200,220,0.2) 0%, transparent 50%),
      linear-gradient(180deg, #043354 0%, #064e72 20%, #0a6c96 45%, #1d8ab4 65%, #4dabc8 82%, #84cde0 100%)
    `,
  },
  {
    id: "dynamic",
    name: "动态壁纸",
    type: "dynamic",
    thumbnail: "linear-gradient(90deg, #1e2440 0%, #3498c8 33%, #e89860 66%, #07071a 100%)",
  },
];

// 动态壁纸：根据一天中的时间渐变
export function getDynamicWallpaper(hour) {
  // 日出 6:00、正午 12:00、日落 18:00、夜晚 22:00
  const transitions = [
    { h: 0,  sky1: "#050510", sky2: "#07071a", g1: "rgba(20,20,50,0.3)",  g2: "rgba(10,30,80,0.2)" },
    { h: 5,  sky1: "#0a0a28", sky2: "#101835", g1: "rgba(40,40,80,0.3)",  g2: "rgba(20,30,70,0.2)" },
    { h: 6,  sky1: "#1a2040", sky2: "#2d3e62", g1: "rgba(255,160,80,0.2)", g2: "rgba(130,170,230,0.15)" },
    { h: 8,  sky1: "#244a72", sky2: "#4a7d9c", g1: "rgba(255,200,120,0.22)", g2: "rgba(160,200,240,0.12)" },
    { h: 10, sky1: "#1d5fa5", sky2: "#5da8c8", g1: "rgba(255,255,220,0.25)", g2: "rgba(180,210,245,0.1)" },
    { h: 12, sky1: "#144a72", sky2: "#3498c8", g1: "rgba(255,255,240,0.28)", g2: "rgba(200,220,240,0.1)" },
    { h: 14, sky1: "#1d6fa5", sky2: "#5da8c8", g1: "rgba(255,255,200,0.25)", g2: "rgba(180,210,240,0.12)" },
    { h: 16, sky1: "#2d5a80", sky2: "#6d98b8", g1: "rgba(255,200,140,0.22)", g2: "rgba(160,190,220,0.15)" },
    { h: 17, sky1: "#3d4060", sky2: "#7b5568", g1: "rgba(240,150,80,0.28)", g2: "rgba(160,90,130,0.18)" },
    { h: 18, sky1: "#2c1654", sky2: "#7b3f61", g1: "rgba(240,130,60,0.3)",  g2: "rgba(140,80,120,0.2)" },
    { h: 19, sky1: "#1a1038", sky2: "#5a3058", g1: "rgba(220,100,50,0.25)", g2: "rgba(80,60,100,0.18)" },
    { h: 20, sky1: "#101028", sky2: "#2a1a3e", g1: "rgba(150,80,60,0.15)",  g2: "rgba(40,30,70,0.15)" },
    { h: 22, sky1: "#080818", sky2: "#151030", g1: "rgba(30,30,60,0.25)",   g2: "rgba(15,20,60,0.2)" },
  ];

  const sorted = [...transitions].sort((a, b) => a.h - b.h);
  let lower = sorted[0], upper = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (hour >= sorted[i].h && hour < sorted[i + 1].h) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }

  const range = (upper.h - lower.h + 24) % 24 || 1;
  const elapsed = ((hour - lower.h + 24) % 24);
  const t = Math.min(1, elapsed / range);

  function lerp(a, b) { return a + (b - a) * t; }

  const sky1 = lower.sky1; // just use the lower band's colors
  const sky2 = upper.sky2;

  return `
    radial-gradient(ellipse 80% 50% at 50% 40%, ${lower.g1} 0%, transparent 55%),
    radial-gradient(ellipse 60% 35% at 30% 25%, ${lower.g2} 0%, transparent 50%),
    linear-gradient(180deg, ${lower.sky1} 0%, ${interpolateColor(lower.sky1, upper.sky1, t)} 30%, ${interpolateColor(lower.sky2, upper.sky2, t)} 65%, ${upper.sky2} 100%)
  `;
}

function interpolateColor(c1, c2, t) {
  const p = (s) => {
    const m = s.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : [0,0,0];
  };
  const a = p(c1), b = p(c2);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

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

  // ==================== 壁纸系统 ====================
  const currentWallpaperId = ref("tahoe-morning");
  const dynamicBackground = ref("");

  const currentWallpaper = computed(() =>
    wallpapers.find((w) => w.id === currentWallpaperId.value) || wallpapers[0]
  );

  function setWallpaper(id) {
    currentWallpaperId.value = id;
    // 持久化到 localStorage
    try { localStorage.setItem("venvos-wallpaper", id); } catch {}
  }

  function loadWallpaper() {
    try {
      const saved = localStorage.getItem("venvos-wallpaper");
      if (saved && wallpapers.some((w) => w.id === saved)) {
        currentWallpaperId.value = saved;
      }
    } catch {}
  }

  function updateDynamicWallpaper() {
    const hour = new Date().getHours() + new Date().getMinutes() / 60;
    dynamicBackground.value = getDynamicWallpaper(hour);
  }

  // 桌面图标
  const desktopIcons = ref([
    { id: "file-manager", name: "文件管理器", icon: "folder", app: "FileManager" },
    { id: "disk-manager", name: "磁盘管理", icon: "disk", app: "DiskManager" },
    { id: "system-info", name: "系统信息", icon: "monitor", app: "SystemInfo" },
    { id: "notepad", name: "记事本", icon: "file", app: "Notepad" },
    { id: "wallpaper", name: "壁纸设置", icon: "settings", app: "WallpaperSettings" },
  ]);

  // 应用注册表
  const appRegistry = {
    FileManager: { title: "文件管理器", icon: "folder", width: 900, height: 600 },
    DiskManager: { title: "磁盘管理", icon: "disk", width: 800, height: 550 },
    SystemInfo: { title: "系统信息", icon: "monitor", width: 700, height: 500 },
    Notepad: { title: "记事本", icon: "file", width: 600, height: 450 },
    WallpaperSettings: { title: "壁纸设置", icon: "settings", width: 640, height: 480 },
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
    currentWallpaperId,
    currentWallpaper,
    dynamicBackground,
    setWallpaper,
    loadWallpaper,
    updateDynamicWallpaper,
    openApp,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    toggleStartMenu,
    updateTime,
  };
});
