#!/bin/sh
set -e

# 自动推导并同步 SQLite 数据库表结构
npx prisma db push --skip-generate

# 启动 Next.js 服务
exec "$@"
