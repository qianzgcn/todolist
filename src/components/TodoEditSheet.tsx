"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { TodoItem, CategoryItem, Priority } from "@/types/todo";
import { updateTodo, createCategory } from "@/app/actions/todoActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodoEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  todo: TodoItem | null;
  categories: CategoryItem[];
  onSuccess: () => void;
}

export function TodoEditSheet({
  isOpen,
  onClose,
  todo,
  categories,
  onSuccess,
}: TodoEditSheetProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setPriority(todo.priority || "MEDIUM");

      if (todo.dueDate) {
        try {
          setDueDate(format(new Date(todo.dueDate), "yyyy-MM-dd"));
        } catch {
          setDueDate("");
        }
      } else {
        setDueDate("");
      }

      setCategoryId(todo.categoryId || "");
    } else {
      setTitle("");
      setPriority("MEDIUM");
      setDueDate("");
      setCategoryId("");
    }
    setErrorMsg("");
  }, [todo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !todo) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const targetCatId = categoryId && categoryId !== "NONE" ? categoryId : null;

      await updateTodo(todo.id, {
        title,
        priority,
        dueDate: dueDate || null,
        categoryId: targetCatId,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "更新任务失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const created = await createCategory(newCatName.trim());
      setCategoryId(created.id);
      setNewCatName("");
      setIsAddingCategory(false);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "创建分类失败");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold">编辑任务详情</SheetTitle>
        </SheetHeader>

        {errorMsg && (
          <div className="mx-4 p-2.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between p-4 pt-2 space-y-5">
          <div className="space-y-4">
            {/* 标题编辑 */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                任务名称 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="任务名称..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* 优先级编辑（带对应配色） */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                优先级
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["HIGH", "MEDIUM", "LOW"] as Priority[]).map((p) => {
                  const labelMap: Record<Priority, string> = {
                    HIGH: "高",
                    MEDIUM: "中",
                    LOW: "低",
                  };
                  const isSelected = priority === p;
                  const priorityStyleMap: Record<Priority, string> = {
                    HIGH: isSelected
                      ? "bg-amber-100 hover:bg-amber-100 dark:bg-amber-950/70 dark:hover:bg-amber-950/70 text-amber-800 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-300 border-amber-400 dark:border-amber-700"
                      : "text-slate-600 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-950/70 hover:text-amber-800 dark:hover:text-amber-300 hover:border-amber-400 dark:hover:border-amber-700",
                    MEDIUM: isSelected
                      ? "bg-blue-100 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-950/70 text-blue-700 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-300 border-blue-400 dark:border-blue-700"
                      : "text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-950/70 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-400 dark:hover:border-blue-700",
                    LOW: isSelected
                      ? "bg-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-800 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 border-slate-400 dark:border-slate-600"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600",
                  };
                  return (
                    <Button
                      type="button"
                      key={p}
                      variant="outline"
                      onClick={() => setPriority(p)}
                      className={`h-9 text-xs font-medium transition-colors ${priorityStyleMap[p]}`}
                    >
                      {labelMap[p]}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* 截止日期与分类 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  截止日期
                </label>
                <DatePicker
                  value={dueDate}
                  onChange={(val) => setDueDate(val)}
                  placeholder="选择截止日期"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    所属分类
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {isAddingCategory ? "取消" : "+ 新建"}
                  </button>
                </div>

                {isAddingCategory ? (
                  <div className="flex gap-1">
                    <Input
                      type="text"
                      placeholder="分类名"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                    />
                    <Button size="icon" type="button" className="h-8 w-8 flex-shrink-0" onClick={handleCreateCategory}>
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Select value={categoryId} onValueChange={(val) => setCategoryId(val ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="未分类">
                        {categories.find((c) => c.id === categoryId)?.name || "未分类"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">未分类</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {/* 底部按钮：右下角对齐 */}
          <SheetFooter className="px-0 pb-0 pt-4 flex-row justify-end gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()} size="sm">
              {isSubmitting ? "保存中..." : "确定"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
