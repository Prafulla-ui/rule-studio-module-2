import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded border border-[#ced4da] bg-white px-3 py-2 text-sm text-gray-900 transition-colors",
        "placeholder:text-gray-400",
        "focus:outline-none focus:ring-1 focus:ring-[#ff9800] focus:border-[#ff9800]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "resize-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };