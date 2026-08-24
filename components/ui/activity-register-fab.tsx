"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import ClickSpark from "@/components/ClickSpark";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const FAB_COMPACT_SCROLL_PX = 80;

export function useFabEnterAnimation(
  fabRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion || !enabled || !fabRef.current) return;
    gsap.from(fabRef.current, {
      scale: 0.4,
      autoAlpha: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
      clearProps: "opacity,visibility,transform",
    });
  }, { dependencies: [enabled, prefersReducedMotion] });

  return prefersReducedMotion;
}

function isScrollRelevant(target: HTMLElement, anchor: HTMLElement) {
  return target === anchor || anchor.contains(target) || target.contains(anchor);
}

function isScrollable(element: HTMLElement) {
  const { overflowY } = window.getComputedStyle(element);
  return (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay")
    && element.scrollHeight > element.clientHeight + 1;
}

function getScrollTop(element: HTMLElement) {
  return element === document.documentElement ? window.scrollY : element.scrollTop;
}

const PLACEMENT_CLASS = {
  "above-bottom-nav": "bottom-[calc(5rem+max(env(safe-area-inset-bottom,0px),12px))]",
  inset: "bottom-[calc(1.5rem+max(env(safe-area-inset-bottom,0px),12px))]",
} as const;

interface ActivityRegisterFabProps {
  ariaLabel: string;
  drawerOpen: boolean;
  onPress: () => void;
  placement?: keyof typeof PLACEMENT_CLASS;
  /** Stackflow 등 캡처 스크롤에서 이 요소를 포함한 스크롤만 반응한다. */
  scrollAnchorRef?: RefObject<HTMLElement | null>;
  /** 지정 시 해당 요소의 scroll 이벤트를 우선 사용한다. */
  scrollElementRef?: RefObject<HTMLElement | null>;
  /** 앵커 내부 스크롤 영역이 바뀔 때 리스너를 다시 붙인다. */
  scrollKey?: string | number;
  sparkColor?: string;
}

export function ActivityRegisterFab({
  ariaLabel,
  drawerOpen,
  onPress,
  placement = "inset",
  scrollAnchorRef,
  scrollElementRef,
  scrollKey,
  sparkColor = "#60a5fa",
}: ActivityRegisterFabProps) {
  const prefersReducedMotion = useReducedMotion();
  const fabRef = useRef<HTMLDivElement>(null);
  const [fabCompact, setFabCompact] = useState(false);
  useFabEnterAnimation(fabRef);

  useEffect(() => {
    let frame = 0;
    const cleanups: (() => void)[] = [];
    const bound = new Set<HTMLElement>();

    const updateCompact = (element: HTMLElement) => {
      setFabCompact(getScrollTop(element) > FAB_COMPACT_SCROLL_PX);
    };

    const handleScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateCompact(target === document.documentElement ? document.documentElement : target);
      });
    };

    const bind = (element: HTMLElement) => {
      if (bound.has(element)) return;
      bound.add(element);
      element.addEventListener("scroll", handleScroll, { passive: true });
      cleanups.push(() => element.removeEventListener("scroll", handleScroll));
      updateCompact(element);
    };

    const bindDescendantScrollables = (anchor: HTMLElement) => {
      const stack = [anchor];
      while (stack.length > 0) {
        const node = stack.pop()!;
        if (node !== anchor && isScrollable(node)) bind(node);
        node.childNodes.forEach((child) => {
          if (child instanceof HTMLElement) stack.push(child);
        });
      }
    };

    const attach = () => {
      if (scrollElementRef?.current) bind(scrollElementRef.current);
      if (scrollAnchorRef?.current) bindDescendantScrollables(scrollAnchorRef.current);
    };

    attach();

    const anchor = scrollAnchorRef?.current;
    const observer = anchor
      ? new MutationObserver(() => {
          attach();
        })
      : null;
    if (observer && anchor) {
      observer.observe(anchor, { childList: true, subtree: true });
    }

    const documentHandler = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (scrollAnchorRef?.current && !isScrollRelevant(target, scrollAnchorRef.current)) return;

      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateCompact(target === document.documentElement ? document.documentElement : target);
      });
    };

    document.addEventListener("scroll", documentHandler, { capture: true, passive: true });
    cleanups.push(() => document.removeEventListener("scroll", documentHandler, { capture: true }));

    return () => {
      observer?.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollAnchorRef, scrollElementRef, scrollKey]);

  return (
    <div
      ref={fabRef}
      className={cn("fixed right-5 z-40 h-14 min-w-14", PLACEMENT_CLASS[placement])}
    >
      <motion.div
        className="relative h-full w-full"
        animate={{ scale: fabCompact && !prefersReducedMotion ? 0.9 : 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <ClickSpark sparkColor={sparkColor} sparkCount={10} sparkRadius={22}>
          <Button
            aria-label={ariaLabel}
            className="h-full w-full rounded-full px-5 shadow-xl"
            onPress={onPress}
          >
            <Plus className="size-5" />
            <motion.span
              className="inline-block overflow-hidden whitespace-nowrap font-bold"
              animate={{
                maxWidth: fabCompact ? 0 : 44,
                opacity: fabCompact ? 0 : 1,
                marginLeft: fabCompact ? 0 : 2,
              }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              등록
            </motion.span>
          </Button>
          <NativeHapticSwitch ariaLabel={ariaLabel} checked={drawerOpen} onChange={onPress} />
        </ClickSpark>
      </motion.div>
    </div>
  );
}
