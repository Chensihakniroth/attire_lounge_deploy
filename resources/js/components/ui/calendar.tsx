"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

const buttonClassNames =
  "relative flex size-(--cell-size) text-base sm:text-sm items-center justify-center rounded-lg text-foreground not-in-data-selected:hover:bg-accent disabled:pointer-events-none disabled:opacity-64 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-2",
        "[--cell-size:52px] sm:[--cell-size:36px]",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row gap-y-6 sm:gap-x-6 sm:gap-y-0",
        month: "flex flex-col gap-y-6",
        month_caption: "relative flex items-center justify-center h-9",
        caption_label:
          "text-base sm:text-sm font-black uppercase tracking-widest text-[#0d3542] dark:text-[#f5a81c]",
        nav: "absolute inset-x-0 flex items-center justify-between",
        button_previous: cn(
          buttonClassNames,
          "z-10 bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        ),
        button_next: cn(
          buttonClassNames,
          "z-10 bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "flex size-(--cell-size) items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20",
        week: "flex w-full mt-2",
        day: cn(
          buttonClassNames,
          "data-today:after:absolute data-today:after:bottom-1.5 data-today:after:size-1 data-today:after:rounded-full data-today:after:bg-current",
          "data-selected:bg-[#0d3542] data-selected:text-white dark:data-selected:bg-[#f5a81c] dark:data-selected:text-black",
          "data-disabled:opacity-30",
          "data-outside:text-gray-300 dark:data-outside:text-white/10"
        ),
        day_button: "size-full border-0 bg-transparent p-0",
        range_start: "data-selected:rounded-l-lg",
        range_end: "data-selected:rounded-r-lg",
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
