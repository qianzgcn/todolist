"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  // 获取全量数据（只在初始化或增删改重置时拉取）
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

  // 客户端高效过滤与排序，确保侧边栏与看板中的全局统计数字不受菜单切换影响
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
        if (sortBy === "dueDate") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === "priority") {
          const weight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (weight[b.priority] || 0) - (weight[a.priority] || 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [todos, status, categoryId, search, sortBy]);

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

  const handleOpenCreateModal = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (todo: TodoItem) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const hasFilter = status !== "ALL" || categoryId !== "ALL" || search.trim() !== "";

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* 左侧栏：传入全量 todos，保证菜单上固定的全局统计数字稳定不跳变 */}
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
        {/* 右侧【上部】：传入全量 todos，保证顶部 Dashboard 完成度与总数稳定 */}
        <RightTopPanel
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          todos={todos}
        />

        {/* 右侧【下部】：传入筛选后的 filteredTodos 渲染实际列表 */}
        <TodoList
          todos={filteredTodos}
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
