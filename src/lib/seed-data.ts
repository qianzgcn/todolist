import type { Prisma } from "@prisma/client";

export async function resetDatabase(prisma: Prisma.TransactionClient) {
  await prisma.todo.deleteMany();
  await prisma.category.deleteMany();

  const work = await prisma.category.create({
    data: { name: "工作", color: "blue" },
  });
  const personal = await prisma.category.create({
    data: { name: "个人", color: "emerald" },
  });
  const study = await prisma.category.create({
    data: { name: "学习", color: "purple" },
  });
  const life = await prisma.category.create({
    data: { name: "生活", color: "amber" },
  });

  const now = new Date();
  const dateFromToday = (days: number) => {
    const date = new Date(now);
    date.setDate(now.getDate() + days);
    return date;
  };

  await prisma.todo.createMany({
    data: [
      {
        title: "完成 todoList 页面布局与 Prisma 7 架构升级",
        completed: true,
        priority: "HIGH",
        categoryId: work.id,
      },
      {
        title: "编写项目说明文档并同步至 GitHub 仓库",
        completed: true,
        priority: "HIGH",
        categoryId: work.id,
      },
      {
        title: "制定下周季度工作目标与 Key Results 规划",
        priority: "HIGH",
        dueDate: dateFromToday(1),
        categoryId: work.id,
      },
      {
        title: "学习 React 19 并发特性与 Server Actions 原理",
        priority: "HIGH",
        dueDate: dateFromToday(3),
        categoryId: study.id,
      },
      {
        title: "精读《深入理解 TypeScript》核心章节",
        priority: "MEDIUM",
        dueDate: dateFromToday(5),
        categoryId: study.id,
      },
      {
        title: "每周 3 次 45 分钟有氧跑步锻炼",
        priority: "MEDIUM",
        categoryId: personal.id,
      },
      {
        title: "睡前保持 30 分钟静心阅读与习惯打卡",
        completed: true,
        priority: "LOW",
        categoryId: personal.id,
      },
      {
        title: "整理本月家庭账单与财务支出复盘",
        priority: "MEDIUM",
        dueDate: dateFromToday(-1),
        categoryId: life.id,
      },
      {
        title: "购买周末新鲜食材与日用品",
        priority: "LOW",
        dueDate: dateFromToday(0),
        categoryId: life.id,
      },
      {
        title: "预约汽车保养与定期车况检查",
        priority: "LOW",
        dueDate: dateFromToday(5),
        categoryId: life.id,
      },
    ],
  });
}
