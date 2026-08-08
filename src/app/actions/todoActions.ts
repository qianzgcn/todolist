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
    // 高优先级排前面：SQLite 按照字符串倒序排列 HIGH > MEDIUM > LOW 不精准，可以在获取后处理或通过 CASE 语句，但最简单的处理是先按 createdAt 排序
    orderBy = [{ createdAt: "desc" }];
  }

  let todos = await prisma.todo.findMany({
    where,
    include: {
      category: true,
    },
    orderBy,
  });

  // 如果按 priority 排序，使用简洁的 JavaScript 自定义字段映射排序
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

export async function clearCompletedTodos() {
  await prisma.todo.deleteMany({
    where: { completed: true },
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

  revalidatePath("/");
}

export async function createCategory(name: string, color: string = "blue") {
  if (!name || name.trim() === "") {
    throw new Error("分类名称不能为空");
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      color,
    },
  });

  revalidatePath("/");
  return category;
}
