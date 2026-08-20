"use client";

import type { ChangeEvent, MouseEventHandler, PointerEventHandler } from "react";
import { cn } from "@/lib/utils";

interface NativeHapticSwitchProps {
  ariaLabel: string;
  checked: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onPointerDown?: PointerEventHandler<HTMLInputElement>;
  onPointerUp?: PointerEventHandler<HTMLInputElement>;
  onPointerLeave?: PointerEventHandler<HTMLInputElement>;
  onPointerCancel?: PointerEventHandler<HTMLInputElement>;
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
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
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
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        const input = event.currentTarget;
        window.requestAnimationFrame(() => {
          if (input.hasPointerCapture(event.pointerId)) {
            input.releasePointerCapture(event.pointerId);
          }
        });
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
      }}
      style={{ touchAction: "pan-y" }}
      type="checkbox"
    />
  );
}
