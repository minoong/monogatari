"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PostTripWishPinIndicator } from "@/components/home/PostTripWishPinIndicator";
import { TRIP_RETURN_FLIGHT } from "@/lib/trip-phase";
import type { WishItem } from "@/lib/wishes";
import "./post-trip-scroll-experience.css";
import "./post-trip-wish-pin.css";

gsap.registerPlugin(ScrollTrigger);

const HERO_IMAGE = "/images/post-trip-scroll.jpg";
const HERO_SCROLL_DISTANCE = 1.2;
const HERO_HOLD_DISTANCE = 0.35;

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
    body: (
      <>
        <p className="post-trip-panel-lead">
          월요일엔 왓 아룬, 화요일엔 짜뚜짝 시장. 밤마다 다른 골목이 우리를 기다렸어요.
        </p>
        <ul className="post-trip-panel-list">
          <li>
            <span>Day 1</span>
            <strong>수완나품 도착 · 카오산 로드 산책</strong>
          </li>
          <li>
            <span>Day 2</span>
            <strong>왓 포 · 왓 아룬 · 차오프라야 선셋</strong>
          </li>
          <li>
            <span>Day 3</span>
            <strong>짜뚜짝 주말시장 · 마사지 · 루프탑 바</strong>
          </li>
          <li>
            <span>Day 4</span>
            <strong>마지막 브런치 · 공항으로</strong>
          </li>
        </ul>
      </>
    ),
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
    scrollable: true,
    body: (
      <>
        <p className="post-trip-panel-lead">
          여권, 환전, eSIM, 여행자 보험. 출발 전 체크리스트를 하나씩 지워내던 날들이 생각나요.
        </p>
        <ul className="post-trip-panel-checklist">
          <li>여권 유효기간 확인</li>
          <li>태국 바트 환전 · 카드 알림 설정</li>
          <li>항공권 · 숙소 예약서 저장</li>
          <li>여행자 보험 가입</li>
          <li>짐 싸기 · 멀티탭 · 선크림</li>
          <li>공항 이동 · 태국 입국 카드 작성</li>
          <li>일정표 공유 · 비상 연락처 정리</li>
          <li>마지막으로, 설레는 마음 챙기기</li>
        </ul>
        <p className="post-trip-panel-note">준비가 길었을수록, 현지에서의 하루가 더 반짝였을 거예요.</p>
      </>
    ),
  },
  {
    id: "letter",
    label: "편지",
    title: "다음 여행에게",
    tone: "rose",
    scrollable: true,
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

  stage.style.height = `${viewportHeight}px`;
  heroTrack.style.height = `${viewportHeight * (1 + HERO_SCROLL_DISTANCE + HERO_HOLD_DISTANCE)}px`;

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
    .fromTo(content, { scale: 1, opacity: 1 }, { scale: 0.7, opacity: 0.5, duration: 0.9 })
    .to(content, { opacity: 0, duration: 0.1 });
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

function setupWishStickyPanel(panel: HTMLElement, content: HTMLElement, scroller: HTMLElement, viewportHeight: number) {
  const listItems = gsap.utils.toArray(".wish-pin-item", panel);
  const track = panel.parentElement;
  if (!listItems.length || !track?.classList.contains("post-trip-wish-track")) return;

  const lateralDistance = listItems.length * 0.5 * viewportHeight;
  const exitDistance = viewportHeight;
  const stickyDistance = lateralDistance + exitDistance;
  const fakeScrollRatio = stickyDistance > 0 ? lateralDistance / stickyDistance : 0;
  const innerDuration = fakeScrollRatio ? 1 / (1 - fakeScrollRatio) - 1 : 0;
  const nextPanel = track.nextElementSibling;

  gsap.set(track, { height: viewportHeight + stickyDistance });
  gsap.set(panel, { height: viewportHeight, marginBottom: 0, top: 0 });
  if (nextPanel instanceof HTMLElement) {
    // Pull the next overscroll panel into the exit range so it slides over the sticky wish.
    gsap.set(nextPanel, { marginTop: -exitDistance });
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      scroller,
      start: "top top",
      end: () => `+=${stickyDistance}`,
      scrub: true,
    },
  });

  setupWishLateralAct(panel, timeline, innerDuration);
  appendOverscrollExit(timeline, content);
}

function setupOverscrollPanel(
  panel: HTMLElement,
  inner: HTMLElement,
  content: HTMLElement,
  scroller: HTMLElement,
  viewportHeight: number,
) {
  panel.style.height = `${viewportHeight}px`;

  const panelHeight = inner.scrollHeight;
  const difference = panelHeight - viewportHeight;
  const fakeScrollRatio = difference > 0 ? difference / (difference + viewportHeight) : 0;

  if (fakeScrollRatio) {
    panel.style.marginBottom = `${panelHeight * fakeScrollRatio}px`;
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: panel,
      scroller,
      start: "bottom bottom",
      end: () => (fakeScrollRatio ? `+=${panelHeight}` : "bottom top"),
      pinSpacing: false,
      pin: true,
      scrub: true,
    },
  });

  if (fakeScrollRatio) {
    timeline.to(inner, {
      yPercent: -100,
      y: viewportHeight,
      duration: 1 / (1 - fakeScrollRatio) - 1,
      ease: "none",
    });
  }

  appendOverscrollExit(timeline, content);
}

function setupPinnedPanels(scroller: HTMLElement, panels: HTMLElement[], viewportHeight: number) {
  panels.forEach((panel, index) => {
    const stackRoot = panel.parentElement?.classList.contains("post-trip-wish-track")
      ? panel.parentElement
      : panel;
    gsap.set(stackRoot, { zIndex: 10 + index });
  });

  const pinPanels = panels.slice(0, -1);

  pinPanels.forEach((panel) => {
    const inner = panel.querySelector<HTMLElement>(".post-trip-panel-inner");
    const content = panel.querySelector<HTMLElement>(".post-trip-panel-content");
    if (!inner || !content) return;

    if (panel.querySelector(".wish-pin")) {
      setupWishStickyPanel(panel, content, scroller, viewportHeight);
      return;
    }

    setupOverscrollPanel(panel, inner, content, scroller, viewportHeight);
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

export function PostTripScrollExperience({ scrollContainerRef }: PostTripScrollExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const returnFlight = TRIP_RETURN_FLIGHT;
  const { data: wishes = [] } = useQuery({ queryKey: ["wishes"], queryFn: fetchWishes });

  useGSAP(
    () => {
      let cancelled = false;

      const init = () => {
        if (cancelled) return;

        const scroller = scrollContainerRef.current;
        const heroTrack = heroTrackRef.current;
        const panels = panelRefs.current.filter((panel): panel is HTMLElement => panel !== null);

        const viewportHeight = scroller ? Math.round(scroller.getBoundingClientRect().height) : 0;

        if (
          !scroller ||
          !heroTrack ||
          viewportHeight < 200 ||
          viewportHeight > window.innerHeight ||
          panels.length !== CONTENT_PANELS.length
        ) {
          requestAnimationFrame(init);
          return;
        }
        setupHeroExpand(scroller, heroTrack, viewportHeight);
        setupPinnedPanels(scroller, panels, viewportHeight);
        ScrollTrigger.refresh();
      };

      requestAnimationFrame(init);

      return () => {
        cancelled = true;
      };
    },
    { scope: wrapperRef, dependencies: [scrollContainerRef] },
  );

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
              <div className={`post-trip-panel-content post-trip-panel--${section.tone}`}>
                {section.id === "wish" ? (
                  <div className="post-trip-panel-inner post-trip-panel-inner--wish">
                    <PostTripWishPinIndicator wishes={wishes} />
                  </div>
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

          return section.id === "wish" ? (
            <div className="post-trip-wish-track" key={section.id}>
              {panel}
            </div>
          ) : (
            panel
          );
        })}
      </div>
    </div>
  );
}
