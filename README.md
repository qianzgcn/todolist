# todoList

面向桌面浏览器的个人任务清单，使用 Next.js 16、React 19、Prisma 7、
SQLite、Tailwind CSS 和 shadcn 组件构建。

## 本地运行

```powershell
npm ci
npm run db:migrate
npm run dev
```

打开 <http://localhost:8001>。

数据库统一位于 `prisma/dev.db`。如需覆盖连接地址，可设置
`DATABASE_URL`；Prisma CLI、应用运行时和 Seed 会读取同一个配置。

## 常用命令

```powershell
npm run test
npm run lint
npm run build
npm run db:migrate
npm run db:seed
```

`db:seed` 会清空当前任务和分类并写入示例数据，请谨慎使用。

SQLite 适合本机或单实例 Node.js 部署。需要多实例或 Serverless 部署时，
应改用共享数据库。
