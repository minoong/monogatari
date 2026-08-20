"use client";

import type { ReactNode } from "react";

import { BottomNavHost } from "@/components/BottomNavHost";

export function bottomNavPlugin() {
  return () => ({
    key: "bottom-nav",
    wrapStack({ stack }: { stack: { render: () => ReactNode } }) {
      return (
        <>
          {stack.render()}
          <BottomNavHost />
        </>
      );
    },
  });
}
