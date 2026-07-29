#!/bin/bash
# ========================================
# VenvOS 一键启动脚本
# 同时启动 Sanic 后端 + Vite 前端
# ========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        VenvOS 正在启动...           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"

# 清理函数
cleanup() {
    echo ""
    echo -e "${YELLOW}正在停止所有服务...${NC}"
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
    echo -e "${GREEN}所有服务已停止。${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 检查依赖
echo ""
echo -e "${BLUE}[1/4] 检查依赖...${NC}"

if ! command -v python3 &>/dev/null; then
    echo "❌ 未找到 python3，请先安装 Python 3.9+"
    exit 1
fi

if ! command -v npm &>/dev/null; then
    echo "❌ 未找到 npm，请先安装 Node.js"
    exit 1
fi

# 检查 Python 依赖
python3 -c "import sanic" 2>/dev/null || {
    echo -e "${YELLOW}⚠ sanic 未安装，正在安装后端依赖...${NC}"
    pip install -r "$BACKEND_DIR/requirements.txt"
}

# 检查前端依赖
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules 不存在，正在安装前端依赖...${NC}"
    cd "$FRONTEND_DIR"
    npm install
fi

# 启动后端
echo ""
echo -e "${BLUE}[2/4] 启动 Sanic 后端 (端口 8000)...${NC}"
cd "$BACKEND_DIR"
python3 app.py &
BACKEND_PID=$!
sleep 1

# 验证后端
if kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${GREEN}✅ 后端启动成功 (PID: $BACKEND_PID)${NC}"
else
    echo "❌ 后端启动失败"
    exit 1
fi

# 启动前端
echo ""
echo -e "${BLUE}[3/4] 启动 Vite 前端开发服务器 (端口 3000)...${NC}"
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
sleep 3

if kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "${GREEN}✅ 前端启动成功 (PID: $FRONTEND_PID)${NC}"
else
    echo "❌ 前端启动失败"
    cleanup
    exit 1
fi

# 完成
echo ""
echo -e "${BLUE}[4/4]${NC} ${GREEN}启动完成！${NC}"
echo ""
echo -e "  ${GREEN}前端地址:${NC}  http://localhost:3000"
echo -e "  ${GREEN}后端地址:${NC}  http://localhost:8000"
echo -e "  ${GREEN}健康检查:${NC}  http://localhost:8000/api/health"
echo ""
echo -e "  ${YELLOW}按 Ctrl+C 停止所有服务${NC}"
echo ""

# 等待任意子进程退出
wait
