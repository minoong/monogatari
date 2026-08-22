"use client";

import type { ComponentType } from "react";
import { CartIcon } from "@/components/ui/cart";
import { CoffeeIcon } from "@/components/ui/coffee";
import { CupSodaIcon } from "@/components/ui/cup-soda";
import { MapPinIcon } from "@/components/ui/map-pin";
import { cn } from "@/lib/utils";
import type { WishType } from "@/lib/wishes";

type AnimatedIconProps = {
  size?: number;
  className?: string;
};

const WISH_TYPE_ICONS: Record<WishType, ComponentType<AnimatedIconProps>> = {
  shopping: CartIcon,
  restaurant: MapPinIcon,
  menu: CoffeeIcon,
  snack: CupSodaIcon,
};

type WishTypeIconProps = {
  type: WishType;
  size?: number;
  className?: string;
  iconClassName?: string;
  tone?: "dark" | "light";
};

export function WishTypeIcon({
  type,
  size = 18,
  className,
  iconClassName,
  tone = "dark",
}: WishTypeIconProps) {
  const Icon = WISH_TYPE_ICONS[type];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl",
        tone === "dark"
          ? "bg-white/15 text-white"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        className,
      )}
    >
      <Icon className={iconClassName} size={size} />
    </span>
  );
}
