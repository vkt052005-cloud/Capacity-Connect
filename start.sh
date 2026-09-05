#!/bin/bash
# ─────────────────────────────────────────────────────────────
# CAPACITY CONNECT – One-shot start script
# Ministry of Earth Sciences & IMD Learning Management Portal
# ─────────────────────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT/server"
CLIENT_DIR="$ROOT/client"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║          CAPACITY CONNECT  •  MoES / IMD Portal          ║"
echo "║              SIH 2026 – Problem Statement 26075           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Kill anything on 5001 & 5173 first
echo "→ Clearing ports 5001 & 5173..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Install deps if node_modules missing
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "→ Installing server dependencies..."
  cd "$SERVER_DIR" && npm install --silent
fi
if [ ! -d "$CLIENT_DIR/node_modules" ]; then
  echo "→ Installing client dependencies..."
  cd "$CLIENT_DIR" && npm install --silent
fi

# Start backend (port 5001)
echo "→ Starting API server on http://localhost:5001 ..."
cd "$SERVER_DIR"
npx tsx src/index.ts &
SERVER_PID=$!
sleep 3

# Verify server came up
if ! curl -s http://localhost:5001/api/admin/announcements > /dev/null 2>&1; then
  echo "⚠️  Server may still be starting up. Continuing..."
fi

# Start frontend (port 5173)
echo "→ Starting frontend on http://localhost:5173 ..."
cd "$CLIENT_DIR"
npx vite --port 5173 &
CLIENT_PID=$!
sleep 3

echo ""
echo "✅  CAPACITY CONNECT is running!"
echo ""
echo "  🌐  Frontend  →  http://localhost:5173"
echo "  🔌  API       →  http://localhost:5001/api"
echo ""
echo "  Demo credentials:"
echo "    Admin   : admin@moes.gov.in   / admin123"
echo "    Trainer : trainer1@moes.gov.in / trainer123"
echo "    Trainee : trainee1@moes.gov.in / trainee123"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

# Wait for both
trap "echo '→ Shutting down...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait $SERVER_PID $CLIENT_PID
