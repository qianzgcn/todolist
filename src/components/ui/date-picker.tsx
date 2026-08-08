"use client"

import * as React from "react"
import { format, parse, addDays, startOfWeek } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value: string // yyyy-MM-dd format
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function DatePicker({
  value,
  onChange,
  placeholder = "选择日期",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    try {
      return parse(value, "yyyy-MM-dd", new Date())
    } catch {
      return undefined
    }
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"))
    } else {
      onChange("")
    }
    setOpen(false)
  }

  const setPresetDate = (d: Date) => {
    onChange(format(d, "yyyy-MM-dd"))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 text-muted-foreground" />
        {selectedDate ? (
          format(selectedDate, "yyyy年M月d日", { locale: zhCN })
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* 快捷选项条 */}
        <div className="p-2 border-b flex items-center justify-between gap-1">
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="flex-1 text-[11px] h-7"
            onClick={() => setPresetDate(new Date())}
          >
            今天
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="flex-1 text-[11px] h-7"
            onClick={() => setPresetDate(addDays(new Date(), 1))}
          >
            明天
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="flex-1 text-[11px] h-7"
            onClick={() =>
              setPresetDate(
                addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7)
              )
            }
          >
            下周一
          </Button>
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          locale={zhCN}
        />

        {value && (
          <div className="border-t p-1.5">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              onClick={() => {
                onChange("")
                setOpen(false)
              }}
            >
              清除日期
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
