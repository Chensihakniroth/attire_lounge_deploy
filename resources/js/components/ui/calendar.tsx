"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

const buttonClassNames =
  "relative flex size-(--cell-size) text-base sm:text-sm items-center justify-center rounded-xl text-foreground not-in-data-selected:hover:bg-black/5 dark:not-in-data-selected:hover:bg-white/5 disabled:pointer-events-none disabled:opacity-64 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fromYear = new Date().getFullYear() - 100,
  toYear = new Date().getFullYear() + 100,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      captionLayout="dropdown"
      fromYear={fromYear}
      toYear={toYear}
      className={cn(
        "p-1.5 w-full",
        "[--cell-size:48px] sm:[--cell-size:32px]",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 sm:gap-y-0 justify-center",
        month: "flex flex-col gap-y-4 items-center",
        month_caption: "relative flex items-center justify-center p-1 w-full gap-2",
        caption_label:
          "text-[12px] font-black uppercase tracking-[0.2em] text-[#0d3542] dark:text-[#f5a81c] hidden",
        nav: "absolute inset-x-0 flex items-center justify-between",
        dropdowns: "flex items-center gap-1 z-20",
        dropdown: "flex items-center bg-black/5 dark:bg-white/5 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#f5a81c] cursor-pointer hover:bg-black/10 transition-colors",
        dropdown_month: "shrink-0",
        dropdown_year: "shrink-0",
        button_previous: cn(
          buttonClassNames,
          "z-10 bg-transparent text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
        ),
        button_next: cn(
          buttonClassNames,
          "z-10 bg-transparent text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
        ),
        month_grid: "mx-auto border-collapse",
        weekdays: "flex justify-center",
        weekday:
          "flex size-(--cell-size) items-center justify-center text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20",
        week: "flex mt-1.5 justify-center",
        day: cn(
          buttonClassNames,
          "data-today:after:absolute data-today:after:bottom-1.5 data-today:after:size-1 data-today:after:rounded-full data-today:after:bg-current",
          "data-selected:bg-[#0d3542] data-selected:text-white dark:data-selected:bg-[#f5a81c] dark:data-selected:text-black",
          "data-disabled:opacity-30",
          "data-outside:text-gray-300 dark:data-outside:text-white/10"
        ),
        day_button: "size-full border-0 bg-transparent p-0",
        range_start: "data-selected:rounded-l-xl",
        range_end: "data-selected:rounded-r-xl",
        range_middle: "data-selected:bg-[#0d3542]/10 dark:data-selected:bg-[#f5a81c]/10 data-selected:text-inherit",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeftIcon {...props} />;
          }
          return <ChevronRightIcon {...props} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
