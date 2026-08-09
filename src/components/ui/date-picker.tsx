"use client"

import * as React from "react"
import { format, parse, addDays, startOfWeek, isValid } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  id?: string
  value: string // yyyy-MM-dd HH:mm or yyyy-MM-dd format
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function DatePicker({
  id,
  value,
  onChange,
  placeholder = "选择截止时间",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // 解析当前时间与日期
  const { selectedDate, timeStr } = React.useMemo(() => {
    if (!value) return { selectedDate: undefined, timeStr: "23:59" }

    let dateObj: Date | undefined
    let time = "23:59"

    try {
      if (value.includes("T") || value.includes(" ")) {
        const parsed = new Date(value.replace(" ", "T"))
        if (isValid(parsed)) {
          dateObj = parsed
          const hours = String(parsed.getHours()).padStart(2, "0")
          const minutes = String(parsed.getMinutes()).padStart(2, "0")
          time = `${hours}:${minutes}`
        }
      } else {
        const parsed = parse(value, "yyyy-MM-dd", new Date())
        if (isValid(parsed)) {
          dateObj = parsed
        }
      }
    } catch {
      dateObj = undefined
    }

    return { selectedDate: dateObj, timeStr: time }
  }, [value])

  const emitValue = (date: Date | undefined, time: string) => {
    if (!date) {
      onChange("")
      return
    }
    const [h, m] = time.split(":").map(Number)
    const newDate = new Date(date)
    newDate.setHours(isNaN(h) ? 23 : h, isNaN(m) ? 59 : m, 0, 0)
    onChange(format(newDate, "yyyy-MM-dd HH:mm"))
  }

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      emitValue(date, timeStr || "23:59")
    } else {
      onChange("")
    }
  }

  const handleTimeChange = (newTime: string) => {
    const targetDate = selectedDate || new Date()
    emitValue(targetDate, newTime || "23:59")
  }

  const setPresetDate = (d: Date) => {
    emitValue(d, "23:59")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-3.5 text-muted-foreground mr-1" />
        {selectedDate ? (
          <span>{format(selectedDate, "M月d日 HH:mm", { locale: zhCN })}</span>
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
            今天 23:59
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="flex-1 text-[11px] h-7"
            onClick={() => setPresetDate(addDays(new Date(), 1))}
          >
            明天 23:59
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

        {/* 日历组件 */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          locale={zhCN}
        />

        {/* 精确到分钟的时间选择框 */}
        <div className="p-2 border-t flex items-center justify-between gap-2 text-xs bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>具体时间</span>
          </div>
          <input
            type="time"
            value={timeStr}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="h-7 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 cursor-pointer"
          />
        </div>

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
              清除截止时间
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
