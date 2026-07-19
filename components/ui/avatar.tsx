"use client";

import { Avatar as HeroAvatar } from "@heroui/react";
import type React from "react";

function AvatarRoot(props: React.ComponentProps<typeof HeroAvatar>) {
  return <HeroAvatar {...props} />;
}

export const Avatar = Object.assign(AvatarRoot, {
  Image: HeroAvatar.Image,
  Fallback: HeroAvatar.Fallback,
});

export function AvatarImage(
  props: React.ComponentProps<typeof HeroAvatar.Image>,
) {
  return <HeroAvatar.Image {...props} />;
}

export function AvatarFallback(
  props: React.ComponentProps<typeof HeroAvatar.Fallback>,
) {
  return <HeroAvatar.Fallback {...props} />;
}

export { HeroAvatar as AvatarPrimitive };
