"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Sun,
  Moon,
  RotateCcw,
  Folder,
  Inbox,
  CheckCircle2,
  Clock,
  FolderPlus,
  Check,
} from "lucide-react";
import { StatusFilter, CategoryItem, TodoItem } from "@/types/todo";
import { resetToSeedData, createCategory } from "@/app/actions/todoActions";

interface SidebarProps {
  status: StatusFilter;
  setStatus: (status: StatusFilter) => void;
  categoryId: string;
  setCategoryId: (id: string) => void;
  categories: CategoryItem[];
  todos: TodoItem[];
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  onOpenCreateModal: () => void;
  onRefresh: () => void;
}

export function Sidebar({
  status,
  setStatus,
  categoryId,
  setCategoryId,
  categories,
  todos,
  darkMode,
  setDarkMode,
  onOpenCreateModal,
  onRefresh,
}: SidebarProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const handleResetSeed = async () => {
    if (confirm("确定重置为初始示例数据？")) {
      try {
        setIsResetting(true);
        await resetToSeedData();
        onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const created = await createCategory(newCatName.trim());
      setCategoryId(created.id);
      setNewCatName("");
      setIsAddingCat(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // 统计数
  const totalCount = todos.length;
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const getCategoryCount = (catId: string) => {
    return todos.filter((t) => t.categoryId === catId).length;
  };

  return (
    <aside className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col h-full flex-shrink-0">
      {/* 头部标题与新建按钮 */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-base">
              我的任务
            </span>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加任务</span>
        </button>
      </div>

      {/* 状态与分类菜单 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* 视图状态 */}
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            视图
          </p>

          <button
            onClick={() => setStatus("ALL")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
              status === "ALL"
                ? "bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              <span>全部</span>
            </span>
            <span className="text-[11px] text-slate-400">{totalCount}</span>
          </button>

          <button
            onClick={() => setStatus("ACTIVE")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
              status === "ACTIVE"
                ? "bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>待办</span>
            </span>
            <span className="text-[11px] text-slate-400">{activeCount}</span>
          </button>

          <button
            onClick={() => setStatus("COMPLETED")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
              status === "COMPLETED"
                ? "bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>已完成</span>
            </span>
            <span className="text-[11px] text-slate-400">{completedCount}</span>
          </button>
        </div>

        {/* 分类列表 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-1">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              分类
            </p>
            <button
              onClick={() => setIsAddingCat(!isAddingCat)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="新建分类"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 新建分类输入 */}
          {isAddingCat && (
            <div className="flex items-center gap-1 px-2 py-1">
              <input
                type="text"
                placeholder="分类名称..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className="w-full px-2 py-1 rounded text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                className="p-1 rounded bg-blue-600 text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setCategoryId("ALL")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
              categoryId === "ALL"
                ? "bg-slate-200/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-slate-400" />
              <span>全部分类</span>
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                categoryId === cat.id
                  ? "bg-slate-200/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">{cat.name}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {getCategoryCount(cat.id)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 底部控制 */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="flex items-center gap-1.5 p-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          <span>{darkMode ? "浅色模式" : "暗黑模式"}</span>
        </button>

        <button
          onClick={handleResetSeed}
          disabled={isResetting}
          className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          title="重置示例数据"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
          <span>重置数据</span>
        </button>
      </div>
    </aside>
  );
}
