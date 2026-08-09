export const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

export type Priority = (typeof PRIORITIES)[number];

export type StatusFilter = "ALL" | "ACTIVE" | "COMPLETED";

export type SortOrder = "asc" | "desc"; // asc: 最早创建(顺序), desc: 最新创建(逆序)

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  categoryId?: string | null;
  category?: CategoryItem | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodoData {
  todos: TodoItem[];
  categories: CategoryItem[];
}

export interface CreateTodoInput {
  title: string;
  priority?: Priority;
  dueDate?: string | null;
  categoryId?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  priority?: Priority;
  dueDate?: string | null;
  categoryId?: string | null;
}
