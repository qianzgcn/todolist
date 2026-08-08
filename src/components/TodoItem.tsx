"use client";

import React, { useState } from "react";
import { TodoItem as TodoType, Priority } from "@/types/todo";
import { Calendar, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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

  const priorityBadge = React.useMemo(() => {
    switch (todo.priority) {
      case "HIGH":
        return (
          <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/80 hover:bg-amber-100">
            高
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100">
            中
          </Badge>
        );
      case "LOW":
        return (
          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100">
            低
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100">
            中
          </Badge>
        );
    }
  }, [todo.priority]);

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
      onDoubleClick={() => onEdit(todo)}
      title="双击或点击编辑按钮即可修改任务"
      className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex items-start justify-between gap-3 transition-all cursor-pointer ${
        todo.completed ? "opacity-60 bg-slate-50 dark:bg-slate-900/50" : "hover:border-slate-300 dark:hover:border-slate-700"
      } ${isDeleting ? "scale-95 opacity-0" : "scale-100"}`}
    >
      {/* 内容区域：分为第一行（标题）和第二行（次要元数据） */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* 肯定积极的绿色复选框 */}
        <div className="mt-0.5 flex items-center justify-center flex-shrink-0">
          <Checkbox 
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id, todo.completed)}
            className="data-checked:bg-emerald-600 data-checked:border-emerald-600 dark:data-checked:bg-emerald-600 text-white"
          />
        </div>

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
            {priorityBadge}

            {/* 分类 Badge */}
            {todo.category && (
              <Badge variant="secondary">
                {todo.category.name}
              </Badge>
            )}

            {/* 截止时间 / 精准逾期天数 (不带杂余后缀) */}
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
                    ? `已逾期 ${overdueDays} 天`
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
