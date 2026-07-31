"use client";

import {
  useState,
  useRef,
  useLayoutEffect,
  useId,
  useMemo,
  useCallback,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function GooeyFilter({
  filterId,
  blur,
}: {
  filterId: string;
  blur: number;
}) {
  return (
    <svg className="pointer-events-none absolute size-0 overflow-hidden opacity-0" aria-hidden="true">
      <defs>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({ layoutId }: { layoutId: string }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="size-4 shrink-0"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

const transition = {
  duration: 0.4,
  type: "spring" as const,
  bounce: 0.25,
};

const iconBubbleVariants = {
  collapsed: { scale: 0, opacity: 0 },
  expanded: { scale: 1, opacity: 1 },
};

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps {
  placeholder?: string;
  className?: string;
  classNames?: GooeyInputClassNames;
  /** Collapsed control width in px */
  collapsedWidth?: number;
  /** Expanded control width in px */
  expandedWidth?: number;
  /** Horizontal offset when expanded (px), aligns detached bubble */
  expandedOffset?: number;
  /** Gaussian blur amount for the gooey SVG filter */
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  disabled?: boolean;
  fullWidthOnExpand?: boolean;
  /** iOS PWA에서 화면 스크롤 없이 키보드를 열기 위한 문서 최상단 포커스 input 사용 여부 */
  focusProxy?: boolean;
}

export function GooeyInput({
  placeholder = "Type to search...",
  className,
  classNames,
  collapsedWidth,
  expandedWidth = 200,
  expandedOffset = 50,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  open: openProp,
  disabled = false,
  fullWidthOnExpand = false,
  focusProxy = false,
}: GooeyInputProps) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputLayoutId = `gooey-input-field-${safeId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const focusProxyRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const placeholderMeasureRef = useRef<HTMLSpanElement>(null);
  const prevExpandedRef = useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [measuredCollapsedWidth, setMeasuredCollapsedWidth] = useState(115);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [focusProxyRect, setFocusProxyRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const isControlled = valueProp !== undefined;
  const isOpenControlled = openProp !== undefined;
  const isExpanded = isOpenControlled ? openProp : uncontrolledOpen;
  const searchText = isControlled ? valueProp : uncontrolledValue;
  const focusTargetRef = focusProxy ? focusProxyRef : inputRef;

  const setSearchText = useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const setExpanded = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  useLayoutEffect(() => {
    if (isExpanded && (!focusProxy || focusProxyRect)) {
      focusTargetRef.current?.focus({ preventScroll: true });
    } else if (prevExpandedRef.current) {
      setSearchText("");
    }
    prevExpandedRef.current = isExpanded;
  }, [focusProxy, focusProxyRect, focusTargetRef, isExpanded, setSearchText]);

  useLayoutEffect(() => {
    if (!focusProxy || !isExpanded || !inputRef.current) {
      setFocusProxyRect(null);
      return;
    }

    let animationFrameId: number;

    const updateFocusProxyRect = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      setFocusProxyRect((previous) => {
        const next = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };

        if (
          previous &&
          Math.abs(previous.left - next.left) < 0.5 &&
          Math.abs(previous.top - next.top) < 0.5 &&
          Math.abs(previous.width - next.width) < 0.5 &&
          Math.abs(previous.height - next.height) < 0.5
        ) {
          return previous;
        }

        return next;
      });
    };

    const syncFocusProxyRect = () => {
      updateFocusProxyRect();
      animationFrameId = requestAnimationFrame(syncFocusProxyRect);
    };

    const handlePageResume = () => {
      updateFocusProxyRect();
      requestAnimationFrame(updateFocusProxyRect);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handlePageResume();
      }
    };

    const observer = new ResizeObserver(updateFocusProxyRect);
    observer.observe(inputRef.current);
    window.visualViewport?.addEventListener("resize", updateFocusProxyRect);
    window.visualViewport?.addEventListener("scroll", updateFocusProxyRect);
    window.addEventListener("pageshow", handlePageResume);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    syncFocusProxyRect();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.visualViewport?.removeEventListener("resize", updateFocusProxyRect);
      window.visualViewport?.removeEventListener("scroll", updateFocusProxyRect);
      window.removeEventListener("pageshow", handlePageResume);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [focusProxy, isExpanded]);

  useLayoutEffect(() => {
    if (collapsedWidth !== undefined) return;

    const textWidth = placeholderMeasureRef.current?.getBoundingClientRect().width ?? 0;
    setMeasuredCollapsedWidth(Math.ceil(textWidth + 56));
  }, [collapsedWidth, placeholder]);

  useLayoutEffect(() => {
    if (!fullWidthOnExpand || !rootRef.current) return;

    const updateWidth = () => {
      setAvailableWidth(rootRef.current?.getBoundingClientRect().width ?? 0);
    };
    const observer = new ResizeObserver(updateWidth);
    observer.observe(rootRef.current);
    updateWidth();

    return () => observer.disconnect();
  }, [fullWidthOnExpand]);

  const resolvedCollapsedWidth = collapsedWidth ?? measuredCollapsedWidth;
  const resolvedExpandedWidth =
    fullWidthOnExpand && availableWidth
      ? Math.max(resolvedCollapsedWidth, availableWidth - expandedOffset)
      : expandedWidth;

  const buttonVariants = useMemo(
    () => ({
      collapsed: { width: resolvedCollapsedWidth, marginLeft: 0 },
      expanded: {
        width: resolvedExpandedWidth,
        marginLeft: expandedOffset,
      },
    }),
    [expandedOffset, resolvedCollapsedWidth, resolvedExpandedWidth],
  );

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    [setSearchText],
  );

  const handleBlur = useCallback(() => {
    if (!searchText) setExpanded(false);
  }, [searchText, setExpanded]);

  const handleClear = useCallback(() => {
    setSearchText("");
    focusTargetRef.current?.focus({ preventScroll: true });
  }, [focusTargetRef, setSearchText]);

  const surfaceClass =
    "bg-foreground text-background shadow-sm ring-1 ring-border/60";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex items-center justify-center",
        className,
        classNames?.root,
      )}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />
      <span
        ref={placeholderMeasureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute whitespace-nowrap text-sm font-medium"
      >
        {placeholder}
      </span>

      <div
        className={cn(
          "relative flex h-10 items-center justify-center",
          classNames?.filterWrap,
        )}
        style={{ filter: `url(#${filterId})` }}
      >
        <motion.div
          className={cn("flex h-10 items-center justify-center", classNames?.buttonRow)}
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <div
            className={cn(
              "relative flex h-10 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-[color,box-shadow]",
              surfaceClass,
              disabled && "pointer-events-none opacity-50",
              classNames?.trigger,
            )}
          >
            {!isExpanded && (
              <button
                aria-label={placeholder}
                className="absolute inset-0 z-10 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                disabled={disabled}
                onClick={handleExpand}
                type="button"
              />
            )}
            {!isExpanded ? (
              <SearchIcon layoutId={iconLayoutId} />
            ) : null}
            <motion.input
              layoutId={inputLayoutId}
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchText}
              onChange={focusProxy ? undefined : handleChange}
              onBlur={focusProxy ? undefined : handleBlur}
              disabled={disabled || !isExpanded}
              readOnly={focusProxy}
              tabIndex={focusProxy ? -1 : undefined}
              placeholder={placeholder}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent text-base text-background outline-none font-medium",
                "[&::-webkit-search-cancel-button]:hidden",
                isExpanded
                  ? cn(
                      "placeholder:text-background/50 dark:placeholder:text-background/45",
                      focusProxy && "pointer-events-none text-transparent caret-transparent",
                    )
                  : "pointer-events-none placeholder:text-background/80 dark:placeholder:text-background/70",
                classNames?.input,
              )}
            />
            {isExpanded && searchText && (
              <button
                aria-label="검색어 지우기"
                className="relative z-[60] mr-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-background/15 text-background ring-1 ring-background/30 transition-colors hover:bg-background/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/70"
                onClick={handleClear}
                onMouseDown={(event) => event.preventDefault()}
                type="button"
              >
                <ClearIcon />
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          className={cn(
            "absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center",
            classNames?.bubble,
          )}
          variants={iconBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              surfaceClass,
              classNames?.bubbleSurface,
            )}
          >
            <SearchIcon layoutId={iconLayoutId} />
          </div>
        </motion.div>
      </div>
      {focusProxy &&
        isExpanded &&
        focusProxyRect &&
        typeof document !== "undefined" &&
        createPortal(
          <input
            ref={focusProxyRef}
            autoComplete="off"
            className="fixed z-50 border-0 bg-transparent px-0 text-base font-medium text-background outline-none [&::-webkit-search-cancel-button]:hidden"
            enterKeyHint="search"
            inputMode="search"
            onBlur={handleBlur}
            onChange={handleChange}
            onPointerDown={(event) => {
              event.currentTarget.focus({ preventScroll: true });
            }}
            style={focusProxyRect}
            type="search"
            value={searchText}
          />,
          document.body,
        )}
    </div>
  );
}
