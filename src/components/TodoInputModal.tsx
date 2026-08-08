"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { TodoItem, CategoryItem, Priority } from "@/types/todo";
import { createTodo, updateTodo, createCategory } from "@/app/actions/todoActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodoInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTodo?: TodoItem | null;
  categories: CategoryItem[];
  onSuccess: () => void;
}

export function TodoInputModal({
  isOpen,
  onClose,
  initialTodo,
  categories,
  onSuccess,
}: TodoInputModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    if (initialTodo) {
      setTitle(initialTodo.title);
      setPriority(initialTodo.priority || "MEDIUM");

      if (initialTodo.dueDate) {
        const d = new Date(initialTodo.dueDate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        setDueDate(`${year}-${month}-${day}`);
      } else {
        setDueDate("");
      }

      setCategoryId(initialTodo.categoryId || "");
    } else {
      setTitle("");
      setPriority("MEDIUM");
      setDueDate("");
      setCategoryId("");
    }
    setErrorMsg("");
  }, [initialTodo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("请填写任务标题");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const targetCatId = categoryId && categoryId !== "NONE" ? categoryId : null;

      if (initialTodo) {
        await updateTodo(initialTodo.id, {
          title,
          priority,
          dueDate: dueDate || null,
          categoryId: targetCatId,
        });
      } else {
        await createTodo({
          title,
          priority,
          dueDate: dueDate || null,
          categoryId: targetCatId,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "保存任务失败");
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialTodo ? "编辑任务" : "创建新任务"}</DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              任务标题 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="例如：完成项目代码开发..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                return (
                  <Button
                    type="button"
                    key={p}
                    variant={isSelected ? (p === "HIGH" ? "destructive" : p === "MEDIUM" ? "default" : "secondary") : "outline"}
                    onClick={() => setPriority(p)}
                    className="h-8"
                  >
                    {labelMap[p]}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Due Date (shadcn DatePicker) & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Due Date with shadcn DatePicker */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                截止日期
              </label>
              <DatePicker
                value={dueDate}
                onChange={(val) => setDueDate(val)}
              />
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  分类
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isAddingCategory ? "取消" : "+ 新建分类"}
                </button>
              </div>

              {isAddingCategory ? (
                <div className="flex gap-1">
                  <Input
                    type="text"
                    placeholder="分类名"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                  <Button size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleCreateCategory}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="未分类" />
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

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "确认"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
