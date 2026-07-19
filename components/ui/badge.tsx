"use client";

import {
  Badge as HeroBadge,
  type BadgeProps as HeroBadgeProps,
} from "@heroui/react";

type LegacyImportance = "high" | "normal" | "low";

export type BadgeProps = Omit<HeroBadgeProps, "color" | "variant"> & {
  color?: HeroBadgeProps["color"];
  variant?: HeroBadgeProps["variant"] | LegacyImportance;
};

/** Shared HeroUI badge with legacy importance aliases kept for existing screens. */
function BadgeRoot({ variant = "primary", color, ...props }: BadgeProps) {
  const legacyColors: Record<LegacyImportance, NonNullable<HeroBadgeProps["color"]>> = {
    high: "danger",
    normal: "accent",
    low: "success",
  };
  const isLegacyVariant = variant === "high" || variant === "normal" || variant === "low";

  return (
    <HeroBadge
      color={color ?? (isLegacyVariant ? legacyColors[variant] : "default")}
      variant={isLegacyVariant ? "soft" : variant}
      {...props}
    />
  );
}

export const Badge = Object.assign(BadgeRoot, {
  Anchor: HeroBadge.Anchor,
  Label: HeroBadge.Label,
});

export { HeroBadge };
