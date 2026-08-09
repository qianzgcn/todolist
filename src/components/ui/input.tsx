import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, autoComplete = "off", ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      autoComplete={autoComplete}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-xl border-none bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
