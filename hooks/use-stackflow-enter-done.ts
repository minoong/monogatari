"use client";

import { useEffect, useState, type RefObject } from "react";

/** Stackflow 액티비티 진입 전환이 끝났는지 감지한다. */
export function useStackflowEnterDone(anchorRef: RefObject<HTMLElement | null>) {
  const [enterDone, setEnterDone] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return undefined;

    const screen = anchor.closest<HTMLElement>("[data-stackflow-component-name='AppScreen']");
    if (!screen) {
      setEnterDone(true);
      return undefined;
    }

    const sync = () => {
      const state = screen.getAttribute("data-stackflow-activity-transition-state");
      setEnterDone(!state || state === "enter-done");
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(screen, {
      attributes: true,
      attributeFilter: ["data-stackflow-activity-transition-state"],
    });

    return () => observer.disconnect();
  }, [anchorRef]);

  return enterDone;
}
