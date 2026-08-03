<template>
  <svg class="wallpaper-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

    <!-- ====== 山脉 ====== -->
    <template v-if="name === 'mountain'">
      <defs>
        <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a3458"/><stop offset="40%" stop-color="#3a6a9c"/><stop offset="70%" stop-color="#7aa8c8"/><stop offset="100%" stop-color="#d4a070"/></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#msky)"/>
      <circle cx="1050" cy="470" r="80" fill="#ffe8c0" opacity="0.7"/>
      <circle cx="1050" cy="470" r="140" fill="#ffe8c0" opacity="0.15"/>
      <path d="M0 620 L200 520 L350 580 L500 440 L680 510 L820 380 L1000 460 L1150 350 L1350 430 L1500 390 L1600 420 L1600 900 L0 900Z" fill="#1a3a28"/><path d="M0 660 L250 580 L400 630 L600 530 L780 590 L950 500 L1100 560 L1250 490 L1450 530 L1600 510 L1600 900 L0 900Z" fill="#0d1f14"/>
      <path d="M0 780 L300 700 L550 750 L800 690 L1050 730 L1300 680 L1600 710 L1600 900 L0 900Z" fill="#0a150e"/>
      <rect x="0" y="650" width="1600" height="250" fill="url(#msky)" opacity="0.15"/>
    </template>

    <!-- ====== 沙漠 ====== -->
    <template v-if="name === 'desert'">
      <defs>
        <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3c1a4e"/><stop offset="30%" stop-color="#7a3a5e"/><stop offset="55%" stop-color="#c4685e"/><stop offset="80%" stop-color="#e8a060"/><stop offset="100%" stop-color="#d4b878"/></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#dsky)"/>
      <circle cx="1100" cy="420" r="70" fill="#ffe8c0" opacity="0.6"/>
      <circle cx="1100" cy="420" r="130" fill="#ffe8c0" opacity="0.12"/>
      <path d="M0 580 L180 540 L350 570 L500 510 L680 550 L850 490 L1020 530 L1200 480 L1380 520 L1600 490 L1600 900 L0 900Z" fill="#8b6b4a"/><path d="M0 640 L220 590 L400 630 L580 560 L750 600 L920 550 L1100 590 L1280 540 L1600 560 L1600 900 L0 900Z" fill="#6b4a30"/>
      <path d="M0 720 L280 670 L500 710 L780 660 L1050 700 L1300 650 L1600 690 L1600 900 L0 900Z" fill="#4a2a18"/>
    </template>

    <!-- ====== 极光 ====== -->
    <template v-if="name === 'aurora'">
      <defs>
        <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#050520"/><stop offset="50%" stop-color="#0d1840"/><stop offset="100%" stop-color="#081a20"/></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#nsky)"/>
      <circle cx="300" cy="80" r="1.5" fill="#fff" opacity="0.6"/><circle cx="500" cy="60" r="1" fill="#fff" opacity="0.4"/>
      <circle cx="750" cy="90" r="1.5" fill="#fff" opacity="0.5"/><circle cx="1000" cy="50" r="1" fill="#fff" opacity="0.3"/>
      <circle cx="1250" cy="75" r="1.5" fill="#fff" opacity="0.6"/><circle cx="1400" cy="55" r="1" fill="#fff" opacity="0.4"/>
      <circle cx="200" cy="120" r="1" fill="#fff" opacity="0.3"/><circle cx="850" cy="110" r="1" fill="#fff" opacity="0.5"/>
      <path d="M200 280 Q500 240 800 270 Q1100 250 1400 280" fill="none" stroke="rgba(90,220,160,0.15)" stroke-width="40"/><path d="M300 300 Q600 260 900 290 Q1200 270 1500 300" fill="none" stroke="rgba(120,200,200,0.1)" stroke-width="30"/>
      <path d="M100 310 Q400 280 700 305 Q1000 285 1350 310" fill="none" stroke="rgba(100,200,180,0.08)" stroke-width="25"/><path d="M0 580 L250 540 L500 560 L800 510 L1100 550 L1400 520 L1600 540 L1600 900 L0 900Z" fill="#0a1a10"/>
      <path d="M0 660 L300 620 L600 650 L900 600 L1200 640 L1600 610 L1600 900 L0 900Z" fill="#060e08"/>
    </template>

    <!-- ====== 湖泊 ====== -->
    <template v-if="name === 'lake'">
      <defs>
        <linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a3a5c"/><stop offset="30%" stop-color="#4a78a0"/><stop offset="55%" stop-color="#8bb8cc"/><stop offset="80%" stop-color="#3a6888"/><stop offset="100%" stop-color="#1a3048"/></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#lsky)"/>
      <circle cx="800" cy="200" r="60" fill="#ffe8c0" opacity="0.35"/>
      <path d="M0 420 L200 380 L400 400 L600 350 L800 390 L1000 340 L1200 380 L1400 360 L1600 390 L1600 900 L0 900Z" fill="#1a3040" opacity="0.9"/>
      <path d="M0 460 L250 420 L500 440 L750 400 L1000 430 L1250 410 L1600 430 L1600 900 L0 900Z" fill="#0d1a28"/>
      <rect x="0" y="400" width="1600" height="60" fill="#3a6080" opacity="0.15"/>
    </template>

    <!-- ====== 春日 ====== -->
    <template v-if="name === 'spring'">
      <defs>
        <linearGradient id="spky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a9ac0"/><stop offset="40%" stop-color="#a4d4e0"/><stop offset="65%" stop-color="#c8e8c0"/><stop offset="100%" stop-color="#e8c8d0"/></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#spky)"/>
      <circle cx="400" cy="250" r="55" fill="#ffe8c0" opacity="0.3"/>
      <path d="M0 560 L180 520 L350 550 L550 500 L720 540 L920 490 L1100 530 L1280 500 L1600 520 L1600 900 L0 900Z" fill="#7a9a50"/><path d="M0 620 L280 580 L480 610 L700 560 L900 600 L1150 550 L1400 580 L1600 560 L1600 900 L0 900Z" fill="#5a7a30"/>
      <path d="M0 700 L300 660 L550 690 L850 640 L1100 680 L1400 650 L1600 670 L1600 900 L0 900Z" fill="#3a5a20"/>
      <circle cx="300" cy="510" r="4" fill="#f0a0c0" opacity="0.5"/><circle cx="500" cy="530" r="3" fill="#f0b0d0" opacity="0.4"/>
      <circle cx="800" cy="480" r="4" fill="#f0a0c0" opacity="0.5"/><circle cx="1100" cy="520" r="3" fill="#e8a0c0" opacity="0.4"/>
    </template>

    <!-- ====== 晨光 ====== -->
    <template v-if="name === 'morning'">
      <defs>
        <linearGradient id="msk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e2440"/><stop offset="30%" stop-color="#4a6d8c"/><stop offset="60%" stop-color="#8db4c8"/><stop offset="100%" stop-color="#ebd9b0"/></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#msk)"/>
      <circle cx="800" cy="480" r="90" fill="#ffd890" opacity="0.5"/>
      <circle cx="800" cy="480" r="160" fill="#ffd890" opacity="0.1"/>
      <path d="M0 580 L220 540 L450 570 L650 520 L850 550 L1050 500 L1250 540 L1450 510 L1600 530 L1600 900 L0 900Z" fill="#1a3028"/><path d="M0 660 L300 610 L550 640 L800 590 L1050 620 L1350 580 L1600 600 L1600 900 L0 900Z" fill="#0d1a14"/>
    </template>

    <!-- ====== 夜色 ====== -->
    <template v-if="name === 'night'">
      <defs>
        <linearGradient id="ntsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#07071a"/><stop offset="50%" stop-color="#11163a"/><stop offset="100%" stop-color="#080e1e"/></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#ntsk)"/>
      <circle cx="350" cy="100" r="1.5" fill="#fff" opacity="0.5"/><circle cx="600" cy="70" r="1" fill="#fff" opacity="0.3"/>
      <circle cx="900" cy="120" r="1.5" fill="#fff" opacity="0.4"/><circle cx="1200" cy="80" r="1" fill="#fff" opacity="0.6"/>
      <circle cx="1400" cy="140" r="1.5" fill="#fff" opacity="0.3"/><circle cx="200" cy="160" r="1" fill="#fff" opacity="0.4"/>
      <circle cx="1050" cy="180" r="1" fill="#fff" opacity="0.2"/><circle cx="500" cy="150" r="1.5" fill="#fff" opacity="0.35"/>
      <circle cx="1300" cy="400" r="28" fill="#e8e0ff" opacity="0.15"/>
      <path d="M0 580 L280 540 L500 570 L750 520 L1000 550 L1250 510 L1600 530 L1600 900 L0 900Z" fill="#0a0e1a"/><path d="M0 680 L320 640 L600 670 L900 620 L1200 650 L1600 620 L1600 900 L0 900Z" fill="#060810"/>
    </template>

    <!-- ====== 动态壁纸 ====== -->
    <template v-if="name === 'dynamic'">
      <defs>
        <linearGradient id="dynsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="dynColors.top"/>
          <stop offset="45%" :stop-color="dynColors.mid"/>
          <stop offset="100%" :stop-color="dynColors.bot"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#dynsky)"/>
      <circle v-if="dynSun.show" :cx="dynSun.cx" :cy="dynSun.cy" r="70" :fill="dynSun.color" :opacity="dynSun.opacity"/>
      <circle v-if="dynSun.show" :cx="dynSun.cx" :cy="dynSun.cy" r="140" :fill="dynSun.color" :opacity="dynSun.opacity * 0.25"/>
      <circle v-if="!dynSun.show" cx="1100" cy="350" r="30" fill="#e8e0ff" opacity="0.15"/>
      <circle v-if="!dynSun.show" cx="300" cy="80" r="1.5" fill="#fff" opacity="0.5"/><circle v-if="!dynSun.show" cx="700" cy="60" r="1" fill="#fff" opacity="0.3"/>
      <circle v-if="!dynSun.show" cx="1000" cy="100" r="1.5" fill="#fff" opacity="0.4"/><circle v-if="!dynSun.show" cx="1300" cy="70" r="1" fill="#fff" opacity="0.5"/>
      <path d="M0 580 L280 540 L550 570 L800 510 L1050 550 L1300 520 L1600 540 L1600 900 L0 900Z" fill="#151a20"/><path d="M0 680 L350 630 L650 670 L900 610 L1200 650 L1600 620 L1600 900 L0 900Z" fill="#0a0e12"/>
    </template>
  </svg>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({ name: String });

// 动态壁纸颜色 + 太阳位置
const dynColors = computed(() => {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  const t = h / 24;
  const isDay = h >= 6 && h < 19;

  if (isDay) {
    const p = Math.max(0, Math.min(1, (h - 6) / 13));
    const topR = Math.round(10 + p * 30), topG = Math.round(20 + p * 70), topB = Math.round(60 + p * (160 - 60));
    const midR = Math.round(20 + p * 80), midG = Math.round(40 + p * 130), midB = Math.round(100 + p * (200 - 100));
    const botR = Math.round(15 + p * 60), botG = Math.round(25 + p * 90), botB = Math.round(40 + p * (120 - 40));
    return { top: `rgb(${topR},${topG},${topB})`, mid: `rgb(${midR},${midG},${midB})`, bot: `rgb(${botR},${botG},${botB})` };
  }
  return { top: "#060818", mid: "#0d1430", bot: "#080e1c" };
});

const dynSun = computed(() => {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  if (h < 5.5 || h > 19.5) return { show: false };
  const p = (h - 5.5) / 14;
  const cx = 100 + p * 1400;
  const cy = 550 - Math.sin(p * Math.PI) * 400;
  const opacity = Math.sin(p * Math.PI) * 0.5;
  return { show: true, cx, cy, color: "#ffe8c0", opacity };
});
</script>

<style scoped>
.wallpaper-svg { width: 100%; height: 100%; display: block; }
</style>
