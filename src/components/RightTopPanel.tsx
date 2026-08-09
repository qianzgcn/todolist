"use client";

import React, { useState } from "react";
import { ArrowUp, ArrowDown, Plus, Sun, Moon } from "lucide-react";
import { format } from "date-fns";
import { SortOrder, TodoItem, CategoryItem, Priority, StatusFilter } from "@/types/todo";
import { PRIORITY_CONFIG } from "@/lib/priority-config";
import { createTodo } from "@/app/actions/todoActions";
import { isDueDateToday } from "@/lib/todo-validation";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RightTopPanelProps {
  categoryId: string;
  categories: CategoryItem[];
  status: StatusFilter;
  setStatus: (status: StatusFilter) => void;
  sortOrder: SortOrder;
  setSortOrder: (sortOrder: SortOrder) => void;
  todos: TodoItem[];
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onTodoCreated: (todo: TodoItem) => void;
}

export function RightTopPanel({
  categoryId,
  categories,
  status,
  setStatus,
  sortOrder,
  setSortOrder,
  todos,
  darkMode,
  onToggleDarkMode,
  onTodoCreated,
}: RightTopPanelProps) {
  // 快速创建状态
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<Priority>("MEDIUM");
  const [quickDueDate, setQuickDueDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd") + " 23:59"
  );
  const [selectedCatId, setSelectedCatId] = useState(
    categoryId !== "ALL" && categoryId !== "MY_DAY" ? categoryId : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 计算当前选中菜单的标题文本
  const activeTitle = React.useMemo(() => {
    if (categoryId === "MY_DAY") return "☀️ 我的一天";
    if (categoryId === "ALL") return "📂 全部分类";
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "全部分类";
  }, [categoryId, categories]);

  // 2. 快捷创建栏选中的分类名称（纯文本显示，不暴露 ID，也不要文件夹图标）
  const selectedCatName = React.useMemo(() => {
    if (!selectedCatId || selectedCatId === "NONE") return "无分类";
    const cat = categories.find((c) => c.id === selectedCatId);
    return cat ? cat.name : "无分类";
  }, [selectedCatId, categories]);

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const targetCatId =
        selectedCatId && selectedCatId !== "NONE" ? selectedCatId : null;

      const todo = await createTodo({
        title: quickTitle,
        priority: quickPriority,
        dueDate: quickDueDate || null,
        categoryId: targetCatId,
      });

      onTodoCreated(todo);
      setQuickTitle("");
      setQuickPriority("MEDIUM");
      setQuickDueDate(format(new Date(), "yyyy-MM-dd") + " 23:59");
    } catch (err) {
      console.error("快捷创建任务失败:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 统计信息与当前选中的分类强关联（支持“我的一天”动态视图）
  const statsTodos = React.useMemo(() => {
    if (!categoryId || categoryId === "ALL") return todos;
    if (categoryId === "MY_DAY") {
      return todos.filter((t) => isDueDateToday(t.dueDate));
    }
    return todos.filter((t) => t.categoryId === categoryId);
  }, [todos, categoryId]);

  const total = statsTodos.length;
  const completed = statsTodos.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // 按照不同完成度百分比，提供指示器颜色区分
  const progressInfo = React.useMemo(() => {
    if (total === 0) {
      return {
        textStyle: "text-slate-400 dark:text-slate-500",
        indicatorStyle: "bg-slate-300 dark:bg-slate-700",
      };
    }
    if (percent === 100) {
      return {
        textStyle: "text-emerald-600 dark:text-emerald-400 font-bold",
        indicatorStyle: "bg-emerald-500",
      };
    }
    if (percent >= 50) {
      return {
        textStyle: "text-blue-600 dark:text-blue-400 font-semibold",
        indicatorStyle: "bg-blue-500",
      };
    }
    if (percent > 0) {
      return {
        textStyle: "text-amber-600 dark:text-amber-400 font-semibold",
        indicatorStyle: "bg-amber-500",
      };
    }
    return {
      textStyle: "text-slate-500 dark:text-slate-400",
      indicatorStyle: "bg-slate-400",
    };
  }, [percent, total]);

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 flex-shrink-0">
      {/* 📊 1. 最上方：左侧当前选中菜单 Title + 可点击交互筛选的统计胶囊按钮 */}
      <div className="flex items-center justify-between gap-4 text-xs pb-1">
        <div className="flex items-center gap-3 min-w-0">
          {/* 左侧突出显示当前选中菜单的 Title */}
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 shrink-0 truncate">
            {activeTitle}
          </h2>

          <span className="text-slate-300 dark:text-slate-700 shrink-0">|</span>

          {/* 可点击交互筛选的统计数字胶囊 */}
          <div className="flex items-center gap-1.5 text-xs">
            {/* 1. 总计胶囊 */}
            <button
              type="button"
              onClick={() => setStatus("ALL")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                status === "ALL"
                  ? "bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-slate-100 shadow-xs font-bold scale-105"
                  : "bg-slate-100/70 dark:bg-slate-900/70 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:scale-102"
              }`}
              title="点击查看所有任务"
            >
              <span>总计:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{total}</span>
            </button>

            {/* 2. 进行中胶囊 */}
            <button
              type="button"
              onClick={() => setStatus("ACTIVE")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                status === "ACTIVE"
                  ? "bg-blue-100 dark:bg-blue-950/80 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100 shadow-xs font-bold scale-105"
                  : "bg-blue-50/70 dark:bg-blue-950/40 border-transparent text-blue-700 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/60 hover:scale-102"
              }`}
              title="点击筛选进行中（未完成）任务"
            >
              <span>进行中:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{total - completed}</span>
            </button>

            {/* 3. 已完成胶囊 */}
            <button
              type="button"
              onClick={() => setStatus("COMPLETED")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                status === "COMPLETED"
                  ? "bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-100 shadow-xs font-bold scale-105"
                  : "bg-emerald-50/70 dark:bg-emerald-950/40 border-transparent text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 hover:scale-102"
              }`}
              title="点击筛选已完成任务"
            >
              <span>已完成:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{completed}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">完成度</span>
            <div className="w-16 sm:w-20">
              <Progress
                value={percent}
                indicatorClassName={progressInfo.indicatorStyle}
                aria-label="任务完成度"
              />
            </div>
            <span className={`tabular-nums ${progressInfo.textStyle}`}>{percent}%</span>
          </div>

          {/* ↕️ 排序图标：只显示单一方向箭头，按需要切换 */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggleSortOrder}
            className="h-7 w-7 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title={sortOrder === "asc" ? "顺序（最早在前），点击切换逆序" : "逆序（最新在前），点击切换顺序"}
          >
            {sortOrder === "asc" ? (
              <ArrowUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
          </Button>

          {/* ☀️/🌙 右上角明暗模式图标 */}
          {onToggleDarkMode && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onToggleDarkMode}
              className="h-7 w-7 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={darkMode ? "切换至浅色模式" : "切换至暗黑模式"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              )}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* 🚀 2. 下方：单行整体快捷创建表单 */}
      <form onSubmit={handleQuickCreate} className="flex items-center gap-2 w-full">
        {/* 任务标题输入框 */}
        <div className="flex-1 min-w-0">
          <Label htmlFor="quick-todo-title" className="sr-only">
            任务标题
          </Label>
          <Input
            id="quick-todo-title"
            type="text"
            placeholder="快捷添加新任务..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            disabled={isSubmitting}
            className="h-8 text-xs bg-slate-100/60 dark:bg-slate-900/60"
          />
        </div>

        {/* 优先级选择 */}
        <Select
          value={quickPriority}
          onValueChange={(val) => setQuickPriority((val as Priority) ?? "MEDIUM")}
        >
          <SelectTrigger className="h-8 w-20 text-xs bg-slate-100/60 dark:bg-slate-900/60 border-0 shrink-0">
            <SelectValue>
              <span className="flex items-center gap-1.5">
                <span className={`inline-block size-2 rounded-full ${PRIORITY_CONFIG[quickPriority].dotClass}`} />
                <span>{PRIORITY_CONFIG[quickPriority].label}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(["HIGH", "MEDIUM", "LOW"] as Priority[]).map((p) => (
              <SelectItem key={p} value={p}>
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block size-2 rounded-full ${PRIORITY_CONFIG[p].dotClass}`} />
                  <span>{PRIORITY_CONFIG[p].label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 截止日期选择 */}
        <div className="shrink-0">
          <DatePicker
            value={quickDueDate}
            onChange={(dateStr) => setQuickDueDate(dateStr ?? "")}
            className="h-8 text-xs bg-slate-100/60 dark:bg-slate-900/60 border-0"
          />
        </div>

        {/* 分类选择（纯文本显示，不带文件夹图标，且显示中文名称） */}
        <Select
          value={selectedCatId || "NONE"}
          onValueChange={(val) => setSelectedCatId(val === "NONE" ? "" : val ?? "")}
        >
          <SelectTrigger className="h-8 w-24 text-xs bg-slate-100/60 dark:bg-slate-900/60 border-0 shrink-0">
            <SelectValue>
              {selectedCatName}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">无分类</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 创建提交按钮 */}
        <Button
          type="submit"
          size="sm"
          disabled={!quickTitle.trim() || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 h-8 text-xs cursor-pointer shadow-sm shadow-blue-500/20 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>创建任务</span>
        </Button>
      </form>
    </div>
  );
}
