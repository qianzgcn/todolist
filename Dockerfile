# 1. 基础环境
FROM node:20-alpine AS base
WORKDIR /app
# 使用阿里云镜像源加速 apk 安装（国内网络环境下官方源极慢）
RUN sed -i 's#https\?://dl-cdn.alpinelinux.org#https://mirrors.aliyun.com#g' /etc/apk/repositories \
    && apk add --no-cache openssl sqlite

# 2. 依赖安装
FROM base AS deps
# better-sqlite3 等原生模块需要编译工具链
RUN apk add --no-cache python3 make g++
# 国内加速：npm 包源 + node-gyp 编译时下载 Node 头文件的镜像源
ENV NODEJS_ORG_MIRROR=https://cdn.npmmirror.com/binaries/node
ENV npm_config_build_from_source=true
RUN npm config set registry https://registry.npmmirror.com/
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# 3. 项目构建
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# 4. 运行阶段
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8001
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/prisma/dev.db"

# 复制启动脚本与 standalone 产物
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8001
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
