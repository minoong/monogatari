"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PostTripLetterTimeline } from "@/components/home/PostTripLetterTimeline";
import { PostTripPrepPhotoParallax } from "@/components/home/PostTripPrepPhotoParallax";
import { PostTripScheduleDriftWall } from "@/components/home/PostTripScheduleDriftWall";
import { PostTripWishPinIndicator } from "@/components/home/PostTripWishPinIndicator";
import ScrollFloat from "@/components/ScrollFloat";
import type { ScheduleItem } from "@/lib/schedule";
import { TRIP_RETURN_FLIGHT } from "@/lib/trip-phase";
import type { WishItem } from "@/lib/wishes";
import "./post-trip-scroll-experience.css";
import "./post-trip-wish-pin.css";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const HERO_IMAGE = "/images/post-trip-scroll.jpg";
const HERO_SCROLL_DISTANCE = 1.2;
const HERO_HOLD_DISTANCE = 0.35;
const HERO_TRACK_HEIGHT_RATIO = 1 + HERO_SCROLL_DISTANCE + HERO_HOLD_DISTANCE;

function primeHeroLayout(heroTrack: HTMLElement, viewportHeight: number) {
  const stage = heroTrack.querySelector<HTMLElement>(".post-trip-hero-stage");
  if (!stage || viewportHeight < 200) return;

  stage.style.height = `${viewportHeight}px`;
  heroTrack.style.height = `${viewportHeight * HERO_TRACK_HEIGHT_RATIO}px`;
}

type ContentPanel = {
  id: string;
  label: string;
  title: string;
  tone: "sky" | "emerald" | "amber" | "rose";
  scrollable?: boolean;
  body?: ReactNode;
};

const CONTENT_PANELS: ContentPanel[] = [
  {
    id: "schedule",
    label: "일정",
    title: "4일의 리듬",
    tone: "sky",
  },
  {
    id: "wish",
    label: "위시",
    title: "해냈던 것들",
    tone: "emerald",
  },
  {
    id: "prep",
    label: "준비",
    title: "떠나기 전 우리",
    tone: "amber",
  },
  {
    id: "letter",
    label: "편지",
    title: "다음 여행에게",
    tone: "rose",
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

function setupHeroExpand(scroller: HTMLElement, heroTrack: HTMLElement, viewportHeight: number) {
  const stage = heroTrack.querySelector<HTMLElement>(".post-trip-hero-stage");
  const frame = heroTrack.querySelector<HTMLElement>(".post-trip-hero-frame");
  const image = heroTrack.querySelector<HTMLElement>(".post-trip-hero-image");
  const title = heroTrack.querySelector<HTMLElement>(".post-trip-hero-title");
  const hint = heroTrack.querySelector<HTMLElement>(".post-trip-hero-hint");
  const scrim = heroTrack.querySelector<HTMLElement>(".post-trip-hero-scrim");
  const overlay = heroTrack.querySelector<HTMLElement>(".post-trip-hero-overlay");

  if (!stage || !frame || !image || !title || !hint || !scrim || !overlay) return;

  primeHeroLayout(heroTrack, viewportHeight);

  const startWidth = 42;
  const startHeight = 58;
  const startRadius = 24;
  const mediaZoom = 1.35;
  const overlayScrim = 0.45;

  ScrollTrigger.create({
    trigger: heroTrack,
    scroller,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.2,
    onUpdate(self) {
      const progress = self.progress;
      const eased = smoothstep(0, 1, progress);

      const width = startWidth + (100 - startWidth) * eased;
      const height = startHeight + (100 - startHeight) * eased;
      const insetX = Math.max(0, (100 - width) / 2);
      const insetY = Math.max(0, (100 - height) / 2);
      const radius = startRadius + (0 - startRadius) * eased;

      frame.style.clipPath = `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;
      image.style.transform = `scale(${mediaZoom + (1 - mediaZoom) * eased})`;
      scrim.style.opacity = `${overlayScrim * eased}`;

      const titleOut = smoothstep(0.4, 0.88, progress);
      title.style.opacity = `${1 - titleOut}`;
      title.style.transform = `translate3d(0, ${-28 * titleOut}px, 0) scale(${1 + 0.06 * titleOut})`;

      const hintOut = smoothstep(0, 0.12, progress);
      hint.style.opacity = `${1 - hintOut}`;
      hint.style.transform = `translate3d(0, ${8 * hintOut}px, 0)`;

      const overlayIn = smoothstep(0.68, 1, progress);
      overlay.style.opacity = `${overlayIn}`;
      overlay.style.transform = `translate3d(0, ${18 * (1 - overlayIn)}px, 0)`;
    },
  });
}

const WISH_ACTIVE_COLOR = "#064e3b";
const WISH_IDLE_COLOR = "rgba(6, 95, 70, 0.38)";

function appendOverscrollExit(timeline: gsap.core.Timeline, content: HTMLElement) {
  timeline
    .fromTo(
      content,
      { scale: 1, opacity: 1 },
      { scale: 0.7, opacity: 0.5, duration: 0.9, force3D: false },
    )
    .to(content, { opacity: 0, duration: 0.1, force3D: false });
}

function setupWishLateralAct(panel: HTMLElement, timeline: gsap.core.Timeline, innerDuration: number) {
  const list = panel.querySelector<HTMLElement>(".wish-pin-list");
  const fill = panel.querySelector<HTMLElement>(".wish-pin-fill");
  if (!list || innerDuration <= 0) return;

  const listItems = gsap.utils.toArray<HTMLElement>(".wish-pin-item", list);
  const slides = gsap.utils.toArray<HTMLElement>(".wish-pin-slide", panel);
  if (!listItems.length || listItems.length !== slides.length) return;

  if (fill) {
    gsap.set(fill, {
      scaleY: 1 / listItems.length,
      transformOrigin: "top left",
    });
  }

  gsap.set(listItems[0], { color: WISH_ACTIVE_COLOR });
  gsap.set(slides[0], { autoAlpha: 1 });

  listItems.forEach((item, index) => {
    if (index === 0) return;

    timeline
      .set(item, { color: WISH_ACTIVE_COLOR }, 0.5 * index)
      .to(slides[index], { autoAlpha: 1, duration: 0.2 }, "<")
      .set(listItems[index - 1], { color: WISH_IDLE_COLOR }, "<")
      .to(slides[index - 1], { autoAlpha: 0, duration: 0.2 }, "<");
  });

  if (fill) {
    timeline.to(
      fill,
      {
        scaleY: 1,
        transformOrigin: "top left",
        ease: "none",
        duration: innerDuration,
      },
      0,
    );
  }

  timeline.to({}, { duration: 0.01 }, innerDuration);
}

function isPanelTrack(element: HTMLElement | null): element is HTMLElement {
  return Boolean(
    element?.classList.contains("post-trip-panel-track") || element?.classList.contains("post-trip-wish-track"),
  );
}

function resolveInnerDuration(
  includeExit: boolean,
  roundedHold: number,
  stickyDistance: number,
  fakeScrollRatio: number,
) {
  if (roundedHold <= 0 || stickyDistance <= 0) return 0;
  if (!includeExit) return 1;
  if (fakeScrollRatio >= 1) return 0;
  return 1 / (1 - fakeScrollRatio) - 1;
}

function layoutStickyTrack(panel: HTMLElement, viewportHeight: number, holdDistance: number, isLastPanel = false) {
  const track = panel.parentElement;
  if (!isPanelTrack(track)) return null;

  const includeExit = !isLastPanel && track.nextElementSibling !== null;
  const roundedHold = Math.max(0, Math.round(holdDistance));
  const exitDistance = includeExit ? viewportHeight : 0;
  const stickyDistance = roundedHold + exitDistance;
  const fakeScrollRatio = stickyDistance > 0 ? roundedHold / stickyDistance : 0;
  const innerDuration = resolveInnerDuration(includeExit, roundedHold, stickyDistance, fakeScrollRatio);
  const nextPanel = track.nextElementSibling;

  gsap.set(track, { height: viewportHeight + stickyDistance });
  gsap.set(panel, { height: viewportHeight, marginBottom: 0, top: 0 });
  if (includeExit && nextPanel instanceof HTMLElement) {
    gsap.set(nextPanel, { marginTop: -exitDistance });
  }

  return { track, stickyDistance, innerDuration, holdDistance: roundedHold, includeExit };
}

function createStickyTimeline(
  track: HTMLElement,
  scroller: HTMLElement,
  stickyDistance: number,
  scrollTriggerId?: string,
) {
  if (scrollTriggerId) {
    ScrollTrigger.getById(scrollTriggerId)?.kill();
  }

  return gsap.timeline({
    scrollTrigger: {
      id: scrollTriggerId,
      trigger: track,
      scroller,
      start: "top top",
      end: () => `+=${stickyDistance}`,
      scrub: true,
    },
  });
}

function setupWishStickyPanel(
  panel: HTMLElement,
  content: HTMLElement,
  scroller: HTMLElement,
  viewportHeight: number,
  isLastPanel = false,
) {
  const listItems = gsap.utils.toArray(".wish-pin-item", panel);
  if (!listItems.length) return;

  const layout = layoutStickyTrack(
    panel,
    viewportHeight,
    listItems.length * 0.5 * viewportHeight,
    isLastPanel,
  );
  if (!layout) return;

  const timeline = createStickyTimeline(layout.track, scroller, layout.stickyDistance);
  setupWishLateralAct(panel, timeline, layout.innerDuration);
  if (layout.includeExit) {
    appendOverscrollExit(timeline, content);
  }
}

function measureInnerOverflow(inner: HTMLElement, viewportHeight: number) {
  const previousHeight = inner.style.height;
  inner.style.height = "auto";
  const innerHeight = Math.round(inner.scrollHeight);
  inner.style.height = previousHeight;
  return Math.max(0, innerHeight - viewportHeight);
}

function measureLetterHoldDistance(panel: HTMLElement, inner: HTMLElement, viewportHeight: number) {
  const chrome = panel.querySelector<HTMLElement>(".post-trip-letter-timeline__chrome");
  const chromeHeight = chrome?.offsetHeight ?? 0;
  const visibleBodyHeight = Math.max(0, viewportHeight - chromeHeight);

  const previousHeight = inner.style.height;
  inner.style.height = "auto";
  const innerHeight = Math.round(inner.scrollHeight);
  inner.style.height = previousHeight;

  return Math.max(0, innerHeight - visibleBodyHeight);
}

function setupLetterStickyPanel(
  panel: HTMLElement,
  inner: HTMLElement,
  content: HTMLElement,
  scroller: HTMLElement,
  viewportHeight: number,
) {
  ScrollTrigger.getById("post-trip-letter")?.kill();
  gsap.set(content, { scale: 1, opacity: 1, clearProps: "transform,opacity" });
  gsap.set(inner, { y: 0, clearProps: "transform" });

  const holdDistance = measureLetterHoldDistance(panel, inner, viewportHeight);
  const layout = layoutStickyTrack(panel, viewportHeight, holdDistance, true);
  if (!layout || layout.holdDistance <= 0) return;

  const timeline = createStickyTimeline(layout.track, scroller, layout.stickyDistance, "post-trip-letter");

  timeline.to(inner, {
    y: -layout.holdDistance,
    duration: 1,
    ease: "none",
    force3D: false,
  });

  timeline.eventCallback("onUpdate", () => {
    gsap.set(content, { scale: 1, opacity: 1, force3D: false });
  });
}

function setupStickyOverscrollPanel(
  panel: HTMLElement,
  inner: HTMLElement,
  content: HTMLElement,
  scroller: HTMLElement,
  viewportHeight: number,
  scrollTriggerId?: string,
  isLastPanel = false,
) {
  if (scrollTriggerId) {
    gsap.set(inner, { y: 0, clearProps: "transform" });
  }

  const holdDistance = measureInnerOverflow(inner, viewportHeight);
  const layout = layoutStickyTrack(panel, viewportHeight, holdDistance, isLastPanel);
  if (!layout) return;

  const timeline = createStickyTimeline(layout.track, scroller, layout.stickyDistance, scrollTriggerId);

  if (layout.holdDistance > 0) {
    timeline.to(inner, {
      y: -layout.holdDistance,
      duration: layout.innerDuration,
      ease: "none",
      force3D: false,
    });
  }

  if (layout.includeExit) {
    appendOverscrollExit(timeline, content);
  }
}

const PREP_HOLD_RATIO = 1.75;
const PREP_PARALLAX_MULTIPLIERS = [2, 3.3, 1.25, 3];

function measurePrepHoldDistance(panel: HTMLElement, viewportHeight: number) {
  const columns = gsap.utils.toArray<HTMLElement>(".post-trip-prep-parallax__column", panel);
  if (!columns.length) return 0;

  const minHold = Math.round(viewportHeight * PREP_HOLD_RATIO);
  const maxColumnHeight = Math.max(...columns.map((column) => column.scrollHeight));
  const overflow = Math.max(0, maxColumnHeight - viewportHeight);

  return minHold + overflow;
}

function setupPrepParallaxPanel(
  panel: HTMLElement,
  content: HTMLElement,
  scroller: HTMLElement,
  viewportHeight: number,
  isLastPanel = false,
) {
  const columns = gsap.utils.toArray<HTMLElement>(".post-trip-prep-parallax__column", panel);
  const holdDistance = columns.length > 0 ? measurePrepHoldDistance(panel, viewportHeight) : 0;
  const layout = layoutStickyTrack(panel, viewportHeight, holdDistance, isLastPanel);
  if (!layout) return;

  ScrollTrigger.getById("post-trip-prep")?.kill();

  columns.forEach((column) => gsap.set(column, { y: 0, force3D: true }));
  gsap.set(content, { scale: 1, opacity: 1 });

  const { track, stickyDistance, holdDistance: hold } = layout;
  const holdRatio = stickyDistance > 0 ? hold / stickyDistance : 0;

  ScrollTrigger.create({
    id: "post-trip-prep",
    trigger: track,
    scroller,
    start: "top top",
    end: () => `+=${stickyDistance}`,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate(self) {
      const progress = self.progress;
      const parallaxProgress = holdRatio > 0 ? clamp(progress / holdRatio, 0, 1) : 0;

      columns.forEach((column, index) => {
        const multiplier = PREP_PARALLAX_MULTIPLIERS[index] ?? PREP_PARALLAX_MULTIPLIERS[0];
        gsap.set(column, {
          y: viewportHeight * multiplier * parallaxProgress,
          force3D: true,
        });
      });

      if (holdRatio >= 1 || !layout.includeExit) return;

      const exitProgress = clamp((progress - holdRatio) / (1 - holdRatio), 0, 1);
      const easedExit = smoothstep(0, 1, exitProgress);
      gsap.set(content, {
        scale: 1 - 0.3 * easedExit,
        opacity: easedExit >= 0.95 ? 0 : 1 - 0.5 * easedExit,
        force3D: false,
      });
    },
  });
}

function setupPinnedPanels(scroller: HTMLElement, panels: HTMLElement[], viewportHeight: number) {
  const lastPanelIndex = panels.length - 1;

  panels.forEach((panel, index) => {
    const content = panel.querySelector<HTMLElement>(".post-trip-panel-content");
    if (!content) return;

    const isLastPanel = index === lastPanelIndex;

    if (panel.querySelector(".post-trip-panel-content--schedule")) {
      const layout = layoutStickyTrack(panel, viewportHeight, 0, isLastPanel);
      if (!layout) return;

      const timeline = createStickyTimeline(
        layout.track,
        scroller,
        layout.stickyDistance,
        "post-trip-schedule",
      );
      if (layout.includeExit) {
        appendOverscrollExit(timeline, content);
      }
      return;
    }

    if (panel.querySelector(".post-trip-panel-content--prep")) {
      setupPrepParallaxPanel(panel, content, scroller, viewportHeight, isLastPanel);
      return;
    }

    if (panel.querySelector(".post-trip-panel-content--letter")) {
      const inner = panel.querySelector<HTMLElement>(".post-trip-letter-timeline__body");
      if (!inner) return;

      setupLetterStickyPanel(panel, inner, content, scroller, viewportHeight);
      return;
    }

    const inner = panel.querySelector<HTMLElement>(".post-trip-panel-inner");
    if (!inner) return;

    if (panel.querySelector(".wish-pin")) {
      setupWishStickyPanel(panel, content, scroller, viewportHeight, isLastPanel);
      return;
    }

    setupStickyOverscrollPanel(panel, inner, content, scroller, viewportHeight, undefined, isLastPanel);
  });
}

type PostTripScrollExperienceProps = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

const fetchWishes = async (): Promise<WishItem[]> => {
  const response = await fetch("/api/wishes");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "위시를 불러오지 못했습니다.");
  return payload.data;
};

const fetchSchedule = async (): Promise<ScheduleItem[]> => {
  const response = await fetch("/api/schedule");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "일정을 불러오지 못했어요.");
  return payload.data;
};

export function PostTripScrollExperience({ scrollContainerRef }: PostTripScrollExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const returnFlight = TRIP_RETURN_FLIGHT;
  const { data: wishes = [], isFetched: isWishesFetched } = useQuery({ queryKey: ["wishes"], queryFn: fetchWishes });
  const { data: scheduleItems = [], isFetched: isScheduleFetched } = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });
  const tripPhotoCount = scheduleItems.reduce((count, item) => count + item.tripImages.length, 0);
  const tripMemoCount = scheduleItems.reduce(
    (count, item) => count + (item.trip_memo?.trim() ? 1 : 0),
    0,
  );

  useLayoutEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let context: gsap.Context | null = null;

    wrapperRef.current?.classList.remove("is-ready");

    const resolveScroller = () =>
      scrollContainerRef.current ??
      wrapperRef.current?.closest<HTMLElement>(".post-trip-scroll") ??
      null;

    const prime = (): boolean => {
      if (cancelled) return true;

      const heroTrack = heroTrackRef.current;
      const scroller = resolveScroller();
      const viewportHeight = scroller ? Math.round(scroller.clientHeight) : 0;

      if (!scroller || !heroTrack || viewportHeight < 200) return false;

      primeHeroLayout(heroTrack, viewportHeight);
      return true;
    };

    const init = (): boolean => {
      if (cancelled) return true;

      const heroTrack = heroTrackRef.current;
      const wrapper = wrapperRef.current;
      const scroller = resolveScroller();
      const panels = wrapper ? gsap.utils.toArray<HTMLElement>(".post-trip-panel", wrapper) : [];
      const viewportHeight = scroller ? Math.round(scroller.clientHeight) : 0;

      if (
        !scroller ||
        !heroTrack ||
        !wrapper ||
        viewportHeight < 200 ||
        panels.length !== CONTENT_PANELS.length ||
        !isScheduleFetched ||
        !isWishesFetched
      ) {
        prime();
        return false;
      }

      try {
        context?.revert();
        context = gsap.context(() => {
          setupHeroExpand(scroller, heroTrack, viewportHeight);
          setupPinnedPanels(scroller, panels, viewportHeight);
          ScrollTrigger.refresh();
        }, wrapper);

        resizeObserver?.disconnect();
        resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
        resizeObserver.observe(scroller);
        resizeObserver.observe(wrapper);
        if (!cancelled) wrapper.classList.add("is-ready");
      } catch (error) {
        console.error("PostTripScrollExperience GSAP init failed", error);
      }

      return true;
    };

    if (!prime()) {
      const retryPrime = () => {
        if (cancelled || prime()) return;
        requestAnimationFrame(retryPrime);
      };
      requestAnimationFrame(retryPrime);
    }

    if (!init()) {
      const retry = () => {
        if (cancelled || init()) return;
        requestAnimationFrame(retry);
      };
      requestAnimationFrame(retry);
    }

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      context?.revert();
      wrapperRef.current?.classList.remove("is-ready");
    };
  }, [scrollContainerRef, tripPhotoCount, tripMemoCount, wishes.length, isScheduleFetched, isWishesFetched]);

  return (
    <div ref={wrapperRef} className="post-trip-scroll-experience w-full">
      <div ref={heroTrackRef} className="post-trip-hero-track relative w-full">
        <div className="post-trip-hero-stage sticky top-0 w-full overflow-hidden">
          <div className="post-trip-hero-frame absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="post-trip-hero-image" draggable={false} src={HERO_IMAGE} />
            <div className="post-trip-hero-scrim absolute inset-0 opacity-0" />
            <div className="post-trip-hero-overlay absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0">
              <h2 className="max-w-xs text-2xl font-extrabold leading-tight tracking-[-0.03em] text-white">
                추억은
                <br />
                남겼나요?
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/85">
                {returnFlight
                  ? `${returnFlight.flightNumber} · ${returnFlight.date} ${returnFlight.departure.time} BKK 출발. `
                  : ""}
                3박 4일 방콕, 위시 목표를 얼마나 채웠는지 같이 돌아봐요.
              </p>
            </div>
          </div>
          <div className="post-trip-hero-title pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-white">
            여행 끝
          </div>
          <div className="post-trip-hero-hint pointer-events-none absolute inset-x-0 bottom-5 text-center text-sm text-white/55">
            아래로 스크롤
          </div>
        </div>
      </div>

      <div className="post-trip-pinned-panels w-full">
        {CONTENT_PANELS.map((section, index) => {
          const panel = (
            <section
              key={section.id}
              ref={(element) => {
                panelRefs.current[index] = element;
              }}
              className={`post-trip-panel${section.scrollable ? " post-trip-panel--scrollable" : ""}`}
            >
              <div
                className={`post-trip-panel-content post-trip-panel--${section.tone}${
                  section.id === "schedule" ? " post-trip-panel-content--schedule" : ""
                }${section.id === "prep" ? " post-trip-panel-content--prep" : ""}${
                  section.id === "letter" ? " post-trip-panel-content--letter" : ""
                }`}
              >
                {section.id === "schedule" ? (
                  <>
                    <PostTripScheduleDriftWall scheduleItems={scheduleItems} />
                    <div className="post-trip-schedule-title">
                      <ScrollFloat
                        scrollContainerRef={scrollContainerRef}
                        containerClassName="post-trip-schedule-title__float"
                        textClassName="post-trip-schedule-title__text"
                        animationDuration={1}
                        ease="back.inOut(2)"
                        scrollStart="center bottom+=50%"
                        scrollEnd="bottom bottom-=40%"
                        stagger={0.03}
                      >
                        {section.title}
                      </ScrollFloat>
                    </div>
                  </>
                ) : section.id === "wish" ? (
                  <div className="post-trip-panel-inner post-trip-panel-inner--wish">
                    <PostTripWishPinIndicator wishes={wishes} />
                  </div>
                ) : section.id === "prep" ? (
                  <>
                    <PostTripPrepPhotoParallax scheduleItems={scheduleItems} />
                    <div className="post-trip-prep-intro">
                      <p className="post-trip-panel-eyebrow">{section.label}</p>
                      <h2 className="post-trip-panel-title">{section.title}</h2>
                      <p className="post-trip-panel-lead">
                        일정 카드에서 올린 여행 사진이, 그때의 순간을 다시 불러와요.
                      </p>
                    </div>
                  </>
                ) : section.id === "letter" ? (
                  <PostTripLetterTimeline
                    scheduleItems={scheduleItems}
                    scrollContainerRef={scrollContainerRef}
                    label={section.label}
                    title={section.title}
                  />
                ) : (
                  <div className="post-trip-panel-inner">
                    <p className="post-trip-panel-eyebrow">{section.label}</p>
                    <h2 className="post-trip-panel-title">{section.title}</h2>
                    {section.body}
                  </div>
                )}
              </div>
            </section>
          );

          return (
            <div
              className={`post-trip-panel-track${
                section.id === "wish" ? " post-trip-wish-track" : ""
              }${section.id === "letter" ? " post-trip-letter-track" : ""}`}
              key={section.id}
            >
              {panel}
            </div>
          );
        })}
      </div>
    </div>
  );
}
