#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

readonly PROJECT_DIR=/home/ubuntu/workspace/todolist
readonly ENV_FILE=/home/ubuntu/deploy/todolist.env
readonly LOG_DIR=/home/ubuntu/deploy/logs

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_DIR/todolist-$(date +%F).log") 2>&1

if [[ ! -f "$ENV_FILE" ]]; then
  echo "部署环境文件不存在: $ENV_FILE" >&2
  exit 1
fi

grep -q '^DATABASE_URL=' "$ENV_FILE" || { echo "部署环境文件缺少 DATABASE_URL" >&2; exit 1; }
grep -q '^JWT_SECRET=' "$ENV_FILE" || { echo "部署环境文件缺少 JWT_SECRET" >&2; exit 1; }

cd "$PROJECT_DIR"
git pull --ff-only origin main
docker compose --env-file "$ENV_FILE" up -d --build
docker compose --env-file "$ENV_FILE" ps
