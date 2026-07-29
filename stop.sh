#!/bin/bash
# ========================================
# VenvOS 停止脚本
# ========================================

echo "正在停止 VenvOS 服务..."

# 停止后端
pkill -f "python3.*app.py" 2>/dev/null && echo "✅ 后端已停止" || echo "⚠ 未找到后端进程"

# 停止前端 Vite
pkill -f "vite" 2>/dev/null && echo "✅ 前端已停止" || echo "⚠ 未找到前端进程"

echo "所有服务已停止。"
