"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

const buttonClassNames =
  "relative flex size-(--cell-size) text-sm items-center justify-center rounded-lg text-foreground not-in-data-selected:hover:bg-black/5 dark:not-in-data-selected:hover:bg-white/5 disabled:pointer-events-none disabled:opacity-40 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4 transition-colors duration-150";

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
        "p-1 w-full flex justify-center overflow-hidden",
        "[--cell-size:36px] sm:[--cell-size:34px]",
        className
      )}
      classNames={{
        months: "flex flex-col gap-y-3 justify-center",
        month: "flex flex-col gap-y-3 items-center",
        month_caption: "relative flex items-center justify-center p-0.5 w-full gap-2",
        caption_label:
          "text-xs font-bold text-gray-900 dark:text-white hidden",
        nav: "absolute inset-x-0 flex items-center justify-between",
        dropdowns: "flex items-center gap-1.5 z-20",
        dropdown: "flex items-center bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/8 rounded-lg px-2 py-1 text-[11px] font-bold text-gray-800 dark:text-white cursor-pointer hover:bg-black/[0.07] dark:hover:bg-white/[0.1] transition-colors duration-150",
        dropdown_month: "shrink-0",
        dropdown_year: "shrink-0",
        button_previous: cn(
          buttonClassNames,
          "z-10 bg-transparent text-gray-400 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
        ),
        button_next: cn(
          buttonClassNames,
          "z-10 bg-transparent text-gray-400 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
        ),
        month_grid: "mx-auto border-collapse",
        weekdays: "flex justify-center",
        weekday:
          "flex size-(--cell-size) items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/25",
        week: "flex mt-0.5 justify-center",
        day: cn(
          buttonClassNames,
          "font-medium text-gray-700 dark:text-white/80",
          "data-today:font-bold data-today:text-[#0d3542] dark:data-today:text-white",
          "data-today:after:absolute data-today:after:bottom-1 data-today:after:size-0.5 data-today:after:rounded-full data-today:after:bg-[#0d3542] dark:data-today:after:bg-white",
          "data-selected:bg-[#0d3542] data-selected:text-white dark:data-selected:bg-white dark:data-selected:text-black data-selected:font-bold data-selected:shadow-sm",
          "data-disabled:opacity-25",
          "data-outside:text-gray-300 dark:data-outside:text-white/10 data-outside:opacity-40"
        ),
        day_button: "size-full border-0 bg-transparent p-0 cursor-pointer",
        range_start: "data-selected:rounded-l-lg",
        range_end: "data-selected:rounded-r-lg",
        range_middle: "data-selected:bg-[#0d3542]/10 dark:data-selected:bg-white/10 data-selected:text-inherit",
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
