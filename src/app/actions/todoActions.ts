"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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

export async function createTodo(
  input: CreateTodoInput,
): Promise<TodoItem> {
  if (!input || typeof input !== "object") {
    throw new Error("任务数据无效");
  }

  const title = readRequiredText(input.title, "任务标题", 200);
  const priority = readPriority(input.priority, "MEDIUM") ?? "MEDIUM";
  const dueDate = readDueDate(input.dueDate) ?? null;
  const categoryId = readNullableId(input.categoryId) ?? null;

  const todo = await prisma.todo.create({
    data: {
      title,
      priority,
      dueDate,
      ...(categoryId
        ? { category: { connect: { id: categoryId } } }
        : {}),
    },
    include: { category: true },
  });

  return toTodoItem(todo);
}

export async function toggleTodo(
  id: string,
  completed: boolean,
): Promise<TodoItem> {
  const todo = await prisma.todo.update({
    where: { id: readRequiredId(id) },
    data: { completed: readBoolean(completed) },
    include: { category: true },
  });

  return toTodoItem(todo);
}

export async function updateTodo(
  id: string,
  input: UpdateTodoInput,
): Promise<TodoItem> {
  if (!input || typeof input !== "object") {
    throw new Error("任务数据无效");
  }

  const data: Prisma.TodoUpdateInput = {};

  if (input.title !== undefined) {
    data.title = readRequiredText(input.title, "任务标题", 200);
  }

  const priority = readPriority(input.priority);
  if (priority !== undefined) data.priority = priority;

  const dueDate = readDueDate(input.dueDate);
  if (dueDate !== undefined) data.dueDate = dueDate;

  const categoryId = readNullableId(input.categoryId);
  if (categoryId !== undefined) {
    data.category = categoryId
      ? { connect: { id: categoryId } }
      : { disconnect: true };
  }

  if (Object.keys(data).length === 0) {
    throw new Error("没有需要更新的内容");
  }

  const todo = await prisma.todo.update({
    where: { id: readRequiredId(id) },
    data,
    include: { category: true },
  });

  return toTodoItem(todo);
}

export async function deleteTodo(id: string) {
  await prisma.todo.delete({
    where: { id: readRequiredId(id) },
  });
}

export async function createCategory(name: string): Promise<CategoryItem> {
  const trimmed = readRequiredText(name, "分类名称", 50);
  const existing = await prisma.category.findUnique({
    where: { name: trimmed },
  });

  if (existing) return toCategoryItem(existing);

  return toCategoryItem(
    await prisma.category.create({
      data: { name: trimmed },
    }),
  );
}
