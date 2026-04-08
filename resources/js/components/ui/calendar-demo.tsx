"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-[#fdfdfc] dark:bg-[#0d1117] rounded-3xl border border-[#0d3542]/10 dark:border-[#f5a81c]/10 shadow-lg w-fit mx-auto">
      <div className="flex flex-col items-center gap-1 mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#0d3542] dark:text-[#f5a81c]">Date Selection</h3>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-xl border shadow"
      />
      {date && (
        <div className="mt-4 px-6 py-2 bg-[#0d3542]/5 dark:bg-[#f5a81c]/5 rounded-full border border-[#0d3542]/10 dark:border-[#f5a81c]/10">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#f5a81c]">
            Selected: {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  )
}
