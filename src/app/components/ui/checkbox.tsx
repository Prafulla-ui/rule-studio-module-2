"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon, MinusIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer size-4 shrink-0 rounded border border-gray-300 bg-white shadow-sm transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#ff9800] focus-visible:ring-offset-2",
        "data-[state=checked]:bg-[#ff9800] data-[state=checked]:text-white data-[state=checked]:border-[#ff9800]",
        "data-[state=indeterminate]:bg-[#ff9800] data-[state=indeterminate]:text-white data-[state=indeterminate]:border-[#ff9800]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3.5 group-data-[state=indeterminate]:hidden" />
        <MinusIcon className="size-3.5 hidden group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };