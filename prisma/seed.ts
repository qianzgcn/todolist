import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 清理原有数据
  await prisma.todo.deleteMany();
  await prisma.category.deleteMany();

  // 创建默认分类
  const workCat = await prisma.category.create({
    data: { name: "工作", color: "blue" },
  });

  const personalCat = await prisma.category.create({
    data: { name: "个人", color: "emerald" },
  });

  const studyCat = await prisma.category.create({
    data: { name: "学习", color: "purple" },
  });

  // 创建示例任务
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.todo.createMany({
    data: [
      {
        title: "完成 Next.js + Prisma TodoList 项目核心功能",
        completed: false,
        priority: "HIGH",
        dueDate: tomorrow,
        categoryId: workCat.id,
      },
      {
        title: "规划下周工作安排与复盘总结",
        completed: false,
        priority: "MEDIUM",
        dueDate: tomorrow,
        categoryId: workCat.id,
      },
      {
        title: "保持每日 30 分钟阅读与有氧运动",
        completed: false,
        priority: "LOW",
        categoryId: personalCat.id,
      },
      {
        title: "了解 React 19 & Next.js Server Actions 最佳实践",
        completed: true,
        priority: "HIGH",
        categoryId: studyCat.id,
      },
    ],
  });

  console.log("数据库 Seed 初始化成功！");
}

main()
  .catch((e) => {
    console.error("Seed 脚本运行失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
