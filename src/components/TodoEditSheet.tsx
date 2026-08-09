"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { CategoryItem, Priority, TodoItem } from "@/types/todo";
import { PRIORITY_CONFIG } from "@/lib/priority-config";
import { createCategory, updateTodo } from "@/app/actions/todoActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";

interface TodoEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  todo: TodoItem;
  categories: CategoryItem[];
  onUpdated: (todo: TodoItem) => void;
  onCategoryCreated: (category: CategoryItem) => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatDueDateForInput(dueDateStr: string | null | undefined): string {
  if (!dueDateStr) return "";
  try {
    const d = new Date(dueDateStr);
    if (Number.isNaN(d.getTime())) return "";
    return format(d, "yyyy-MM-dd HH:mm");
  } catch {
    return "";
  }
}

export function TodoEditSheet({
  isOpen,
  onClose,
  todo,
  categories,
  onUpdated,
  onCategoryCreated,
}: TodoEditSheetProps) {
  const [title, setTitle] = useState(todo.title);
  const [priority, setPriority] = useState(todo.priority);
  const [dueDate, setDueDate] = useState(formatDueDateForInput(todo.dueDate));
  const [categoryId, setCategoryId] = useState(todo.categoryId ?? "NONE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");
      const updated = await updateTodo(todo.id, {
        title,
        priority,
        dueDate: dueDate || null,
        categoryId: categoryId === "NONE" ? null : categoryId,
      });
      onUpdated(updated);
      onClose();
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "更新任务失败"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;

    try {
      setErrorMsg("");
      const category = await createCategory(newCatName);
      onCategoryCreated(category);
      setCategoryId(category.id);
      setNewCatName("");
      setIsAddingCategory(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "创建分类失败"));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold">编辑任务详情</SheetTitle>
        </SheetHeader>

        {errorMsg && (
          <div
            role="alert"
            className="mx-4 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
          >
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col justify-between space-y-5 p-4 pt-2"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="todo-title" className="mb-1.5 text-xs">
                任务名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="todo-title"
                placeholder="任务名称..."
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                autoFocus
              />
            </div>

            <div>
              <Label id="todo-priority-label" className="mb-1.5 text-xs">
                优先级
              </Label>
              <div
                role="group"
                aria-labelledby="todo-priority-label"
                className="grid grid-cols-3 gap-2"
              >
                {(["HIGH", "MEDIUM", "LOW"] as Priority[]).map((value) => {
                  const selected = priority === value;
                  const config = PRIORITY_CONFIG[value];

                  return (
                    <Button
                      type="button"
                      key={value}
                      variant="outline"
                      aria-pressed={selected}
                      onClick={() => setPriority(value)}
                      className={selected ? config.editSelectedClass : ""}
                    >
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="todo-due-date" className="mb-1.5 text-xs">
                  截止日期
                </Label>
                <DatePicker
                  id="todo-due-date"
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="选择截止日期"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label htmlFor="todo-category" className="text-xs">
                    所属分类
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={() => setIsAddingCategory((current) => !current)}
                    className="h-auto p-0 text-[11px]"
                  >
                    {isAddingCategory ? "取消" : "+ 新建"}
                  </Button>
                </div>

                {isAddingCategory ? (
                  <div className="flex gap-1">
                    <Label htmlFor="new-edit-category" className="sr-only">
                      新分类名称
                    </Label>
                    <Input
                      id="new-edit-category"
                      placeholder="分类名"
                      value={newCatName}
                      onChange={(event) => setNewCatName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleCreateCategory();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      type="button"
                      aria-label="创建分类"
                      className="h-8 w-8 shrink-0"
                      onClick={() => void handleCreateCategory()}
                    >
                      <Check />
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={categoryId}
                    onValueChange={(value) => setCategoryId(value ?? "NONE")}
                  >
                    <SelectTrigger id="todo-category" className="w-full">
                      <SelectValue>
                        {categories.find((item) => item.id === categoryId)
                          ?.name || "未分类"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">未分类</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row justify-end gap-2 px-0 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "保存中..." : "确定"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
