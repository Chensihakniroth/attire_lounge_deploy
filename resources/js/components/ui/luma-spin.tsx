import React from "react";
import { cn } from "@/lib/utils";

interface LumaSpinProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const LumaSpin = ({ className, size = "md" }: LumaSpinProps) => {
  // Use explicit H/W to prevent 0-height collapses in certain browsers
  const sizeClasses = {
    sm: "w-[30px] h-[30px]",
    md: "w-[45px] h-[45px]",
    lg: "w-[65px] h-[65px]",
    xl: "w-[100px] h-[100px]",
  };

  return (
    <div className={cn("relative flex items-center justify-center shrink-0", sizeClasses[size], className)}>
      <span className="absolute rounded-[50px] animate-luma-spin shadow-[inset_0_0_0_2px] shadow-gray-800 dark:shadow-gray-100 block pointer-events-none" />
      <span className="absolute rounded-[50px] animate-luma-spin-delay shadow-[inset_0_0_0_2px] shadow-gray-800 dark:shadow-gray-100 block pointer-events-none" />
    </div>
  );
};
