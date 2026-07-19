"use client";

import * as React from "react";
import { MoreHorizontal, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface MinimalCardExpandItem {
  id: string;
  title: string;
  value: string;
  icon?: React.ReactNode;
  colorClassName: string;
  content?: React.ReactNode;
}

interface MinimalCardExpandProps {
  items: MinimalCardExpandItem[];
  className?: string;
  initialExpandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
}

/**
 * Skiper23-inspired expandable card stack.
 *
 * The menu button is the only expansion trigger, while a pointer outside the
 * component collapses the active card. Consumers provide the card body so the
 * interaction can be reused for wallets, checklists, stats, and dashboards.
 */
export function MinimalCardExpand({
  items,
  className,
  initialExpandedId = null,
  onExpandedChange,
}: MinimalCardExpandProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(initialExpandedId);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const setExpanded = React.useCallback((id: string | null) => {
    setExpandedId(id);
    onExpandedChange?.(id);
  }, [onExpandedChange]);

  React.useEffect(() => {
    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (expandedId && rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setExpanded(null);
      }
    };
    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [expandedId]);

  return (
    <div
      ref={rootRef}
      className={`grid w-full max-w-[360px] grid-cols-2 gap-4 font-sans ${className ?? ""}`}
    >
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        const hasExpandedCard = expandedId !== null;

        return (
          <motion.article
            key={item.id}
            layout
            initial={false}
            animate={{ opacity: hasExpandedCard && !isExpanded ? 0.86 : 1 }}
            transition={{
              layout: { duration: prefersReducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: prefersReducedMotion ? 0 : 0.2 },
            }}
            className={`relative flex min-h-[125px] cursor-default flex-col justify-between overflow-hidden rounded-[24px] p-3 text-white ${item.colorClassName} ${isExpanded ? "col-span-2" : ""}`}
          >
            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex items-center justify-center text-white">{item.icon}</div>
              <button
                type="button"
                aria-label={`${item.title} ${isExpanded ? "접기" : "펼치기"}`}
                aria-expanded={isExpanded}
                onClick={() => setExpanded(isExpanded ? null : item.id)}
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 p-0.5 text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <motion.span
                  animate={{ rotate: isExpanded ? 45 : 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                >
                  {isExpanded ? <X size={16} aria-hidden="true" /> : <MoreHorizontal size={16} aria-hidden="true" />}
                </motion.span>
              </button>
            </div>

            <div className="min-w-0">
              <motion.h3 layout="position" className="truncate text-base font-semibold">{item.title}</motion.h3>
              <motion.p layout="position" className="text-sm font-semibold text-white/55">{item.value}</motion.p>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded && item.content && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, height: 0, y: prefersReducedMotion ? 0 : 8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: prefersReducedMotion ? 0 : 8 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-4 overflow-hidden"
                >
                  {item.content}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        );
      })}
    </div>
  );
}
