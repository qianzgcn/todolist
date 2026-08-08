"use client";

import React from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { SortOrder, TodoItem } from "@/types/todo";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

      {/* 搜索与排序 */}
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

        {/* 排序选项：按创建时间 (顺序/逆序) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
              <SelectTrigger className="w-[155px]">
                <SelectValue placeholder="创建时间排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">最早创建在前 (顺序)</SelectItem>
                <SelectItem value="desc">最新创建在前 (逆序)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
