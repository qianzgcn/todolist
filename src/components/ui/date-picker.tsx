"use client";

import * as React from "react";
import { format, addDays, nextMonday, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formattedLabel = React.useMemo(() => {
    if (!value) return "选择截止日期";
    try {
      const date = parseISO(value);
      return format(date, "yyyy年MM月dd日 (EEE)", { locale: zhCN });
    } catch {
      return value;
    }
  }, [value]);

  const handleSelectQuickDate = (date: Date) => {
    const formatted = format(date, "yyyy-MM-dd");
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal text-xs h-8 px-3 cursor-pointer",
              !value && "text-slate-400 dark:text-slate-500"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="flex-1 truncate">{formattedLabel}</span>
            {value && (
              <X
                className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              快速选择截止时间
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-[11px] h-7"
                onClick={() => handleSelectQuickDate(new Date())}
              >
                今天
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-[11px] h-7"
                onClick={() => handleSelectQuickDate(addDays(new Date(), 1))}
              >
                明天
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-[11px] h-7"
                onClick={() => handleSelectQuickDate(nextMonday(new Date()))}
              >
                下周一
              </Button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1">
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                自定义日期
              </label>
              <Input
                type="date"
                value={value || ""}
                onChange={(e) => {
                  onChange(e.target.value);
                  setIsOpen(false);
                }}
                className="h-8 text-xs cursor-pointer"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
