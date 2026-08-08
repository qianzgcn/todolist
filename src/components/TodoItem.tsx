"use client";

import React, { useState } from "react";
import { TodoItem as TodoType, Priority } from "@/types/todo";
import { Check, Calendar, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TodoItemProps {
  todo: TodoType;
  onToggle: (id: string, currentCompleted: boolean) => void;
  onEdit: (todo: TodoType) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const isOverdue =
    todo.dueDate && !todo.completed
      ? new Date(todo.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
      : false;

  const priorityVariantMap: Record<Priority, "high" | "medium" | "low"> = {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
  };

  const priorityLabelMap: Record<Priority, string> = {
    HIGH: "高",
    MEDIUM: "中",
    LOW: "低",
  };

  const formattedDate = todo.dueDate
    ? new Date(todo.dueDate).toLocaleDateString("zh-CN", {
        month: "numeric",
        day: "numeric",
      })
    : null;

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(todo.id);
  };

  return (
    <div
      className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex items-center justify-between gap-3 transition-all ${
        todo.completed ? "opacity-60 bg-slate-50 dark:bg-slate-900/50" : "hover:border-slate-300 dark:hover:border-slate-700"
      } ${isDeleting ? "scale-95 opacity-0" : "scale-100"}`}
    >
      {/* 复选框与标题 */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => onToggle(todo.id, todo.completed)}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
            todo.completed
              ? "bg-blue-600 border-blue-600 text-white"
              : "border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800"
          }`}
        >
          {todo.completed && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm leading-tight break-all ${
                todo.completed
                  ? "line-through text-slate-400 dark:text-slate-500"
                  : "text-slate-800 dark:text-slate-100 font-medium"
              }`}
            >
              {todo.title}
            </span>

            {/* 优先级 Badge */}
            <Badge variant={priorityVariantMap[todo.priority as Priority] || "medium"}>
              {priorityLabelMap[todo.priority as Priority] || "中"}
            </Badge>

            {/* 分类 Badge */}
            {todo.category && (
              <Badge variant="category">
                {todo.category.name}
              </Badge>
            )}
          </div>

          {/* 截止时间 */}
          {todo.dueDate && (
            <div className="flex items-center gap-1 text-[11px]">
              <span
                className={`flex items-center gap-1 ${
                  isOverdue
                    ? "text-red-600 dark:text-red-400 font-medium"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                <span>{isOverdue ? `已逾期 (${formattedDate})` : formattedDate}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(todo)}
          title="编辑"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-red-50 dark:hover:bg-red-950/40"
          onClick={handleDelete}
          title="删除"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-600" />
        </Button>
      </div>
    </div>
  );
}
