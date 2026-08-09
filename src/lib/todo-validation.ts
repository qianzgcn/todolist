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
  if (typeof value !== "string") {
    throw new Error("截止时间格式无效");
  }

  const str = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(str)) {
    throw new Error("截止时间格式无效");
  }

  // 本地时区解析（不加 'Z'，避免 UTC 时区偏移导致的 +8 小时误变为次日 07:59）
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(str)) {
    const formatted = str.replace(" ", "T") + ":00";
    const date = new Date(formatted);
    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== Number(str.slice(0, 4)) ||
      date.getMonth() + 1 !== Number(str.slice(5, 7)) ||
      date.getDate() !== Number(str.slice(8, 10))
    ) {
      throw new Error("截止时间无效");
    }
    return date;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const date = new Date(`${str}T23:59:00`);
    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== Number(str.slice(0, 4)) ||
      date.getMonth() + 1 !== Number(str.slice(5, 7)) ||
      date.getDate() !== Number(str.slice(8, 10))
    ) {
      throw new Error("截止时间无效");
    }
    return date;
  }

  const date = new Date(str);
  if (Number.isNaN(date.getTime())) {
    throw new Error("截止时间无效");
  }
  return date;
}

export function readBoolean(value: unknown) {
  if (typeof value !== "boolean") throw new Error("完成状态无效");
  return value;
}

export function isDueDateToday(dueDate: string | Date | null | undefined): boolean {
  if (!dueDate) return false;
  try {
    const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}
