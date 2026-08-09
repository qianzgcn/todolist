import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  PRIORITIES,
  type CategoryItem,
  type Priority,
  type TodoData,
  type TodoItem,
} from "@/types/todo";

type TodoWithCategory = Prisma.TodoGetPayload<{
  include: { category: true };
}>;

type TodoReader = Pick<Prisma.TransactionClient, "todo" | "category">;

export function toCategoryItem(category: {
  id: string;
  name: string;
  color: string;
}): CategoryItem {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
  };
}

export function toTodoItem(todo: TodoWithCategory): TodoItem {
  if (!PRIORITIES.includes(todo.priority as Priority)) {
    throw new Error(`任务 ${todo.id} 的优先级无效`);
  }

  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    priority: todo.priority as Priority,
    dueDate: todo.dueDate?.toISOString() ?? null,
    categoryId: todo.categoryId,
    category: todo.category ? toCategoryItem(todo.category) : null,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

export async function getTodoData(
  client: TodoReader = prisma,
): Promise<TodoData> {
  const user = await getCurrentUser();
  if (!user) {
    return { todos: [], categories: [] };
  }

  const [todos, categories] = await Promise.all([
    client.todo.findMany({
      where: { userId: user.userId },
      include: { category: true },
      orderBy: [{ completed: "asc" }, { createdAt: "asc" }],
    }),
    client.category.findMany({
      where: { userId: user.userId },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    todos: todos.map(toTodoItem),
    categories: categories.map(toCategoryItem),
  };
}
