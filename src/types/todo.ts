export type Priority = "HIGH" | "MEDIUM" | "LOW";

export type StatusFilter = "ALL" | "ACTIVE" | "COMPLETED";

export type SortBy = "dueDate" | "createdAt" | "priority";

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
  dueDate?: Date | string | null;
  categoryId?: string | null;
  category?: CategoryItem | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateTodoInput {
  title: string;
  priority?: Priority;
  dueDate?: string | null;
  categoryId?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: string | null;
  categoryId?: string | null;
}
