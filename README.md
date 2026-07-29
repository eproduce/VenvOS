# VenvOS 🖥️

网页版操作系统，使用 **Vue3** + **Sanic** 构建，具有桌面、窗口管理、文件管理、磁盘管理等功能。

## 功能特性

- 🖥️ **桌面系统**：桌面图标、右键菜单、暗色主题背景墙纸
- 🪟 **窗口管理**：拖拽移动、八向缩放、最小化/最大化/关闭、层级焦点切换
- 📁 **文件管理器**：目录浏览、面包屑导航、前进后退、新建/重命名/删除、右键菜单、搜索过滤
- 💾 **磁盘管理**：分区列表、使用率进度条、磁盘 I/O 读写统计
- 🖥️ **系统信息**：主机名、操作系统、CPU 核心、物理内存/交换空间、系统运行时间
- 📝 **记事本**：新建/打开/保存文本文件
- 📌 **任务栏**：开始菜单、应用窗口切换、系统时钟

## 技术栈

| 层级   | 技术                                      |
| ------ | ----------------------------------------- |
| 前端   | Vue 3 + Pinia + Vite + Axios              |
| 后端   | Python Sanic + psutil                     |
| 通信   | RESTful API                               |

## 项目结构

```
venvos/
├── backend/                      # Sanic 后端
│   ├── app.py                    # 主入口（API + 静态文件）
│   ├── requirements.txt          # Python 依赖
│   ├── api/
│   │   ├── files.py              # 文件管理 API
│   │   └── disks.py              # 磁盘管理 API
│   └── services/
│       ├── file_service.py       # 文件系统操作
│       └── disk_service.py       # 磁盘与系统信息（基于 psutil）
│
├── frontend/                     # Vue3 前端
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.vue               # 根布局
│       ├── store/index.js        # Pinia 全局状态
│       ├── components/
│       │   ├── Desktop.vue       # 桌面
│       │   ├── Window.vue        # 通用窗口
│       │   ├── Taskbar.vue       # 底部任务栏
│       │   ├── StartMenu.vue     # 开始菜单
│       │   └── apps/
│       │       ├── FileManager.vue   # 文件管理器
│       │       ├── DiskManager.vue   # 磁盘管理
│       │       ├── SystemInfo.vue    # 系统信息
│       │       └── Notepad.vue       # 记事本
│       └── assets/styles.css     # 暗色主题样式
│
├── start.sh                      # 一键启动脚本
├── stop.sh                       # 停止脚本
└── README.md
```

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
# 后端依赖
cd backend
pip install -r requirements.txt

# 前端依赖
cd ../frontend
npm install
```

### 启动

**方式一：一键启动（推荐）**

```bash
chmod +x start.sh
./start.sh
```

**方式二：分别启动**

```bash
# 终端 1 — 启动后端（端口 8000）
cd backend
python app.py

# 终端 2 — 启动前端开发服务器（端口 3000）
cd frontend
npm run dev
```

**方式三：生产模式（后端直接服务前端静态文件）**

```bash
cd frontend && npm run build   # 构建前端
cd ../backend && python app.py # 访问 http://localhost:8000
```

### 访问

- 开发模式：打开浏览器访问 **http://localhost:3000**（前端 Vite 带 HMR，API 自动代理到后端）
- 生产模式：打开浏览器访问 **http://localhost:8000**

### 停止

```bash
./stop.sh
```

## API 文档

### 文件管理 `/api/files`

| 方法   | 路径          | 说明         |
| ------ | ------------- | ------------ |
| GET    | `/list`       | 列出目录内容 |
| GET    | `/info`       | 文件/目录信息 |
| POST   | `/directory`  | 创建目录     |
| POST   | `/file`       | 创建文件     |
| GET    | `/read`       | 读取文件内容 |
| PUT    | `/write`      | 写入文件     |
| DELETE | `/delete`     | 删除文件/目录 |
| PUT    | `/rename`     | 重命名       |
| POST   | `/move`       | 移动         |
| POST   | `/copy`       | 复制         |
| GET    | `/search`     | 搜索文件     |

### 磁盘管理 `/api/disks`

| 方法 | 路径            | 说明                 |
| ---- | --------------- | -------------------- |
| GET  | `/partitions`   | 所有磁盘分区         |
| GET  | `/usage`        | 指定路径磁盘使用情况 |
| GET  | `/io`           | 磁盘 I/O 统计        |
| GET  | `/io_per_disk`  | 每磁盘 I/O 统计      |
| GET  | `/system`       | 系统信息             |

## 截图预览

> 启动后访问 http://localhost:3000 即可看到：

- 桌面背景 + 四个应用图标（文件管理器、磁盘管理、系统信息、记事本）
- 底部任务栏（开始按钮 + 窗口切换 + 系统时间）
- 双击桌面空白区域快速打开文件管理器
- 窗口支持拖拽、缩放、最大化、最小化

## License

MIT
