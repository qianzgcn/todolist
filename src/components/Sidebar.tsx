"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CheckSquare,
  Folder,
  Sun,
  FolderPlus,
  Check,
  Search,
  X,
  Users,
  LogOut,
} from "lucide-react";
import type {
  CategoryItem,
  TodoItem,
} from "@/types/todo";
import type { UserSession } from "@/lib/auth";
import { createCategory } from "@/app/actions/todoActions";
import { logoutAction } from "@/app/actions/authActions";
import { isDueDateToday } from "@/lib/todo-validation";
import { AdminUserSheet } from "@/components/AdminUserSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  user?: UserSession | null;
  search: string;
  setSearch: (search: string) => void;
  categoryId: string;
  setCategoryId: (id: string) => void;
  categories: CategoryItem[];
  todos: TodoItem[];
  onCategoryCreated: (category: CategoryItem) => void;
}

export function Sidebar({
  user,
  search,
  setSearch,
  categoryId,
  setCategoryId,
  categories,
  todos,
  onCategoryCreated,
}: SidebarProps) {
  const router = useRouter();
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isAdminSheetOpen, setIsAdminSheetOpen] = useState(false);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const created = await createCategory(newCatName);
      onCategoryCreated(created);
      setCategoryId(created.id);
      setNewCatName("");
      setIsAddingCat(false);
    } catch (error) {
      console.error("创建分类失败:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("退出失败:", err);
    }
  };

  const myDayCount = todos.filter((t) => isDueDateToday(t.dueDate)).length;
  const totalCount = todos.length;

  return (
    <>
      <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        {/* 头部 */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-base">
              todoList
            </span>
          </div>

          {/* 侧边栏搜索框 */}
          <div className="relative w-full">
            <Label htmlFor="todo-search" className="sr-only">
              搜索任务
            </Label>
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <Input
              id="todo-search"
              type="text"
              placeholder="搜索任务..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-7 text-xs h-8 bg-white dark:bg-slate-950"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearch("")}
                aria-label="清除搜索"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* 📌 左侧平铺列表（我的一天排第一，自定义分类居中，全部分类置底） */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* 1. 我的一天（特殊动态视图，图标独立标识） */}
          <Button
            variant="ghost"
            onClick={() => setCategoryId("MY_DAY")}
            className={`w-full justify-start px-2.5 py-2 h-auto text-xs transition-colors cursor-pointer rounded-xl ${
              categoryId === "MY_DAY"
                ? "bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 font-semibold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-2 flex-1">
              <Sun className="w-4 h-4 text-amber-500 fill-amber-400/30 shrink-0" />
              <span>我的一天</span>
            </span>
            <span className="text-[11px] text-amber-700/80 dark:text-amber-400 font-medium">
              {myDayCount}
            </span>
          </Button>

          {/* 分类新建按钮与分类表单 */}
          <div className="pt-3 pb-1">
            <div className="flex items-center justify-between px-2 mb-1">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                分类列表
              </p>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsAddingCat(!isAddingCat)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer h-6 w-6"
                title="新建分类"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {isAddingCat && (
              <div className="flex items-center gap-1 px-2 py-1 mb-1">
                <Label htmlFor="new-sidebar-category" className="sr-only">
                  分类名称
                </Label>
                <Input
                  id="new-sidebar-category"
                  type="text"
                  placeholder="分类名称..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  autoFocus
                />
                <Button
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={handleAddCategory}
                  aria-label="创建分类"
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {/* 2. 用户自定义分类列表 */}
            {categories.map((cat) => (
              <Button
                variant="ghost"
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`w-full justify-start px-2.5 py-1.5 h-auto text-xs transition-colors cursor-pointer rounded-lg ${
                  categoryId === cat.id
                    ? "bg-slate-200/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <span className="flex items-center gap-2 flex-1 truncate">
                  <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {todos.filter((t) => t.categoryId === cat.id).length}
                </span>
              </Button>
            ))}

            {/* 3. 全部分类（置于最后） */}
            <Button
              variant="ghost"
              onClick={() => setCategoryId("ALL")}
              className={`w-full justify-start px-2.5 py-1.5 h-auto text-xs transition-colors cursor-pointer rounded-lg mt-1 ${
                categoryId === "ALL"
                  ? "bg-slate-200/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <span className="flex items-center gap-2 flex-1">
                <Folder className="w-4 h-4 text-slate-400" />
                <span>全部分类</span>
              </span>
              <span className="text-[11px] text-slate-400">{totalCount}</span>
            </Button>
          </div>
        </div>

        {/* 底部用户与功能卡片 */}
        <div className="border-t border-slate-200/80 p-3 space-y-2 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          {user && (
            <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user.username}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[9px] px-1 py-0 border-0 ${
                    user.role === "ADMIN"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {user.role === "ADMIN" ? "管理员" : "普通用户"}
                </Badge>
              </div>

              <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-900">
                {user.role === "ADMIN" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdminSheetOpen(true)}
                    className="flex-1 h-7 text-[11px] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer justify-start px-2 gap-1"
                  >
                    <Users className="size-3.5" />
                    <span>用户管理</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-7 text-[11px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer justify-start px-2 gap-1 ml-auto"
                >
                  <LogOut className="size-3.5" />
                  <span>退出</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 管理员用户管理抽屉 */}
      <AdminUserSheet
        open={isAdminSheetOpen}
        onOpenChange={setIsAdminSheetOpen}
      />
    </>
  );
}
