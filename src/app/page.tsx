"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { RightTopPanel } from "@/components/RightTopPanel";
import { TodoList } from "@/components/TodoList";
import { TodoEditSheet } from "@/components/TodoEditSheet";
import { TodoItem, CategoryItem, StatusFilter, SortOrder } from "@/types/todo";
import {
  getTodos,
  getCategories,
  toggleTodo,
  deleteTodo,
} from "@/app/actions/todoActions";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 筛选与排序状态：默认 sortOrder 为 "asc" (最早创建在最前面/顺序)
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // 右侧边栏编辑抽屉状态
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  // 检测暗黑模式偏好
  useEffect(() => {
    const isDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // 获取全量数据
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [todoList, catList] = await Promise.all([
        getTodos(),
        getCategories(),
      ]);
      setTodos(todoList as unknown as TodoItem[]);
      setCategories(catList as unknown as CategoryItem[]);
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 核心排序与过滤逻辑：
  // 1. 根据状态、分类、搜索条件过滤
  // 2. 已完成的任务始终排在未完成任务的后面 (Completed tasks always at bottom)
  // 3. 默认按照创建时间 (createdAt) 排序（"asc" 最早在前，"desc" 最新在前）
  const filteredTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        // 状态过滤
        if (status === "ACTIVE" && todo.completed) return false;
        if (status === "COMPLETED" && !todo.completed) return false;

        // 分类过滤
        if (categoryId !== "ALL" && todo.categoryId !== categoryId) return false;

        // 搜索关键字过滤
        if (search.trim() !== "") {
          const q = search.trim().toLowerCase();
          if (!todo.title.toLowerCase().includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // 规则 1：已完成的任务始终沉底排在后面
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        // 规则 2：根据创建时间顺序 (asc 最早在前) 或逆序 (desc 最新在前) 排序
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();

        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });
  }, [todos, status, categoryId, search, sortOrder]);

  // 交互处理
  const handleToggle = async (id: string, currentCompleted: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentCompleted } : t))
    );
    try {
      await toggleTodo(id, currentCompleted);
      fetchData();
    } catch (err) {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTodo(id);
      fetchData();
    } catch (err) {
      fetchData();
    }
  };

  const handleOpenEditSheet = (todo: TodoItem) => {
    setEditingTodo(todo);
    setIsEditSheetOpen(true);
  };

  const hasFilter = status !== "ALL" || categoryId !== "ALL" || search.trim() !== "";

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* 左侧栏 */}
      <Sidebar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={categories}
        todos={todos}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onRefresh={fetchData}
      />

      {/* 右侧主工作区 */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
        {/* 顶部：与分类绑定的统计指标与极速创建任务条 */}
        <RightTopPanel
          categoryId={categoryId}
          categories={categories}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          todos={todos}
          onRefresh={fetchData}
        />

        {/* 任务列表（支持双击卡片或点击编辑按钮弹框编辑） */}
        <TodoList
          todos={filteredTodos}
          isLoading={isLoading}
          hasFilter={hasFilter}
          onToggle={handleToggle}
          onEdit={handleOpenEditSheet}
          onDelete={handleDelete}
        />
      </main>

      {/* 右侧编辑抽屉 */}
      <TodoEditSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        todo={editingTodo}
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
}
