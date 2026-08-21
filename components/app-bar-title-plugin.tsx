"use client";

import type { ReactNode } from "react";

import { AppBarTitleAnimator } from "@/components/AppBarTitleAnimator";

export function appBarTitlePlugin() {
  return () => ({
    key: "app-bar-title",
    wrapStack({ stack }: { stack: { render: () => ReactNode } }) {
      return (
        <>
          {stack.render()}
          <AppBarTitleAnimator />
        </>
      );
    },
  });
}
