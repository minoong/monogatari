"use client";

import { Avatar as HeroAvatar } from "@heroui/react";
import type React from "react";
import { cn } from "@/lib/utils";

function AvatarRoot(props: React.ComponentProps<typeof HeroAvatar>) {
  return <HeroAvatar {...props} />;
}

export function AvatarImage(
  props: React.ComponentProps<typeof HeroAvatar.Image>,
) {
  const { className, ...rest } = props;
  return <HeroAvatar.Image className={cn("size-full object-cover", className)} {...rest} />;
}

export function AvatarFallback(
  props: React.ComponentProps<typeof HeroAvatar.Fallback>,
) {
  return <HeroAvatar.Fallback {...props} />;
}

export const Avatar = Object.assign(AvatarRoot, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
});

export { HeroAvatar as AvatarPrimitive };
