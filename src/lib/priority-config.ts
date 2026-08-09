import type { Priority } from "@/types/todo";

export interface PriorityDetail {
  label: string;
  dotClass: string;
  badgeClass: string;
  editSelectedClass: string;
}

export const PRIORITY_CONFIG: Record<Priority, PriorityDetail> = {
  HIGH: {
    label: "高",
    dotClass: "bg-amber-400 dark:bg-amber-500",
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-200/80 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/80 font-medium",
    editSelectedClass:
      "border-amber-400 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-300 font-medium",
  },
  MEDIUM: {
    label: "中",
    dotClass: "bg-blue-500 dark:bg-blue-400",
    badgeClass:
      "bg-blue-100 text-blue-700 border-blue-200/80 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80 font-medium",
    editSelectedClass:
      "border-blue-400 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-medium",
  },
  LOW: {
    label: "低",
    dotClass: "bg-slate-400 dark:bg-slate-500",
    badgeClass:
      "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 font-medium",
    editSelectedClass:
      "border-slate-400 bg-slate-200 text-slate-800 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 font-medium",
  },
};
