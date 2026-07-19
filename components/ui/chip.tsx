"use client";

import { Chip as HeroChip, type ChipProps as HeroChipProps } from "@heroui/react";

type LegacyImportance = "high" | "normal" | "low";

export type ChipProps = Omit<HeroChipProps, "color" | "variant"> & {
  color?: HeroChipProps["color"];
  variant?: HeroChipProps["variant"] | LegacyImportance;
};

/** Shared HeroUI Chip with the checklist importance aliases kept for existing data. */
function ChipRoot({ variant = "secondary", color, ...props }: ChipProps) {
  const legacyColors: Record<LegacyImportance, NonNullable<HeroChipProps["color"]>> = {
    high: "danger",
    normal: "warning",
    low: "success",
  };
  const isLegacyVariant = variant === "high" || variant === "normal" || variant === "low";

  return (
    <HeroChip
      color={color ?? (isLegacyVariant ? legacyColors[variant] : "default")}
      variant={isLegacyVariant ? "primary" : variant}
      {...props}
    />
  );
}

export const Chip = Object.assign(ChipRoot, {
  Label: HeroChip.Label,
});

export { HeroChip };
