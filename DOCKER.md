# todoList - Docker 部署指南

简单的极简 Docker 部署指南，支持一键部署到服务器 80 端口。

## 🚀 一键部署（推荐）

在服务器项目根目录下执行以下命令即可启动：

```bash
docker compose up -d --build
```

启动完成后，直接访问服务器 IP 或域名：
👉 `http://<服务器IP>` （默认 80 端口）

---

## 🛠️ 常用管理命令

```bash
# 查看运行日志
docker compose logs -f

# 停止服务
docker compose down

# 重新构建并启动
docker compose up -d --build
```

---

## 💾 数据说明

SQLite 数据库存放在本地自动生成的 `todolist_data` 数据卷中（对应容器路径 `/app/prisma/dev.db`），重构或升级容器不会丢失数据。
