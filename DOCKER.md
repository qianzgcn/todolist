# todoList - Docker 容器化部署指南

本指南介绍如何使用 Docker 与 Docker Compose 快速构建和部署 `todoList` 应用。应用采用 Next.js 16 (Standalone 模式) + Prisma 7 + SQLite 数据库架构，具备数据持久化和一键部署能力。

---

## 快速开始

### 方式 1：使用 Docker Compose（推荐）

直接在项目根目录运行以下命令一键构建并启动：

```bash
# 启动服务（后台运行并自动构建镜像）
docker compose up -d --build
```

启动完成后，在浏览器访问：
👉 `http://localhost:8001`

#### 常用 Docker Compose 管理命令：

```bash
# 查看容器运行状态
docker compose ps

# 查看容器运行日志
docker compose logs -f todolist

# 停止服务
docker compose down

# 停止服务并清理数据卷（注意：这会重置 SQLite 数据库）
docker compose down -v
```

---

### 方式 2：使用 Docker CLI 手动构建

如果你习惯使用原生的 `docker` 命令：

```bash
# 1. 构建 Docker 镜像
docker build -t todolist-app:latest .

# 2. 创建持久化数据卷（保存 SQLite 数据库）
docker volume create todolist_data

# 3. 运行 Docker 容器
docker run -d \
  --name todolist-container \
  -p 8001:8001 \
  -e PORT=8001 \
  -e DATABASE_URL="file:/app/prisma/dev.db" \
  -e SEED_DB_ON_STARTUP=true \
  -v todolist_data:/app/prisma \
  --restart always \
  todolist-app:latest
```

---

## 环境变量说明

可以在 `docker-compose.yml` 或 `docker run` 命令中指定以下环境变量：

| 环境变量 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `PORT` | `8001` | 应用监听端口 |
| `DATABASE_URL` | `file:/app/prisma/dev.db` | SQLite 数据库文件绝对路径 |
| `SEED_DB_ON_STARTUP` | `true` | 是否在首次启动时自动写入初始示例数据 |

---

## 数据持久化与备份

SQLite 数据库位于容器内的 `/app/prisma/dev.db` 路径。

- 通过数据卷挂载 `-v todolist_data:/app/prisma`，即使容器重建或升级，所有任务和分类数据也会妥善保存在宿主机本地中。
- 如需导出数据库文件：
  ```bash
  docker cp todolist-app:/app/prisma/dev.db ./backup_dev.db
  ```
