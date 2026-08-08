"use client";

import React from "react";
import { Search, Trash2, Filter, ArrowUpDown } from "lucide-react";
import { StatusFilter, SortBy, CategoryItem } from "@/types/todo";

interface TodoFilterBarProps {
  status: StatusFilter;
  setStatus: (status: StatusFilter) => void;
  categoryId: string;
  setCategoryId: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  categories: CategoryItem[];
  completedCount: number;
  onClearCompleted: () => void;
}

export function TodoFilterBar({
  status,
  setStatus,
  categoryId,
  setCategoryId,
  search,
  setSearch,
  sortBy,
  setSortBy,
  categories,
  completedCount,
  onClearCompleted,
}: TodoFilterBarProps) {
  return (
    <div className="glass-panel rounded-2xl p-4 mb-6 space-y-3 sm:space-y-4">
      {/* 上层：搜索框 + 动作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* 搜索框 */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索任务关键字..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-100/70 dark:bg-slate-800/70 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none smooth-transition text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              清除
            </button>
          )}
        </div>

        {/* 批量清理完成 */}
        {completedCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 smooth-transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清理已完成 ({completedCount})</span>
          </button>
        )}
      </div>

      {/* 下层：状态 Tab + 分类下拉 + 排序下拉 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
        {/* 状态 Tabs */}
        <div className="flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl text-xs font-medium">
          {(["ALL", "ACTIVE", "COMPLETED"] as StatusFilter[]).map((tab) => {
            const labelMap: Record<StatusFilter, string> = {
              ALL: "全部",
              ACTIVE: "待完成",
              COMPLETED: "已完成",
            };
            const isActive = status === tab;
            return (
              <button
                key={tab}
                onClick={() => setStatus(tab)}
                className={`px-3 py-1.5 rounded-lg smooth-transition ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>

        {/* 筛选与排序 */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* 分类下拉 */}
          <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-xl border border-transparent text-xs text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">全部分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="dark:bg-slate-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 排序下拉 */}
          <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-xl border border-transparent text-xs text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="createdAt" className="dark:bg-slate-900">按创建时间</option>
              <option value="dueDate" className="dark:bg-slate-900">按到期日</option>
              <option value="priority" className="dark:bg-slate-900">按优先级</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
