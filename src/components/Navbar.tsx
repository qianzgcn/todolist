"use client";

import React, { useState } from "react";
import { CheckSquare, Sun, Moon, RotateCcw, Plus } from "lucide-react";
import { resetToSeedData } from "@/app/actions/todoActions";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  onOpenCreateModal: () => void;
  onRefresh: () => void;
}

export function Navbar({ darkMode, setDarkMode, onOpenCreateModal, onRefresh }: NavbarProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetSeed = async () => {
    if (confirm("确定要恢复默认示例任务与分类吗？现有的任务将被重置。")) {
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

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">TodoCraft</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">个人高效任务清单</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleResetSeed}
            disabled={isResetting}
            title="重置示例数据"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 smooth-transition flex items-center gap-1.5 text-xs font-medium"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? "animate-spin text-blue-500" : ""}`} />
            <span className="hidden sm:inline">重置示例</span>
          </button>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            title="切换暗黑/明亮主题"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 smooth-transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-sm shadow-blue-500/30 smooth-transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>新建任务</span>
          </button>
        </div>
      </div>
    </header>
  );
}
