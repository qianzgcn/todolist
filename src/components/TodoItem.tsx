"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Calendar, Edit2, Trash2 } from "lucide-react";
import type { TodoItem as TodoType } from "@/types/todo";
import { PRIORITY_CONFIG } from "@/lib/priority-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TodoItemProps {
  todo: TodoType;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onEdit: (todo: TodoType) => void;
  onDelete: (id: string) => Promise<void>;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOverdue =
    todo.dueDate && !todo.completed
      ? new Date(todo.dueDate).setHours(0, 0, 0, 0) <
        new Date().setHours(0, 0, 0, 0)
      : false;

  const overdueDays = useMemo(() => {
    if (!todo.dueDate || !isOverdue) return 0;
    const due = new Date(todo.dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(
      0,
      Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }, [todo.dueDate, isOverdue]);

  const priorityBadge = useMemo(() => {
    const config = PRIORITY_CONFIG[todo.priority];
    return <Badge className={config.badgeClass}>{config.label}</Badge>;
  }, [todo.priority]);

  const formattedDueDate = todo.dueDate
    ? new Date(todo.dueDate).toLocaleDateString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const formattedCreatedDate = new Date(todo.createdAt).toLocaleDateString(
    "zh-CN",
    {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
      setDeleteDialogOpen(false);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        size="sm"
        onDoubleClick={() => onEdit(todo)}
        title="双击或点击编辑按钮即可修改任务"
        className={`group gap-0 py-0 transition-all ${
          todo.completed
            ? "bg-slate-50 opacity-60 dark:bg-slate-900/50"
            : "hover:ring-foreground/20"
        } ${isDeleting ? "scale-95 opacity-0" : "scale-100"}`}
      >
        <CardContent className="flex items-center justify-between gap-3 p-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex shrink-0 items-center justify-center self-center">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => void onToggle(todo.id, !todo.completed)}
                aria-label={todo.completed ? "标记为待办" : "标记为已完成"}
                className="text-white data-checked:border-emerald-600 data-checked:bg-emerald-600 dark:data-checked:bg-emerald-600 cursor-pointer"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <span
                className={`break-all text-sm font-medium leading-snug ${
                  todo.completed
                    ? "font-normal text-slate-400 line-through dark:text-slate-500"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {todo.title}
              </span>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {priorityBadge}
                {todo.category && (
                  <Badge variant="secondary">{todo.category.name}</Badge>
                )}

                {todo.dueDate && (
                  <span
                    className={`flex items-center gap-1 text-[11px] ${
                      isOverdue
                        ? "font-semibold text-red-600 dark:text-red-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {isOverdue ? (
                      <AlertCircle className="size-3.5" />
                    ) : (
                      <Calendar className="size-3" />
                    )}
                    {isOverdue
                      ? `已逾期 ${overdueDays} 天`
                      : `截止: ${formattedDueDate}`}
                  </span>
                )}

                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  创建于 {formattedCreatedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 pt-0.5 opacity-80 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(todo)}
              aria-label="编辑任务"
            >
              <Edit2 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteDialogOpen(true)}
              aria-label="删除任务"
              className="hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 className="text-slate-400 hover:text-red-600" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>删除任务？</DialogTitle>
            <DialogDescription>
              “{todo.title}”将被永久删除，此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              取消
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
