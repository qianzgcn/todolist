"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { TodoItem, CategoryItem, Priority } from "@/types/todo";
import { createTodo, updateTodo, createCategory } from "@/app/actions/todoActions";

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("请填写任务标题");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      if (initialTodo) {
        await updateTodo(initialTodo.id, {
          title,
          priority,
          dueDate: dueDate || null,
          categoryId: categoryId || null,
        });
      } else {
        await createTodo({
          title,
          priority,
          dueDate: dueDate || null,
          categoryId: categoryId || null,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-xl p-6 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {initialTodo ? "编辑任务" : "创建新任务"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              任务标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="例如：完成项目代码开发..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
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
                  HIGH: "高优",
                  MEDIUM: "中优",
                  LOW: "低优",
                };
                const isSelected = priority === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-1.5 px-3 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? p === "HIGH"
                          ? "bg-red-600 text-white border-red-600"
                          : p === "MEDIUM"
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {labelMap[p]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                截止日期
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
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
                  <input
                    type="text"
                    placeholder="分类名"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-2 py-1 rounded text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="p-1 rounded bg-blue-600 text-white cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="">未分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="dark:bg-slate-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {isSubmitting ? "保存中..." : "确 认"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
