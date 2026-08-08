"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { RightTopPanel } from "@/components/RightTopPanel";
import { TodoList } from "@/components/TodoList";
import { TodoInputModal } from "@/components/TodoInputModal";
import { TodoItem, CategoryItem, StatusFilter, SortBy } from "@/types/todo";
import {
  getTodos,
  getCategories,
  toggleTodo,
  deleteTodo,
  clearCompletedTodos,
} from "@/app/actions/todoActions";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 筛选与排序状态
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");

  // 模态框状态
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [todoList, catList] = await Promise.all([
        getTodos({ status, categoryId, search, sortBy }),
        getCategories(),
      ]);
      setTodos(todoList as unknown as TodoItem[]);
      setCategories(catList as unknown as CategoryItem[]);
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setIsLoading(false);
    }
  }, [status, categoryId, search, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleClearCompleted = async () => {
    if (confirm("确定要删除所有已完成的任务吗？")) {
      try {
        await clearCompletedTodos();
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (todo: TodoItem) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const hasFilter = status !== "ALL" || categoryId !== "ALL" || search.trim() !== "";

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* 左侧栏：导航、状态筛选与分类 */}
      <Sidebar
        status={status}
        setStatus={setStatus}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={categories}
        todos={todos}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCreateModal={handleOpenCreateModal}
        onRefresh={fetchData}
      />

      {/* 右侧栏：分为上下结构 */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
        {/* 右侧【上部】：看板统计、搜索与排序选项 */}
        <RightTopPanel
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          todos={todos}
          completedCount={completedCount}
          onClearCompleted={handleClearCompleted}
        />

        {/* 右侧【下部】：任务列表 */}
        <TodoList
          todos={todos}
          isLoading={isLoading}
          hasFilter={hasFilter}
          onToggle={handleToggle}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          onOpenCreate={handleOpenCreateModal}
        />
      </main>

      {/* 弹窗 */}
      <TodoInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTodo={editingTodo}
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
}
