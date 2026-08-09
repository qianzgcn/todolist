import { PRIORITIES, type Priority } from "@/types/todo";

export function readRequiredText(
  value: unknown,
  label: string,
  maxLength: number,
) {
  if (typeof value !== "string") {
    throw new Error(`${label}格式不正确`);
  }

  const text = value.trim();
  if (!text) throw new Error(`${label}不能为空`);
  if (text.length > maxLength) {
    throw new Error(`${label}不能超过 ${maxLength} 个字符`);
  }
  return text;
}

export function readRequiredId(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.length > 100) {
    throw new Error("记录 ID 无效");
  }
  return value;
}

export function readNullableId(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return readRequiredId(value);
}

export function readPriority(
  value: unknown,
  fallback?: Priority,
): Priority | undefined {
  if (value === undefined) return fallback;
  if (
    typeof value !== "string" ||
    !PRIORITIES.includes(value as Priority)
  ) {
    throw new Error("优先级无效");
  }
  return value as Priority;
}

export function readDueDate(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("截止日期无效");
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error("截止日期无效");
  }
  return date;
}

export function readBoolean(value: unknown) {
  if (typeof value !== "boolean") throw new Error("完成状态无效");
  return value;
}
