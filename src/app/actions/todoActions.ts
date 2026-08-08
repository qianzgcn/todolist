"use server";

import { prisma } from "@/lib/prisma";
import { CreateTodoInput, UpdateTodoInput, StatusFilter, SortBy, Priority } from "@/types/todo";
import { revalidatePath } from "next/cache";

export async function getTodos(params?: {
  status?: StatusFilter;
  categoryId?: string;
  search?: string;
  sortBy?: SortBy;
}) {
  const { status = "ALL", categoryId, search, sortBy = "createdAt" } = params || {};

  const where: any = {};

  if (status === "ACTIVE") {
    where.completed = false;
  } else if (status === "COMPLETED") {
    where.completed = true;
  }

  if (categoryId && categoryId !== "ALL") {
    where.categoryId = categoryId;
  }

  if (search && search.trim() !== "") {
    where.title = {
      contains: search.trim(),
    };
  }

  let orderBy: any = [{ createdAt: "desc" }];

  if (sortBy === "dueDate") {
    orderBy = [{ dueDate: "asc" }, { createdAt: "desc" }];
  } else if (sortBy === "priority") {
    orderBy = [{ createdAt: "desc" }];
  }

  let todos = await prisma.todo.findMany({
    where,
    include: {
      category: true,
    },
    orderBy,
  });

  if (sortBy === "priority") {
    const priorityWeight: Record<Priority, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };
    todos = todos.sort((a, b) => priorityWeight[b.priority as Priority] - priorityWeight[a.priority as Priority]);
  }

  return todos;
}

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTodo(input: CreateTodoInput) {
  if (!input.title || input.title.trim() === "") {
    throw new Error("任务标题不能为空");
  }

  const todo = await prisma.todo.create({
    data: {
      title: input.title.trim(),
      priority: input.priority || "MEDIUM",
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      categoryId: input.categoryId || null,
    },
  });

  revalidatePath("/");
  return todo;
}

export async function toggleTodo(id: string, currentCompleted: boolean) {
  const todo = await prisma.todo.update({
    where: { id },
    data: { completed: !currentCompleted },
  });

  revalidatePath("/");
  return todo;
}

export async function updateTodo(id: string, input: UpdateTodoInput) {
  const data: any = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.completed !== undefined) data.completed = input.completed;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;

  const todo = await prisma.todo.update({
    where: { id },
    data,
  });

  revalidatePath("/");
  return todo;
}

export async function deleteTodo(id: string) {
  await prisma.todo.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function resetToSeedData() {
  await prisma.todo.deleteMany();
  await prisma.category.deleteMany();

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
        dueDate: yesterday,
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

  revalidatePath("/");
}

export async function createCategory(name: string, color: string = "blue") {
  const trimmed = name ? name.trim() : "";
  if (!trimmed) {
    throw new Error("分类名称不能为空");
  }

  const existing = await prisma.category.findUnique({
    where: { name: trimmed },
  });
  if (existing) {
    return existing;
  }

  const category = await prisma.category.create({
    data: {
      name: trimmed,
      color,
    },
  });

  revalidatePath("/");
  return category;
}
