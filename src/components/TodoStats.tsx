"use client";

import React from "react";
import { TodoItem } from "@/types/todo";
import { CheckCircle2, ListTodo, Clock, TrendingUp } from "lucide-react";

interface TodoStatsProps {
  todos: TodoItem[];
}

export function TodoStats({ todos }: TodoStatsProps) {
  const total = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = total - completedCount;
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-6 smooth-transition">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {/* 全部任务 */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">全部任务</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{total}</p>
          </div>
        </div>

        {/* 待办 */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">待完成</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{activeCount}</p>
          </div>
        </div>

        {/* 已完成 */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">已完成</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{completedCount}</p>
          </div>
        </div>

        {/* 完成率 */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">完成率</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{completionRate}%</p>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full smooth-transition"
          style={{ width: `${completionRate}%` }}
        />
      </div>
    </div>
  );
}
