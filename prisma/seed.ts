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

  const lifeCat = await prisma.category.create({
    data: { name: "生活", color: "amber" },
  });

  // 日期计算辅助
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const today = new Date(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const inThreeDays = new Date(now);
  inThreeDays.setDate(now.getDate() + 3);

  const inFiveDays = new Date(now);
  inFiveDays.setDate(now.getDate() + 5);

  // 10 条真实示例数据
  await prisma.todo.createMany({
    data: [
      {
        title: "完成 todoList 页面布局与 Prisma 7 架构升级",
        completed: true,
        priority: "HIGH",
        categoryId: workCat.id,
      },
      {
        title: "编写项目说明文档并同步至 GitHub 仓库",
        completed: true,
        priority: "HIGH",
        categoryId: workCat.id,
      },
      {
        title: "制定下周季度工作目标与 Key Results 规划",
        completed: false,
        priority: "HIGH",
        dueDate: tomorrow,
        categoryId: workCat.id,
      },
      {
        title: "学习 React 19 并发特性与 Server Actions 原理",
        completed: false,
        priority: "HIGH",
        dueDate: inThreeDays,
        categoryId: studyCat.id,
      },
      {
        title: "精读《深入理解 TypeScript》核心章节",
        completed: false,
        priority: "MEDIUM",
        dueDate: inFiveDays,
        categoryId: studyCat.id,
      },
      {
        title: "每周 3 次 45 分钟有氧跑步锻炼",
        completed: false,
        priority: "MEDIUM",
        categoryId: personalCat.id,
      },
      {
        title: "睡前保持 30 分钟静心阅读与习惯打卡",
        completed: true,
        priority: "LOW",
        categoryId: personalCat.id,
      },
      {
        title: "整理本月家庭账单与财务支出复盘",
        completed: false,
        priority: "MEDIUM",
        dueDate: yesterday, // 逾期
        categoryId: lifeCat.id,
      },
      {
        title: "购买周末新鲜食材与日用品",
        completed: false,
        priority: "LOW",
        dueDate: today,
        categoryId: lifeCat.id,
      },
      {
        title: "预约汽车保养与定期车况检查",
        completed: false,
        priority: "LOW",
        dueDate: inFiveDays,
        categoryId: lifeCat.id,
      },
    ],
  });

  console.log("数据库 Seed 初始化成功，已预置 10 条示例任务与分类！");
}

main()
  .catch((e) => {
    console.error("Seed 脚本运行失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
