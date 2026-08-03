import { defineStore } from "pinia";
import { ref, computed } from "vue";

let windowIdCounter = 1000;

// ==================== 壁纸定义 ====================
// CSS 渐变模拟 macOS 风格动态景观
export const wallpapers = [
  {
    id: "dynamic",
    name: "动态壁纸",
    type: "dynamic",
    thumbnail: "linear-gradient(90deg, #1e2440 0%, #3498c8 33%, #e89860 66%, #07071a 100%)",
  },
  {
    id: "macos-mountain",
    name: "macOS 山脉",
    type: "static",
    thumbnail: "linear-gradient(180deg, #1a3a5c 0%, #e8a87c 70%, #2d5a3f 100%)",
    background: `
      radial-gradient(circle 180px at 65% 52%, rgba(255,220,160,0.7) 0%, rgba(255,180,100,0.2) 40%, transparent 60%),
      radial-gradient(ellipse 100% 30% at 50% 78%, #1a3a28 0%, #0d1f14 100%),
      radial-gradient(ellipse 120% 35% at 50% 70%, #2d5a3f 0%, transparent 100%),
      linear-gradient(175deg, #1a3458 0%, #2d5a8c 25%, #6ba3c7 45%, #8fc4d8 55%, #d4a878 68%, #e8c8a0 85%, #3a6040 100%)
    `,
  },
  {
    id: "macos-desert",
    name: "macOS 沙漠",
    type: "static",
    thumbnail: "linear-gradient(180deg, #5c3a6e 0%, #e89860 50%, #c4a060 100%)",
    background: `
      radial-gradient(circle 120px at 70% 35%, rgba(255,240,200,0.5) 0%, rgba(255,200,100,0.1) 50%, transparent 70%),
      radial-gradient(ellipse 100% 35% at 50% 82%, #8b6b4a 0%, #3d2a1a 100%),
      radial-gradient(ellipse 100% 20% at 50% 75%, #c49560 0%, transparent 100%),
      linear-gradient(180deg, #3c1a4e 0%, #6a2a5e 18%, #a04a6a 35%, #d4786a 52%, #e8a060 68%, #d4b878 82%, #9b7a50 100%)
    `,
  },
  {
    id: "macos-aurora",
    name: "极光之夜",
    type: "static",
    thumbnail: "linear-gradient(180deg, #0a0a2e 0%, #1a3a5e 50%, #0d2a1a 100%)",
    background: `
      radial-gradient(ellipse 1px 1px at 15% 10%, #fff 0%, transparent 100%),
      radial-gradient(ellipse 1px 1px at 35% 8%, #fff 0%, transparent 100%),
      radial-gradient(ellipse 1px 1px at 60% 12%, #fff 0%, transparent 100%),
      radial-gradient(ellipse 1px 1px at 78% 6%, #fff 0%, transparent 100%),
      radial-gradient(ellipse 80% 6% at 50% 30%, rgba(100,220,180,0.15) 0%, transparent 70%),
      radial-gradient(ellipse 70% 4% at 40% 28%, rgba(120,180,240,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 60% 10% at 55% 32%, rgba(140,200,160,0.1) 0%, transparent 60%),
      radial-gradient(ellipse 100% 35% at 50% 90%, #0a1a10 0%, transparent 70%),
      linear-gradient(180deg, #050520 0%, #0a1030 20%, #0d1840 40%, #0a1a30 65%, #081a20 85%, #0a1a15 100%)
    `,
  },
  {
    id: "macos-lake",
    name: "静谧湖泊",
    type: "static",
    thumbnail: "linear-gradient(180deg, #2a4a6e 0%, #8fc4d8 50%, #2a4a6e 100%)",
    background: `
      radial-gradient(circle 160px at 50% 20%, rgba(255,255,240,0.3) 0%, transparent 55%),
      radial-gradient(ellipse 100% 40% at 50% 45%, rgba(50,100,160,0.25) 0%, rgba(30,60,100,0.15) 50%, transparent 80%),
      radial-gradient(ellipse 100% 30% at 50% 88%, #1a3040 0%, #0a1820 100%),
      linear-gradient(180deg, #1a3a5c 0%, #2d5680 20%, #4a78a0 40%, #8bb8cc 52%, #3a6888 58%, #284868 75%, #1a3048 100%)
    `,
  },
  {
    id: "macos-spring",
    name: "春日花海",
    type: "static",
    thumbnail: "linear-gradient(180deg, #7ab8d4 0%, #c4e0a0 50%, #e8b4c8 100%)",
    background: `
      radial-gradient(ellipse 60% 30% at 70% 60%, rgba(240,160,200,0.2) 0%, transparent 60%),
      radial-gradient(ellipse 50% 25% at 30% 65%, rgba(200,240,160,0.2) 0%, transparent 60%),
      radial-gradient(ellipse 100% 25% at 50% 85%, #7a9a50 0%, #3a5a20 100%),
      linear-gradient(180deg, #5a9ac0 0%, #8bc4dc 30%, #a4d4e0 50%, #c8e8c0 68%, #e8c8d0 82%, #c4a0b0 100%)
    `,
  },
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
];
    thumbnail: "linear-gradient(90deg, #1e2440 0%, #3498c8 33%, #e89860 66%, #07071a 100%)",
  },
];

// 动态壁纸：根据时间模拟 macOS 风格白天→日落→夜晚 + 太阳轨迹
export function getDynamicWallpaper(hour) {
  // 太阳位置计算：6点日出在地平线，12点在最高点，18点日落在地平线
  const sunProgress = Math.max(0, Math.min(1, (hour - 6) / 12)); // 0=日出, 0.5=正午, 1=日落
  const sunX = 20 + sunProgress * 60; // 从左到右：20% → 80%
  const sunY = 75 - Math.sin(sunProgress * Math.PI) * 55; // 抛物线：75% → 20% → 75%
  const sunOpacity = sunProgress < 0.05 || sunProgress > 0.95 ? 0.1 : Math.sin(sunProgress * Math.PI) * 0.5;

  // 天空颜色过渡
  const transitions = [
    { h: 0,  top: "#050510", mid: "#080820", bot: "#0a0a18", sun: "rgba(255,255,240,0.05)" },
    { h: 5,  top: "#0a0a28", mid: "#121838", bot: "#101028", sun: "rgba(255,200,100,0.1)" },
    { h: 6,  top: "#1a2848", mid: "#304868", bot: "#253050", sun: "rgba(255,180,80,0.35)" },
    { h: 8,  top: "#2a5080", mid: "#5a88b8", bot: "#406898", sun: "rgba(255,240,180,0.45)" },
    { h: 10, top: "#2868a4", mid: "#68a4d0", bot: "#4080b0", sun: "rgba(255,255,220,0.5)" },
    { h: 12, top: "#2060a0", mid: "#60a0d0", bot: "#3880b8", sun: "rgba(255,255,240,0.55)" },
    { h: 14, top: "#2a68a4", mid: "#68a4d0", bot: "#4088b8", sun: "rgba(255,250,200,0.45)" },
    { h: 16, top: "#305080", mid: "#6088b0", bot: "#305878", sun: "rgba(255,200,120,0.35)" },
    { h: 17, top: "#3a3858", mid: "#785868", bot: "#483848", sun: "rgba(240,140,60,0.4)" },
    { h: 18, top: "#2a1848", mid: "#6a3860", bot: "#402048", sun: "rgba(240,100,40,0.3)" },
    { h: 19, top: "#180e30", mid: "#3a2040", bot: "#200e28", sun: "rgba(200,80,30,0.15)" },
    { h: 20, top: "#0c0a20", mid: "#1a1030", bot: "#0e0a20", sun: "rgba(0,0,0,0)" },
    { h: 22, top: "#060610", mid: "#0c0a20", bot: "#060610", sun: "rgba(0,0,0,0)" },
  ];

  const sorted = [...transitions].sort((a, b) => a.h - b.h);
  let lower = sorted[0], upper = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (hour >= sorted[i].h && hour < sorted[i + 1].h) { lower = sorted[i]; upper = sorted[i + 1]; break; }
  }
  const range = (upper.h - lower.h + 24) % 24 || 1;
  const t = Math.min(1, ((hour - lower.h + 24) % 24) / range);

  function lerp(a, b) { return a + (b - a) * t; }

  // 太阳光晕
  const sunGlow = sunOpacity > 0.05
    ? `radial-gradient(circle 120px at ${sunX}% ${sunY}%, rgba(255,240,200,${sunOpacity}) 0%, rgba(255,200,100,${sunOpacity * 0.4}) 40%, transparent 65%),`
    : "";

  return `
    ${sunGlow}
    radial-gradient(ellipse 100% 35% at 50% 90%, rgba(20,30,20,0.6) 0%, rgba(15,20,15,0.3) 50%, transparent 75%),
    radial-gradient(ellipse 90% 25% at 50% 85%, rgba(30,50,30,0.5) 0%, transparent 100%),
    linear-gradient(180deg, ${lower.top} 0%, ${interpolateColor(lower.top, upper.top, t)} 30%, ${interpolateColor(lower.mid, upper.mid, t)} 60%, ${interpolateColor(lower.bot, upper.bot, t)} 100%)
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
  // 日历是否打开
  const showCalendar = ref(false);
  // 通知面板是否打开
  const showNotifications = ref(false);
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
    { id: "system-info", name: "系统信息", icon: "monitor", app: "SystemInfo" },
    { id: "notepad", name: "记事本", icon: "file", app: "Notepad" },
    { id: "wallpaper", name: "壁纸设置", icon: "settings", app: "WallpaperSettings" },
    { id: "storage", name: "存储管理", icon: "disk", app: "StorageManager" },
    { id: "shares", name: "文件共享", icon: "folder", app: "FileShareManager" },
  ]);

  // 应用注册表
  const appRegistry = {
    FileManager: { title: "文件管理器", icon: "folder", width: 900, height: 600 },
    SystemInfo: { title: "系统信息", icon: "monitor", width: 700, height: 500 },
    Notepad: { title: "记事本", icon: "file", width: 600, height: 450 },
    WallpaperSettings: { title: "壁纸设置", icon: "settings", width: 640, height: 480 },
    StorageManager: { title: "存储管理", icon: "disk", width: 800, height: 550 },
    FileShareManager: { title: "文件共享", icon: "folder", width: 700, height: 500 },
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

  function toggleCalendar() {
    showCalendar.value = !showCalendar.value;
    if (showCalendar.value) startMenuOpen.value = false;
  }

  function toggleNotifications() {
    showNotifications.value = !showNotifications.value;
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
    showCalendar,
    showNotifications,
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
    toggleCalendar,
    toggleNotifications,
    updateTime,
  };
});
