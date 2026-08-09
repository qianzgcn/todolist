# todoList - Docker 部署指南 (MySQL 方案)

支持通过 Docker 部署应用并连接目标服务器上现有的 MySQL 数据库。

## 🚀 部署步骤

1. **准备环境变量**：
   在服务器项目根目录下创建 `.env` 文件，填入服务器 MySQL 的真实连接串：
   ```env
   DATABASE_URL="mysql://root:password@172.17.0.1:3306/todolist"
   ```
   > 💡 注：如果 MySQL 在宿主机运行，容器内访问宿主机 IP 可使用 `172.17.0.1` 或 `host.docker.internal`。

2. **启动部署**：
   运行以下命令一键构建并启动服务：
   ```bash
   docker compose up -d --build
   ```

启动成功后，直接通过浏览器访问服务器 80 端口：
👉 `http://<服务器IP>`

---

## 🛠️ 常用管理命令

```bash
# 查看日志
docker compose logs -f

# 重新构建并重启
docker compose up -d --build

# 停止服务
docker compose down
```
