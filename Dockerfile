# 1. 基础环境
FROM node:22-alpine AS base
WORKDIR /app
# 使用阿里云镜像源加速 apk 安装（国内网络环境下官方源极慢）
RUN sed -i 's#https\?://dl-cdn.alpinelinux.org#https://mirrors.aliyun.com#g' /etc/apk/repositories \
    && apk add --no-cache openssl

# 2. 依赖安装
FROM base AS deps
# 国内加速：npm 包源使用 npmmirror
RUN npm config set registry https://registry.npmmirror.com/
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# 3. 项目构建
FROM base AS builder
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
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
# 不再复制全量 node_modules（1.1G），standalone 已含运行时精简依赖；
# 单独安装 prisma CLI 供 entrypoint 的 migrate deploy 使用
# NODE_PATH 让 prisma.config.ts 能解析到 @prisma/config
ENV NODE_PATH=/opt/prisma-cli/node_modules
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install --prefix /opt/prisma-cli prisma@7.9.1 @prisma/config@7.9.1 \
    && ln -s /opt/prisma-cli/node_modules/.bin/prisma /usr/local/bin/prisma \
    && rm -rf /root/.npm/_cacache

EXPOSE 8001
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
