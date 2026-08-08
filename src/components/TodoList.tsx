"use client";

import React from "react";
import { TodoItem as TodoType } from "@/types/todo";
import { TodoItem } from "./TodoItem";
import { Inbox } from "lucide-react";

interface TodoListProps {
  todos: TodoType[];
  isLoading: boolean;
  hasFilter: boolean;
  onToggle: (id: string, currentCompleted: boolean) => void;
  onEdit: (todo: TodoType) => void;
  onDelete: (id: string) => void;
  onOpenCreate: () => void;
}

export function TodoList({
  todos,
  isLoading,
  hasFilter,
  onToggle,
  onEdit,
  onDelete,
  onOpenCreate,
}: TodoListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Inbox className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300 dark:text-slate-600" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {hasFilter ? "没有符合条件的任务" : "暂无任务"}
        </p>
        {!hasFilter && (
          <button
            onClick={onOpenCreate}
            className="mt-3 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
          >
            添加新任务
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 overflow-y-auto flex-1">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
