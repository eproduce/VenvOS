<template>
  <canvas ref="canvasRef" class="wallpaper-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({ name: String });
const canvasRef = ref(null);
let animFrame = null;

// ==================== 程序化风景生成器 ====================

const SCENES = {
  mountain: { sky: ["#1a3458", "#3a6a9c", "#7aa8c8", "#d4a070"], ground: ["#2a4a30", "#1a3a20", "#0d1f10"], sun: { x: 0.65, y: 0.48, r: 60, color: "#ffe8c0" } },
  desert:  { sky: ["#3c1a4e", "#7a3a5e", "#c4685e", "#d4b878"], ground: ["#8b6b4a", "#6b4a30", "#4a2a18"], sun: { x: 0.7, y: 0.42, r: 55, color: "#ffe0b0" } },
  aurora:  { sky: ["#050520", "#0d1840", "#081830", "#081a20"], ground: ["#0a1a18", "#060e10", "#040808"], aurora: true, moon: true },
  lake:    { sky: ["#1a3a5c", "#4a78a0", "#8bb8cc", "#3a6888"], ground: ["#1a3040", "#0d1a28", "#081018"], sun: { x: 0.5, y: 0.25, r: 50, color: "#ffe8d0" }, water: true },
  spring:  { sky: ["#5a9ac0", "#8bc4dc", "#c8e8c0", "#d8c8d8"], ground: ["#7a9a50", "#5a7a30", "#3a5a20"], sun: { x: 0.3, y: 0.3, r: 45, color: "#ffe8c0" }, flowers: true },
  morning: { sky: ["#1e2440", "#4a6d8c", "#8db4c8", "#ebd9b0"], ground: ["#1a3028", "#0d1a14", "#060c08"], sun: { x: 0.5, y: 0.55, r: 70, color: "#ffd890" } },
  night:   { sky: ["#07071a", "#0d1030", "#11163a", "#080e1e"], ground: ["#0a0e1a", "#060810", "#030408"], moon: true, stars: true },
};

// ==================== 高精度山脉生成器 ====================

// 基于中点位移算法生成自然山脊线
function generateRidge(w, h, baseY, roughness, seed) {
  const segments = 160; // 高分段数
  const dx = w / segments;
  const points = [];

  // 随机种子
  let rng = seed * 137.5;
  function rand() { rng = (rng * 16807) % 2147483647; return (rng - 1) / 2147483646; }

  // 使用中点位移生成地形高度场
  const heights = new Array(segments + 1);
  heights[0] = rand() * 0.15;
  heights[segments] = rand() * 0.15;

  let step = segments;
  let amp = 0.45;

  while (step > 1) {
    const half = Math.floor(step / 2);
    for (let i = half; i < segments; i += step) {
      const avg = (heights[i - half] + heights[(i + half) % (segments + 1)]) / 2;
      heights[i] = avg + (rand() - 0.5) * amp * 2;
    }
    for (let i = 0; i < segments; i += step) {
      const left = heights[i];
      const right = heights[(i + step) % (segments + 1)];
      const mid = (left + right) / 2 + (rand() - 0.5) * amp * 0.7;
      if (i + half < segments) heights[i + half] = mid;
    }
    step = half;
    amp *= 0.55;
  }

  // 归一化到 0-1 并塑形
  let minH = 1, maxH = 0;
  for (let i = 0; i <= segments; i++) { minH = Math.min(minH, heights[i]); maxH = Math.max(maxH, heights[i]); }
  const range = maxH - minH || 1;

  for (let i = 0; i <= segments; i++) {
    const x = i * dx;
    const normalized = ((heights[i] - minH) / range);
    // 塑形：让低谷更宽、山峰更尖
    const shaped = Math.pow(normalized, 0.65);
    const y = baseY - shaped * h * 0.45 + Math.sin(i * 0.3 + seed) * 3;
    points.push({ x, y: Math.max(y, baseY - h * 0.44) });
  }

  return points;
}

// 三次贝塞尔曲线构建平滑路径
function buildSmoothPath(points, w, h) {
  if (points.length < 3) return "";
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];

    // 控制点：平滑切线
    const cpx1 = p1.x - (p2.x - p0.x) * 0.15;
    const cpy1 = p1.y - (p2.y - p0.y) * 0.15;
    const cpx2 = p1.x + (p2.x - p0.x) * 0.15;
    const cpy2 = p1.y + (p2.y - p0.y) * 0.15;

    d += ` C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${p1.x} ${p1.y}`;
  }

  // 连接最后一个点
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function closePath(d, points, h) {
  const last = points[points.length - 1];
  const first = points[0];
  return d + ` L ${last.x} ${h} L ${first.x} ${h} Z`;
}

function drawStars(ctx, w, h) {
  const starCount = 60;
  for (let i = 0; i < starCount; i++) {
    const x = (Math.sin(i * 137.5) * 0.5 + 0.5) * w;
    const y = (i * 37 + 13) % (h * 0.55);
    const r = 0.4 + (i % 3) * 0.4;
    const alpha = 0.2 + (i % 5) * 0.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }
}

function drawSun(ctx, sun, w, h) {
  const cx = sun.x * w, cy = sun.y * h;
  // 外层光晕
  for (let i = 3; i >= 0; i--) {
    const r = sun.r * (1 + i * 0.8);
    const alpha = 0.04 + i * 0.03;
    const gradient = ctx.createRadialGradient(cx, cy, sun.r * 0.5, cx, cy, r);
    gradient.addColorStop(0, sun.color.replace(")", `,${alpha * 3})`).replace("rgb", "rgba"));
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  // 太阳本体
  const sunGrad = ctx.createRadialGradient(cx - sun.r * 0.2, cy - sun.r * 0.2, 0, cx, cy, sun.r);
  sunGrad.addColorStop(0, "#ffffff");
  sunGrad.addColorStop(0.3, sun.color);
  sunGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, sun.r, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();
}

function drawAurora(ctx, w, h) {
  for (let band = 0; band < 4; band++) {
    const baseY = h * (0.3 + band * 0.04);
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= w; x += 20) {
      const y = baseY + Math.sin(x * 0.004 + band) * 15 + Math.sin(x * 0.012 + band * 3) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const alpha = 0.04 + band * 0.02;
    ctx.fillStyle = `rgba(80,200,160,${alpha})`;
    ctx.fill();
  }
}

function drawWaterReflection(ctx, w, h, points, color) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.translate(0, h * 0.55);
  ctx.scale(1, -0.5);
  ctx.translate(0, -h * 0.55);
  const path = new Path2D(closePath(buildSmoothPath(points, w, h), points, h));
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.restore();
}

function drawClouds(ctx, w, h, seed) {
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 280 + seed * 100) % w);
    const cy = h * (0.1 + (i % 3) * 0.08);
    const cloudGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 + i * 15);
    cloudGrad.addColorStop(0, "rgba(255,255,255,0.08)");
    cloudGrad.addColorStop(0.5, "rgba(255,255,255,0.03)");
    cloudGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, 80 + i * 15, 0, Math.PI * 2);
    ctx.fillStyle = cloudGrad;
    ctx.fill();
  }
}

function drawFlowers(ctx, w, h, points) {
  for (let i = 0; i < 30; i++) {
    const x = (i * 173 + 50) % w;
    // Find y on the second mountain layer
    let py = 650;
    for (const p of points) {
      if (Math.abs(p.x - x) < 20) { py = p.y + 20; break; }
    }
    const flowerGrad = ctx.createRadialGradient(x, py, 0, x, py, 5);
    flowerGrad.addColorStop(0, "rgba(255,180,200,0.6)");
    flowerGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(x, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = flowerGrad;
    ctx.fill();
  }
}

function renderScene(ctx, width, height, sceneName) {
  const w = width, h = height;
  const scene = SCENES[sceneName] || SCENES.mountain;
  const seed = sceneName.length * 7 + 3;

  // 天空渐变
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  scene.sky.forEach((color, i) => {
    skyGrad.addColorStop(i / (scene.sky.length - 1), color);
  });
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 大气散射光
  const atmGrad = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.7);
  atmGrad.addColorStop(0, "rgba(0,0,0,0)");
  atmGrad.addColorStop(0.5, "rgba(255,255,255,0.04)");
  atmGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = atmGrad;
  ctx.fillRect(0, 0, w, h);

  // 太阳
  if (scene.sun) drawSun(ctx, scene.sun, w, h);

  // 月亮
  if (scene.moon) {
    const mx = w * 0.7, my = h * 0.22;
    const moonGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 35);
    moonGrad.addColorStop(0, "#ffffff");
    moonGrad.addColorStop(0.6, "#e8e0ff");
    moonGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(mx, my, 35, 0, Math.PI * 2);
    ctx.fillStyle = moonGrad;
    ctx.fill();
  }

  // 云层
  drawClouds(ctx, w, h, seed);

  // 极光
  if (scene.aurora) drawAurora(ctx, w, h);

  // 星空
  if (scene.stars) drawStars(ctx, w, h);

  // 远山（三层）
  const layers = [
    { baseY: h * 0.62, roughness: 1.2, colors: scene.ground },
  ];
  // 加两层更多山
  layers.push({ baseY: h * 0.58, roughness: 1.5, colors: [scene.ground[0]] });
  layers.push({ baseY: h * 0.68, roughness: 1.0, colors: [scene.ground[scene.ground.length - 1]] });

  const allPoints = [];

  layers.forEach((layer, idx) => {
    const points = generateRidge(w, h, layer.baseY, layer.roughness, seed + idx * 13);
    if (idx === 1) allPoints.push(...points);

    const path = new Path2D(closePath(buildSmoothPath(points, w, h), points, h));
    const grad = ctx.createLinearGradient(0, layer.baseY - h * 0.4, 0, h);
    grad.addColorStop(0, layer.colors[0] || scene.ground[0]);
    grad.addColorStop(0.5, layer.colors[1] || layer.colors[0] || scene.ground[1]);
    grad.addColorStop(1, layer.colors[layer.colors.length - 1] || scene.ground[scene.ground.length - 1]);
    ctx.fillStyle = grad;
    ctx.fill(path);
  });

  // 水面倒影
  if (scene.water && allPoints.length > 0) {
    drawWaterReflection(ctx, w, h, allPoints, scene.ground[0]);
    // 水面波纹
    for (let i = 0; i < 5; i++) {
      const wy = h * 0.58 + i * 12;
      ctx.beginPath();
      ctx.moveTo(0, wy);
      for (let x = 0; x <= w; x += 40) {
        ctx.lineTo(x, wy + Math.sin(x * 0.01 + i) * 1.5);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // 花朵
  if (scene.flowers && allPoints.length > 0) {
    drawFlowers(ctx, w, h, allPoints);
  }

  // 前景雾
  const fogGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
  fogGrad.addColorStop(0, "rgba(0,0,0,0)");
  fogGrad.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, h * 0.75, w, h * 0.25);
}

// ==================== 动态壁纸 ====================
function renderDynamic(ctx, w, h) {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  // 天空色
  let top, mid, bot;
  if (hour >= 6 && hour < 19) {
    const p = (hour - 6) / 13;
    top = `rgb(${Math.round(10 + p * 30)},${Math.round(20 + p * 80)},${Math.round(60 + p * 100)})`;
    mid = `rgb(${Math.round(20 + p * 100)},${Math.round(40 + p * 140)},${Math.round(100 + p * 100)})`;
    bot = `rgb(${Math.round(15 + p * 70)},${Math.round(25 + p * 100)},${Math.round(40 + p * 100)})`;
  } else {
    top = "#060818"; mid = "#0d1430"; bot = "#080e1c";
  }

  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, top);
  skyGrad.addColorStop(0.5, mid);
  skyGrad.addColorStop(1, bot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 太阳轨迹
  if (hour >= 5.5 && hour <= 19.5) {
    const p = (hour - 5.5) / 14;
    const cx = w * (0.05 + p * 0.9);
    const cy = h * (0.75 - Math.sin(p * Math.PI) * 0.55);
    drawSun(ctx, { x: cx / w, y: cy / h, r: 50, color: "#ffe8c0" }, w, h);
  } else {
    // 夜晚星星
    drawStars(ctx, w, h);
    // 月亮
    const moonGrad = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, 30);
    moonGrad.addColorStop(0, "#fff");
    moonGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.2, 30, 0, Math.PI * 2);
    ctx.fillStyle = moonGrad;
    ctx.fill();
  }

  drawClouds(ctx, w, h, 42);

  // 山脉
  const points = generateRidge(w, h, h * 0.6, 1.3, 7);
  const path = new Path2D(closePath(buildSmoothPath(points, w, h), points, h));
  const grad = ctx.createLinearGradient(0, h * 0.3, 0, h);
  grad.addColorStop(0, hour >= 6 && hour < 19 ? "#2a3a30" : "#0a0e16");
  grad.addColorStop(1, hour >= 6 && hour < 19 ? "#0d1a14" : "#04060a");
  ctx.fillStyle = grad;
  ctx.fill(path);

  // 第二层山
  const points2 = generateRidge(w, h, h * 0.68, 1.0, 13);
  const path2 = new Path2D(closePath(buildSmoothPath(points2, w, h), points2, h));
  ctx.fillStyle = hour >= 6 && hour < 19 ? "#1a2a20" : "#060810";
  ctx.fill(path2);
}

// ==================== 生命周期 ====================
function draw() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  if (props.name === "dynamic") {
    renderDynamic(ctx, w, h);
  } else {
    renderScene(ctx, w, h, props.name);
  }
}

let resizeTimer;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(draw, 100);
}

onMounted(() => {
  draw();
  window.addEventListener("resize", onResize);
  if (props.name === "dynamic") {
    animFrame = setInterval(draw, 60000);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  clearInterval(animFrame);
});

watch(() => props.name, () => {
  clearInterval(animFrame);
  if (props.name === "dynamic") animFrame = setInterval(draw, 60000);
  draw();
});
</script>

<style scoped>
.wallpaper-canvas { width: 100%; height: 100%; display: block; }
</style>
