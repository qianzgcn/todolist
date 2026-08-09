#!/bin/sh
set -e

# 自动推导并同步 MySQL 数据库表结构
# 配置读取自 prisma.config.ts（容器内已复制），DATABASE_URL 由 compose 注入
npx prisma migrate deploy

# 启动 Next.js 服务
exec "$@"
