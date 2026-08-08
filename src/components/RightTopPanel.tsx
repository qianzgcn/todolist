"use client";

import React from "react";
import { Search, ArrowDownUp } from "lucide-react";
import { SortOrder, TodoItem } from "@/types/todo";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface RightTopPanelProps {
  search: string;
  setSearch: (search: string) => void;
  sortOrder: SortOrder;
  setSortOrder: (sortOrder: SortOrder) => void;
  todos: TodoItem[];
}

export function RightTopPanel({
  search,
  setSearch,
  sortOrder,
  setSortOrder,
  todos,
}: RightTopPanelProps) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

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
          <div className="w-24">
            <Progress value={percent} />
          </div>
          <span className="font-medium text-slate-600 dark:text-slate-400">{percent}%</span>
        </div>
      </div>

      {/* 搜索与直观轻量的 1-Click 排序按钮 */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            type="text"
            placeholder="搜索任务..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              清空
            </button>
          )}
        </div>

        {/* 优雅直接的单击切换按钮：最早在前 / 最新在前 */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortOrder}
          className="flex items-center gap-1.5 h-8 px-2.5 text-xs text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          title="点击直接切换创建时间顺序/逆序"
        >
          <ArrowDownUp
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              sortOrder === "desc" ? "rotate-180 text-blue-600 dark:text-blue-400" : "text-slate-400"
            }`}
          />
          <span>{sortOrder === "asc" ? "最早在前" : "最新在前"}</span>
        </Button>
      </div>
    </div>
  );
}
