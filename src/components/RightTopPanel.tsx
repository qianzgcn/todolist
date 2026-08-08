"use client";

import React from "react";
import { Search, Trash2, ArrowUpDown } from "lucide-react";
import { SortBy, TodoItem } from "@/types/todo";

interface RightTopPanelProps {
  search: string;
  setSearch: (search: string) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  todos: TodoItem[];
  completedCount: number;
  onClearCompleted: () => void;
}

export function RightTopPanel({
  search,
  setSearch,
  sortBy,
  setSortBy,
  todos,
  completedCount,
  onClearCompleted,
}: RightTopPanelProps) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 flex-shrink-0">
      {/* 统计指标与进度条 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400">总计: </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span>
          </div>
          <div>
            <span className="text-slate-400">进行中: </span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{total - completed}</span>
          </div>
          <div>
            <span className="text-slate-400">已完成: </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completed}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">完成度</span>
          <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="font-medium text-slate-600 dark:text-slate-400">{percent}%</span>
        </div>
      </div>

      {/* 搜索与工具栏 */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              清空
            </button>
          )}
        </div>

        {/* 排序与批量清除 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="createdAt" className="dark:bg-slate-900">按创建时间</option>
              <option value="dueDate" className="dark:bg-slate-900">按截止时间</option>
              <option value="priority" className="dark:bg-slate-900">按优先级</option>
            </select>
          </div>

          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清理已完成</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
