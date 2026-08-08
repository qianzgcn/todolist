"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, children, className }) => {
  return (
    <div className={cn("relative w-full", className)}>
      <select
        value={value}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        className="flex h-8 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
};

const SelectTrigger: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children }) => (
  <>{children}</>
);

const SelectValue: React.FC<{ placeholder?: string }> = () => null;

const SelectContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    {children}
  </option>
);

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
