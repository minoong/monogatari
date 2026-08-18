"use client";

import { useEffect, useRef, type RefObject } from "react";
import { scrollDrawerElementIntoView } from "@/components/ui/drawer-form";
import { restoreDrawerFormFieldNav, syncDrawerFormFieldNav, isDrawerTextField } from "@/lib/drawer-form-field-nav";

const RESYNC_DELAYS_MS = [0, 120, 320] as const;

export function useDrawerFieldBehaviors(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  const syncFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const scheduleSync = () => {
      if (syncFrameRef.current !== null) {
        window.cancelAnimationFrame(syncFrameRef.current);
      }
      syncFrameRef.current = window.requestAnimationFrame(() => {
        syncFrameRef.current = null;
        syncDrawerFormFieldNav(container);
      });
    };

    const timeouts = RESYNC_DELAYS_MS.map((delay) => window.setTimeout(scheduleSync, delay));
    scheduleSync();

    const observer = new MutationObserver(scheduleSync);
    observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "disabled", "aria-hidden"] });

    const handleFocusIn = (event: FocusEvent) => {
      if (!isDrawerTextField(event.target)) return;
      scrollDrawerElementIntoView(event.target as HTMLElement);
    };

    container.addEventListener("focusin", handleFocusIn);

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      if (syncFrameRef.current !== null) {
        window.cancelAnimationFrame(syncFrameRef.current);
      }
      observer.disconnect();
      container.removeEventListener("focusin", handleFocusIn);
      restoreDrawerFormFieldNav(container);
    };
  }, [active, containerRef]);
}
