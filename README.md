# todoList

面向桌面浏览器的个人任务清单，使用 Next.js 16、React 19、Prisma 7、
MySQL、Tailwind CSS 和 shadcn 组件构建。

## 本地运行

```powershell
npm ci
npm run dev
```

打开 <http://localhost:8001>。

如需覆盖数据库连接地址，请在 `.env` 中设置 `DATABASE_URL`。
首次迁移会创建预制管理员账号：`admin / admin123456`，登录后请及时修改密码。
同时需要配置 `JWT_SECRET`，可参考 `.env.example`。

## 常用命令

```powershell
npm run test
npm run lint
npm run build
npm run db:migrate
```
