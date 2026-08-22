"use client";

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

export type MasonryLayoutItem = {
  id: string;
  height: number;
};

type GridItem<T extends MasonryLayoutItem> = T & {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type MasonryProps<T extends MasonryLayoutItem> = {
  items: T[];
  columns?: number;
  gap?: number;
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  onLayoutChange?: (height: number) => void;
  renderItem: (item: T) => React.ReactNode;
  active?: boolean;
};

function Masonry<T extends MasonryLayoutItem>({
  items,
  columns = 2,
  gap = 12,
  ease = "power3.out",
  duration = 0.5,
  stagger = 0.04,
  animateFrom = "center",
  scaleOnHover = false,
  hoverScale = 0.98,
  blurToFocus = true,
  onLayoutChange,
  renderItem,
  active = true,
}: MasonryProps<T>) {
  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const hasMounted = useRef(false);

  const { grid, containerHeight } = useMemo(() => {
    if (!width || columns < 1) return { grid: [] as GridItem<T>[], containerHeight: 0 };

    const colHeights = new Array(columns).fill(0);
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    const gridItems = items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const y = colHeights[col];
      const h = child.height;

      colHeights[col] += h + gap;
      return { ...child, x, y, w: columnWidth, h };
    });

    return {
      grid: gridItems,
      containerHeight: gridItems.length ? Math.max(...colHeights) - gap : 0,
    };
  }, [columns, gap, items, width]);

  const getInitialPosition = useCallback(
    (item: GridItem<T>, layoutHeight: number) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return { x: item.x, y: item.y };

      let direction = animateFrom;
      if (animateFrom === "random") {
        const dirs = ["top", "bottom", "left", "right"] as const;
        direction = dirs[Math.floor(Math.random() * dirs.length)];
      }

      switch (direction) {
        case "top":
          return { x: item.x, y: -120 };
        case "bottom":
          return { x: item.x, y: layoutHeight + 120 };
        case "left":
          return { x: -120, y: item.y };
        case "right":
          return { x: containerRect.width + 120, y: item.y };
        case "center":
          return {
            x: containerRect.width / 2 - item.w / 2,
            y: containerRect.height / 2 - item.h / 2,
          };
        default:
          return { x: item.x, y: item.y + 80 };
      }
    },
    [animateFrom, containerRef],
  );

  useLayoutEffect(() => {
    if (!active) return;
    onLayoutChange?.(containerHeight);
  }, [active, containerHeight, onLayoutChange]);

  useLayoutEffect(() => {
    if (!active || !width || !grid.length) return;

    grid.forEach((item, index) => {
      const selector = `[data-masonry-key="${item.id}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item, containerHeight);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: "blur(8px)" }),
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: "blur(0px)" }),
            duration: 0.65,
            ease: "power3.out",
            delay: index * stagger,
            force3D: false,
          },
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: "auto",
          force3D: false,
        });
      }
    });

    hasMounted.current = true;
  }, [active, grid, width, stagger, blurToFocus, duration, ease, containerHeight, getInitialPosition]);

  useLayoutEffect(() => {
    if (active) return;
    hasMounted.current = false;
  }, [active]);

  const handleMouseEnter = (id: string) => {
    if (!scaleOnHover) return;
    gsap.to(`[data-masonry-key="${id}"]`, {
      scale: hoverScale,
      duration: 0.25,
      ease: "power2.out",
      force3D: false,
    });
  };

  const handleMouseLeave = (id: string) => {
    if (!scaleOnHover) return;
    gsap.to(`[data-masonry-key="${id}"]`, {
      scale: 1,
      duration: 0.25,
      ease: "power2.out",
      force3D: false,
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: active && containerHeight > 0 ? containerHeight : undefined }}
    >
      {active
        ? grid.map((item) => (
        <div
          key={item.id}
          data-masonry-key={item.id}
          className="absolute left-0 top-0"
          style={{ willChange: "transform, width, height, opacity" }}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={() => handleMouseLeave(item.id)}
        >
          {renderItem(item)}
        </div>
      ))
        : null}
    </div>
  );
}

export default Masonry;
