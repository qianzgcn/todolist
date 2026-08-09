"use client";

import React, { useState } from "react";
import { ArrowDownUp, Plus, Tag, Flag } from "lucide-react";
import { format } from "date-fns";
import { SortOrder, TodoItem, CategoryItem, Priority } from "@/types/todo";
import { createTodo } from "@/app/actions/todoActions";
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
  sortOrder: SortOrder;
  setSortOrder: (sortOrder: SortOrder) => void;
  todos: TodoItem[];
  onTodoCreated: (todo: TodoItem) => void;
}

export function RightTopPanel({
  categoryId,
  categories,
  sortOrder,
  setSortOrder,
  todos,
  onTodoCreated,
}: RightTopPanelProps) {
  // 快速创建状态
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<Priority>("MEDIUM");
  const [quickDueDate, setQuickDueDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedCatId, setSelectedCatId] = useState(
    categoryId !== "ALL" ? categoryId : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const targetCatId =
        selectedCatId && selectedCatId !== "NONE" ? selectedCatId : null;

      const todo = await createTodo({
        title: quickTitle.trim(),
        priority: quickPriority,
        dueDate: quickDueDate || null,
        categoryId: targetCatId,
      });
      onTodoCreated(todo);

      setQuickTitle("");
      // 重置为默认：今天，默认中优先级，当前分类
      setQuickPriority("MEDIUM");
      setQuickDueDate(format(new Date(), "yyyy-MM-dd"));
    } catch (err) {
      console.error("快捷创建任务失败:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 统计信息与当前选中的分类强关联
  const statsTodos = React.useMemo(() => {
    if (!categoryId || categoryId === "ALL") return todos;
    return todos.filter((t) => t.categoryId === categoryId);
  }, [todos, categoryId]);

  const total = statsTodos.length;
  const completed = statsTodos.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const priorityLabelMap: Record<Priority, string> = {
    HIGH: "高",
    MEDIUM: "中",
    LOW: "低",
  };

  const priorityColorMap: Record<Priority, string> = {
    HIGH: "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800",
    MEDIUM: "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800",
    LOW: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700",
  };

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 flex-shrink-0">
      {/* 📊 1. 最上方：与分类强关联的统计指标与 1-Click 排序 */}
      <div className="flex items-center justify-between gap-4 text-xs pb-1">
        <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">完成度</span>
            <div className="w-20 sm:w-24">
              <Progress value={percent} aria-label="任务完成度" />
            </div>
            <span className="font-medium text-slate-600 dark:text-slate-400">{percent}%</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center gap-1.5 h-7 px-2 text-xs text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
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

      <Separator />

      {/* 🚀 2. 紧邻待办列表：高效率极速创建任务条 */}
      <form onSubmit={handleQuickCreate} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
        <div className="relative flex-1 flex items-center">
          <Label htmlFor="quick-todo-title" className="sr-only">
            任务名称
          </Label>
          <Input
            id="quick-todo-title"
            type="text"
            placeholder="添加任务..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="w-full pr-2 text-sm h-9 shadow-xs"
          />
        </div>

        {/* 快捷配置属性按钮组 */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {/* 日期快捷配置 */}
          <div className="w-36">
            <Label htmlFor="quick-todo-date" className="sr-only">
              截止日期
            </Label>
            <DatePicker
              id="quick-todo-date"
              value={quickDueDate}
              onChange={(val) => setQuickDueDate(val)}
              placeholder="今日完成"
              className="h-9 text-xs"
            />
          </div>

          {/* 优先级快捷切换（清晰显目的 3 色区分） */}
          <Select
            value={quickPriority}
            onValueChange={(val) => setQuickPriority((val as Priority) || "MEDIUM")}
          >
            <SelectTrigger
              aria-label="优先级"
              className={`w-20 h-9 px-2.5 text-xs font-medium ${priorityColorMap[quickPriority]}`}
            >
              <SelectValue>
                <span className="flex items-center gap-1">
                  <Flag className="w-3 h-3 flex-shrink-0" />
                  <span>{priorityLabelMap[quickPriority]}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="min-w-[80px] w-auto p-1">
              <SelectItem value="HIGH">
                <span className="text-amber-700 dark:text-amber-400 font-medium">高</span>
              </SelectItem>
              <SelectItem value="MEDIUM">
                <span className="text-blue-700 dark:text-blue-400 font-medium">中</span>
              </SelectItem>
              <SelectItem value="LOW">
                <span className="text-slate-600 dark:text-slate-400 font-medium">低</span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* 分类快捷选择 */}
          <Select
            value={selectedCatId || "NONE"}
            onValueChange={(val) => setSelectedCatId(val ?? "")}
          >
            <SelectTrigger aria-label="所属分类" className="w-28 h-9 text-xs">
              <SelectValue>
                <span className="flex items-center gap-1 truncate">
                  <Tag className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    {categories.find((c) => c.id === selectedCatId)?.name || "其他"}
                  </span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">其他 (未分类)</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 提交按钮 */}
          <Button type="submit" disabled={isSubmitting || !quickTitle.trim()} size="sm" className="h-9 px-3">
            <Plus className="w-4 h-4" />
            <span>添加</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
