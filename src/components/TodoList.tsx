"use client";

import React from "react";
import { TodoItem as TodoType } from "@/types/todo";
import { TodoItem } from "./TodoItem";
import { Inbox } from "lucide-react";

interface TodoListProps {
  todos: TodoType[];
  hasFilter: boolean;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onEdit: (todo: TodoType) => void;
  onDelete: (id: string) => Promise<void>;
}

export function TodoList({
  todos,
  hasFilter,
  onToggle,
  onEdit,
  onDelete,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Inbox className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300 dark:text-slate-600" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {hasFilter ? "没有符合条件的任务" : "暂无任务 (在上方的输入框添加即可)"}
        </p>
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
