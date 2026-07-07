import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, onClick, ...props }: React.ComponentProps<"input">) {
  const isDateOrTime = type === "date" || type === "time";

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    onClick?.(e);

    if (!isDateOrTime || props.disabled || props.readOnly) {
      return;
    }

    const input = e.currentTarget;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        // showPicker may throw if not allowed in this context
      }
    }
  };

  return (
    <input
      type={type}
      data-slot="input"
      onClick={handleClick}
      className={cn(
        "flex h-7 w-full rounded border border-[#ced4da] bg-white px-3 py-1 text-sm text-gray-900 transition-colors",
        "placeholder:text-gray-400",
        "focus:outline-none focus:ring-1 focus:ring-[#ff9800] focus:border-[#ff9800]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        isDateOrTime &&
          "relative cursor-pointer pr-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
