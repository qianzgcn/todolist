#!/bin/sh
set -e

# 自动同步 SQLite 数据库表结构（Prisma 7 已移除 db push 的 --skip-generate，改用迁移）
npx prisma migrate deploy

# 启动 Next.js 服务
exec "$@"
