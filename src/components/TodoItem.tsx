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

  const overdueDays = React.useMemo(() => {
    if (!todo.dueDate || !isOverdue) return 0;
    const due = new Date(todo.dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [todo.dueDate, isOverdue]);

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

  const formattedDueDate = todo.dueDate
    ? new Date(todo.dueDate).toLocaleDateString("zh-CN", {
        month: "numeric",
        day: "numeric",
      })
    : null;

  const formattedCreatedDate = todo.createdAt
    ? new Date(todo.createdAt).toLocaleDateString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(todo.id);
  };

  return (
    <div
      className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex items-start justify-between gap-3 transition-all ${
        todo.completed ? "opacity-60 bg-slate-50 dark:bg-slate-900/50" : "hover:border-slate-300 dark:hover:border-slate-700"
      } ${isDeleting ? "scale-95 opacity-0" : "scale-100"}`}
    >
      {/* 内容区域：分为第一行（标题）和第二行（次要元数据） */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* 复选框 */}
        <button
          onClick={() => onToggle(todo.id, todo.completed)}
          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
            todo.completed
              ? "bg-blue-600 border-blue-600 text-white"
              : "border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800"
          }`}
        >
          {todo.completed && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* 第一行：任务名称（最显著） */}
          <div>
            <span
              className={`text-sm leading-snug break-all font-medium ${
                todo.completed
                  ? "line-through text-slate-400 dark:text-slate-500 font-normal"
                  : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {todo.title}
            </span>
          </div>

          {/* 第二行：次要信息汇总（包含精准计算的已逾期天数） */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* 优先级 Badge：单字 高 / 中 / 低 */}
            <Badge variant={priorityVariantMap[todo.priority as Priority] || "medium"}>
              {priorityLabelMap[todo.priority as Priority] || "中"}
            </Badge>

            {/* 分类 Badge */}
            {todo.category && (
              <Badge variant="category">
                {todo.category.name}
              </Badge>
            )}

            {/* 截止时间 / 精准逾期天数 */}
            {todo.dueDate && (
              <span
                className={`flex items-center gap-1 text-[11px] ${
                  isOverdue
                    ? "text-red-600 dark:text-red-400 font-semibold"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3 h-3" />}
                <span>
                  {isOverdue
                    ? `已逾期 ${overdueDays} 天 (${formattedDueDate})`
                    : `截止: ${formattedDueDate}`}
                </span>
              </span>
            )}

            {/* 创建时间 */}
            {formattedCreatedDate && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                创建于 {formattedCreatedDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
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
