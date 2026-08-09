# 1. 基础环境
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# 2. 依赖安装
FROM base AS deps
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
