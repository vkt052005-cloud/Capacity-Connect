#!/bin/bash
# ─────────────────────────────────────────────────────────────
# CAPACITY CONNECT – One-shot start script
# Digital Learning & Capacity Building Portal
# ─────────────────────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║             CAPACITY CONNECT LMS PLATFORM                ║"
echo "║          Unified Production & Local Dev Engine           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Clear port 5173 if busy
echo "→ Checking port 5173..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Install deps if node_modules missing
if [ ! -d "$ROOT/node_modules" ]; then
  echo "→ Installing dependencies..."
  npm install
fi

echo "→ Starting Capacity Connect on http://localhost:5173 ..."
npm run dev
