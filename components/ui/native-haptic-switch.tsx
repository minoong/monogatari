"use client";

import type { ChangeEvent, MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

interface NativeHapticSwitchProps {
  ariaLabel: string;
  checked: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * iOS 18+ WebKit emits native haptics for a directly tapped checkbox switch.
 * Keep this input in the user's actual tap target; do not trigger it via JS.
 */
export function NativeHapticSwitch({
  ariaLabel,
  checked,
  className,
  disabled = false,
  id,
  onClick,
  onChange,
}: NativeHapticSwitchProps) {
  return (
    <input
      {...({ switch: "" } as Record<string, string>)}
      aria-label={ariaLabel}
      checked={checked}
      className={cn(
        "absolute inset-0 z-20 h-full w-full cursor-pointer opacity-[0.01]",
        "disabled:cursor-not-allowed",
        className,
      )}
      disabled={disabled}
      id={id}
      onClick={onClick}
      onChange={onChange}
      type="checkbox"
    />
  );
}
