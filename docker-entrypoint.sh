#!/bin/sh
set -e

# 自动同步 SQLite 数据库表结构
# 容器内无 prisma.config.ts，需用 --url 显式指定数据库连接
npx prisma migrate deploy --url "${DATABASE_URL:-file:/app/prisma/dev.db}"

# 启动 Next.js 服务
exec "$@"
