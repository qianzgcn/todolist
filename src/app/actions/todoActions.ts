"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { toCategoryItem, toTodoItem } from "@/lib/todo-data";
import {
  readBoolean,
  readDueDate,
  readNullableId,
  readPriority,
  readRequiredId,
  readRequiredText,
} from "@/lib/todo-validation";
import type {
  CategoryItem,
  CreateTodoInput,
  TodoItem,
  UpdateTodoInput,
} from "@/types/todo";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("请先登录系统");
  }
  return user;
}

async function requireOwnedCategory(userId: string, categoryId: string | null | undefined) {
  if (categoryId === undefined || categoryId === null) return categoryId;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  });

  if (!category) {
    throw new Error("无权使用该分类");
  }

  return categoryId;
}

export async function createTodo(
  input: CreateTodoInput,
): Promise<TodoItem> {
  const user = await requireUser();

  if (!input || typeof input !== "object") {
    throw new Error("任务数据无效");
  }

  const title = readRequiredText(input.title, "任务标题", 200);
  const priority = readPriority(input.priority, "MEDIUM") ?? "MEDIUM";
  const dueDate = readDueDate(input.dueDate) ?? null;
  const categoryId =
    (await requireOwnedCategory(
      user.userId,
      readNullableId(input.categoryId),
    )) ?? null;

  const todo = await prisma.todo.create({
    data: {
      title,
      priority,
      dueDate,
      userId: user.userId,
      categoryId,
    },
    include: { category: true },
  });

  return toTodoItem(todo);
}

export async function toggleTodo(
  id: string,
  completed: boolean,
): Promise<TodoItem> {
  const user = await requireUser();
  const todoId = readRequiredId(id);

  const existing = await prisma.todo.findFirst({
    where: { id: todoId, userId: user.userId },
  });

  if (!existing) {
    throw new Error("无权修改该任务");
  }

  const todo = await prisma.todo.update({
    where: { id: todoId },
    data: { completed: readBoolean(completed) },
    include: { category: true },
  });

  return toTodoItem(todo);
}

export async function updateTodo(
  id: string,
  input: UpdateTodoInput,
): Promise<TodoItem> {
  const user = await requireUser();
  const todoId = readRequiredId(id);

  const existing = await prisma.todo.findFirst({
    where: { id: todoId, userId: user.userId },
  });

  if (!existing) {
    throw new Error("无权修改该任务");
  }

  if (!input || typeof input !== "object") {
    throw new Error("任务数据无效");
  }

  const data: Prisma.TodoUncheckedUpdateInput = {};

  if (input.title !== undefined) {
    data.title = readRequiredText(input.title, "任务标题", 200);
  }

  const priority = readPriority(input.priority);
  if (priority !== undefined) data.priority = priority;

  const dueDate = readDueDate(input.dueDate);
  if (dueDate !== undefined) data.dueDate = dueDate;

  const categoryId = await requireOwnedCategory(
    user.userId,
    readNullableId(input.categoryId),
  );
  if (categoryId !== undefined) {
    data.categoryId = categoryId;
  }

  if (Object.keys(data).length === 0) {
    throw new Error("没有需要更新的内容");
  }

  const todo = await prisma.todo.update({
    where: { id: todoId },
    data,
    include: { category: true },
  });

  return toTodoItem(todo);
}

export async function deleteTodo(id: string) {
  const user = await requireUser();
  const todoId = readRequiredId(id);

  const existing = await prisma.todo.findFirst({
    where: { id: todoId, userId: user.userId },
  });

  if (!existing) {
    throw new Error("无权删除该任务");
  }

  await prisma.todo.delete({
    where: { id: todoId },
  });
}

export async function createCategory(name: string): Promise<CategoryItem> {
  const user = await requireUser();
  const trimmed = readRequiredText(name, "分类名称", 50);

  const existing = await prisma.category.findFirst({
    where: { name: trimmed, userId: user.userId },
  });

  if (existing) return toCategoryItem(existing);

  return toCategoryItem(
    await prisma.category.create({
      data: { name: trimmed, userId: user.userId },
    }),
  );
}
