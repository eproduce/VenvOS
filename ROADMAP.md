# VenvOS 云端操作系统 · 开发路线图

> 参考：FN OS（飞牛私有云）、TrueNAS Scale、Unraid、CasaOS  
> 理念：从简单到复杂，从单机到集群，逐步构建一个完整的云端 NAS / 私有云操作系统

---

## Phase 0 ✅ 已完成

| 功能 | 状态 |
|------|------|
| Vue3 + Sanic 前后端框架 | ✅ |
| 桌面 + 窗口管理 + 任务栏 | ✅ |
| 开始菜单 + 右键菜单 | ✅ |
| 文件管理器（浏览/新建/删除/重命名/搜索） | ✅ |
| 磁盘管理（分区/使用率/IO） | ✅ |
| 系统信息（CPU/内存/运行时间） | ✅ |
| 记事本（读写文件） | ✅ |
| 壁纸系统（静态 + 动态时间渐变） | ✅ |
| 日历（农历 + 节假日 + 放假补班） | ✅ |
| macOS 风格 UI（红绿灯/毛玻璃） | ✅ |

---

## Phase 1 · 基础用户系统 🏠

### 1.1 用户登录 / 多用户
- 登录/登出界面（锁屏风格）
- 用户注册 / 管理员创建用户
- 角色权限（admin / user / guest）
- 每个用户独立桌面 + 家目录
- 密码修改 / 重置

### 1.2 设置面板
- 系统偏好设置应用
- 网络配置（IP/DNS/代理）
- 时区 / 语言 / 主题切换（暗色/亮色）
- 开机自启动服务管理
- 系统更新检查

### 1.3 通知中心
- 右上角通知铃铛
- 系统事件通知（磁盘满/更新/备份完成）
- 通知历史列表

---

## Phase 2 · 存储管理 💾

### 2.1 存储池 & 卷管理
- 存储池创建（ZFS / Btrfs / LVM 抽象）
- 数据集 / 卷创建与管理
- 存储空间配额（per-user / per-share）
- 磁盘健康监控（S.M.A.R.T.）
- 磁盘坏道检测与告警
- 磁盘替换 / 扩容向导

### 2.2 RAID 管理
- RAID 0 / 1 / 5 / 6 / 10 创建向导
- RAID 状态监控与降级告警
- 热备盘（Hot Spare）
- RAID 重建进度

### 2.3 快照与回滚
- 定时快照策略（每小时/每天/每周）
- 手动快照
- 快照浏览与单文件恢复
- 快照克隆

### 2.4 文件共享协议
- SMB / CIFS 共享（Windows 兼容）
- NFS 共享（Linux / macOS）
- AFP 共享（Time Machine）
- WebDAV 共享
- FTP / SFTP 服务
- 共享权限管理（读写/只读/禁止）

---

## Phase 3 · 应用中心 📦

### 3.1 应用商店（类似 CasaOS App Store）
- Docker 容器一键部署
- 应用分类：媒体/下载/开发/工具/数据库
- 应用模板市场（社区贡献）
- 一键安装 / 卸载 / 更新
- 容器状态监控（CPU/内存/网络）

### 3.2 热门应用预置
- **Jellyfin / Plex** — 媒体服务器
- **qBittorrent / Transmission** — BT 下载
- **Aria2** — 多协议下载
- **Photoprism / Immich** — 照片管理
- **Nextcloud** — 私有云盘
- **Home Assistant** — 智能家居
- **Pi-hole / AdGuard** — 广告拦截 DNS
- **Nginx Proxy Manager** — 反向代理
- **Portainer** — Docker 可视化管理
- **Vaultwarden** — 密码管理器
- **Syncthing** — 文件同步
- **Tailscale** — 内网穿透 VPN

### 3.3 应用编排
- Docker Compose 可视化编辑
- 容器间网络配置
- 环境变量 / 卷挂载管理
- 容器日志实时查看

---

## Phase 4 · 虚拟机管理 🖥️

### 4.1 虚拟机引擎
- KVM / QEMU 虚拟化支持
- VM 创建向导（CPU/内存/磁盘/ISO）
- VNC / SPICE 远程桌面
- VM 快照与克隆
- VM 迁移

### 4.2 模板市场
- Ubuntu / Debian / CentOS 模板
- Windows VM 支持
- Home Assistant OS 模板
- OpenWrt 软路由模板

---

## Phase 5 · 网络服务 🌐

### 5.1 网络管理
- 网络接口管理（桥接/绑定/VLAN）
- 静态 IP / DHCP 配置
- DNS 服务器管理
- 带宽监控与限速

### 5.2 远程访问
- DDNS 动态域名
- SSL 证书自动管理（Let's Encrypt / ACME）
- 反向代理配置
- Tailscale / ZeroTier 集成
- Cloudflare Tunnel 集成

### 5.3 防火墙与安全
- 简易防火墙规则配置
- 端口转发管理
- 入侵检测告警
- Fail2ban 集成
- 两步验证（2FA）

---

## Phase 6 · 数据保护 🔒

### 6.1 备份系统
- 本地备份任务（定时/增量）
- 远程备份（rsync / S3 / WebDAV）
- 备份策略模板（3-2-1 原则）
- 备份任务历史与日志
- 一键恢复

### 6.2 云同步
- S3 / 阿里云 OSS / 腾讯云 COS 同步
- OneDrive / Google Drive 同步
- 定时双向同步
- 同步冲突处理

### 6.3 加密
- 数据集级加密
- 共享链接加密
- 传输加密（TLS 1.3）

---

## Phase 7 · 监控与运维 📊

### 7.1 仪表盘
- 首页资源概览（CPU/内存/网络/存储）
- 实时流量图
- 磁盘温度 / 健康度面板
- 服务运行状态总览

### 7.2 告警系统
- 邮件 / 企业微信 / Telegram 通知
- 自定义告警规则（CPU > 90% / 磁盘 < 10GB）
- 告警历史

### 7.3 日志中心
- 系统日志聚合
- 应用日志查看
- 日志搜索与过滤
- 日志轮转策略

---

## Phase 8 · 高级功能 🚀

### 8.1 集群管理
- 多节点加入集群
- 分布式存储（GlusterFS / Ceph）
- 服务高可用（HA）
- 负载均衡

### 8.2 AI 功能
- 本地 LLM 推理（Ollama 集成）
- 照片 AI 分类 / 人脸识别
- 智能搜索（自然语言描述找文件）
- 文档 OCR / 内容索引

### 8.3 多平台客户端
- iOS / Android 移动端 App
- 桌面同步客户端（类似 Dropbox）
- 浏览器扩展（快速上传/截图）

### 8.4 开发者工具
- Web IDE（VS Code Server）
- Git 服务（Gitea 集成）
- CI/CD 流水线
- API 文档与调试控制台
- Webhook 触发器

---

## 建议开发顺序

```
现在 → 1.1 登录 → 1.2 设置 → 2.1 存储池 → 2.4 文件共享
                                            ↓
              3.1 应用商店 ← 6.1 备份 ← 5.1 网络 ← 7.1 仪表盘
                  ↓
              4.1 虚拟机 → 8.1 集群 → 8.2 AI → 8.3 客户端
```

---

## 技术选型建议

| 层面 | 当前 | 建议演进 |
|------|------|----------|
| 前端 | Vue3 + Vite | 保持，加 PWA 离线支持 |
| 后端 | Sanic (Python) | Sanic + SQLAlchemy + Celery |
| 数据库 | 无 | SQLite → PostgreSQL |
| 文件系统 | os/shutil | 集成 ZFS/Btrfs 命令行封装 |
| 容器 | — | Docker SDK for Python |
| 虚拟化 | — | libvirt API |
| 消息队列 | — | Redis + Celery（异步任务） |
| 实时通信 | — | WebSocket（Sanic 原生支持） |
