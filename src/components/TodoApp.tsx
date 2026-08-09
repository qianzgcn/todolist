"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Sidebar } from "@/components/Sidebar";
import { RightTopPanel } from "@/components/RightTopPanel";
import { TodoList } from "@/components/TodoList";
import { TodoEditSheet } from "@/components/TodoEditSheet";
import type {
  CategoryItem,
  SortOrder,
  StatusFilter,
  TodoData,
  TodoItem,
} from "@/types/todo";
import type { UserSession } from "@/lib/auth";
import { deleteTodo, toggleTodo } from "@/app/actions/todoActions";

function subscribeToColorScheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getColorSchemeSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function TodoApp({
  user,
  initialData,
}: {
  user?: UserSession | null;
  initialData: TodoData;
}) {
  const prefersDark = useSyncExternalStore(
    subscribeToColorScheme,
    getColorSchemeSnapshot,
    () => false,
  );
  const [darkModeOverride, setDarkModeOverride] = useState<boolean | null>(null);
  const darkMode = darkModeOverride ?? prefersDark;

  const [todos, setTodos] = useState(initialData.todos);
  const [categories, setCategories] = useState(initialData.categories);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [categoryId, setCategoryId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const filteredTodos = useMemo(() => {
    const query = search.trim().toLowerCase();
    return todos
      .filter((todo) => {
        if (status === "ACTIVE" && todo.completed) return false;
        if (status === "COMPLETED" && !todo.completed) return false;
        if (categoryId !== "ALL" && todo.categoryId !== categoryId) return false;
        return !query || todo.title.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const difference =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? difference : -difference;
      });
  }, [todos, status, categoryId, search, sortOrder]);

  const replaceTodo = (todo: TodoItem) => {
    setTodos((current) =>
      current.map((item) => (item.id === todo.id ? todo : item)),
    );
  };

  const handleToggle = async (id: string, completed: boolean) => {
    const previous = todos.find((todo) => todo.id === id);
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed } : todo,
      ),
    );

    try {
      replaceTodo(await toggleTodo(id, completed));
    } catch {
      if (previous) replaceTodo(previous);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
    setTodos((current) => current.filter((todo) => todo.id !== id));
  };

  const handleTodoCreated = (todo: TodoItem) => {
    setTodos((current) => [...current, todo]);
  };

  const handleCategoryCreated = (category: CategoryItem) => {
    setCategories((current) =>
      [...current.filter((item) => item.id !== category.id), category].sort(
        (a, b) => a.name.localeCompare(b.name, "zh-CN"),
      ),
    );
  };

  const hasFilter =
    status !== "ALL" || categoryId !== "ALL" || search.trim() !== "";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        user={user}
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={categories}
        todos={todos}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkModeOverride(!darkMode)}
        onCategoryCreated={handleCategoryCreated}
      />

      <main className="flex h-full flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950">
        <RightTopPanel
          key={categoryId}
          categoryId={categoryId}
          categories={categories}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          todos={todos}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkModeOverride(!darkMode)}
          onTodoCreated={handleTodoCreated}
        />

        <TodoList
          todos={filteredTodos}
          hasFilter={hasFilter}
          onToggle={handleToggle}
          onEdit={setEditingTodo}
          onDelete={handleDelete}
        />
      </main>

      {editingTodo && (
        <TodoEditSheet
          key={editingTodo.id}
          isOpen
          onClose={() => setEditingTodo(null)}
          todo={editingTodo}
          categories={categories}
          onUpdated={replaceTodo}
          onCategoryCreated={handleCategoryCreated}
        />
      )}
    </div>
  );
}
