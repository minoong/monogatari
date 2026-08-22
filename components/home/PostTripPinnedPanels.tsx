"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./post-trip-pinned-panels.css";

gsap.registerPlugin(ScrollTrigger);

type PanelSection = {
  id: string;
  label: string;
  title: string;
  tone: "sky" | "emerald" | "amber" | "rose";
  scrollable?: boolean;
  body: ReactNode;
};

const PANEL_SECTIONS: PanelSection[] = [
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
    body: (
      <>
        <p className="post-trip-panel-lead">
          쇼핑 리스트, 먹고 싶었던 메뉴, 가보고 싶었던 곳. 하나씩 지워가며 채운 기록이에요.
        </p>
        <div className="post-trip-panel-stats">
          <div>
            <p>쇼핑</p>
            <strong>7 / 9</strong>
          </div>
          <div>
            <p>맛집</p>
            <strong>5 / 6</strong>
          </div>
          <div>
            <p>간식</p>
            <strong>4 / 4</strong>
          </div>
          <div>
            <p>메뉴</p>
            <strong>3 / 5</strong>
          </div>
        </div>
        <p className="post-trip-panel-note">아직 남은 위시가 있다면, 다음 여행의 설렘으로 남겨둬도 괜찮아요.</p>
      </>
    ),
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
    body: (
      <>
        <p className="post-trip-panel-letter">
          방콕의 밤공기, 시장의 소란, 그리고 피곤해도 웃었던 우리의 얼굴. 이 여행은 완벽하지 않아도 충분히
          좋았어.
        </p>
        <p className="post-trip-panel-letter">
          다음에 다시 떠날 때를 생각하면, 오늘의 기억이 작은 나침반이 되어 줄 거야. 더 늦게 자도 괜찮고, 더
          멀리 걸어도 괜찮아.
        </p>
        <p className="post-trip-panel-letter">
          위시를 다 채우지 못했다면 그것도 여행의 일부야. 남은 목록은 다음 이야기의 첫 페이지가 될 테니까.
        </p>
        <p className="post-trip-panel-letter">고맙다, 3박 4일. 그리고 함께 걸어준 너에게도.</p>
        <p className="post-trip-panel-sign">— Monogatari, 2026.09</p>
      </>
    ),
  },
];

function setupPinnedPanels(scroller: HTMLElement, panels: HTMLElement[]) {
  const pinPanels = panels.slice(0, -1);
  const viewportHeight = scroller.clientHeight;

  pinPanels.forEach((panel) => {
    const inner = panel.querySelector<HTMLElement>(".post-trip-panel-inner");
    if (!inner) return;

    panel.style.height = `${viewportHeight}px`;

    const panelHeight = inner.offsetHeight;
    const difference = panelHeight - viewportHeight;
    const fakeScrollRatio = difference > 0 ? difference / (difference + viewportHeight) : 0;

    panel.style.marginBottom = fakeScrollRatio ? `${panelHeight * fakeScrollRatio}px` : "0px";

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        scroller,
        start: "bottom bottom",
        end: () => (fakeScrollRatio ? `+=${inner.offsetHeight}` : "bottom top"),
        pinSpacing: false,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        fastScrollEnd: true,
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

    timeline
      .fromTo(panel, { scale: 1, opacity: 1 }, { scale: 0.7, opacity: 0.5, duration: 0.9 })
      .to(panel, { opacity: 0, duration: 0.1 });
  });
}

export function PostTripPinnedPanels({
  scrollContainerRef,
}: {
  scrollContainerRef: RefObject<HTMLElement | null>;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  useGSAP(
    () => {
      let cancelled = false;
      let initialized = false;
      let resizeObserver: ResizeObserver | null = null;

      const init = () => {
        if (cancelled || initialized) return;

        const scroller = scrollContainerRef.current;
        const panels = panelRefs.current.filter((panel): panel is HTMLElement => panel !== null);

        if (!scroller || scroller.clientHeight <= 0 || panels.length !== PANEL_SECTIONS.length) {
          requestAnimationFrame(init);
          return;
        }

        initialized = true;
        setupPinnedPanels(scroller, panels);
        ScrollTrigger.refresh();

        resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
        resizeObserver.observe(scroller);
      };

      requestAnimationFrame(init);

      return () => {
        cancelled = true;
        resizeObserver?.disconnect();
      };
    },
    { scope: wrapperRef, dependencies: [scrollContainerRef] },
  );

  return (
    <div ref={wrapperRef} className="post-trip-pinned-panels w-full">
      {PANEL_SECTIONS.map((section, index) => (
        <section
          key={section.id}
          ref={(element) => {
            panelRefs.current[index] = element;
          }}
          className={`post-trip-panel post-trip-panel--${section.tone}${section.scrollable ? " post-trip-panel--scrollable" : ""}`}
        >
          <div className="post-trip-panel-content">
            <div className="post-trip-panel-inner">
              <p className="post-trip-panel-eyebrow">{section.label}</p>
              <h2 className="post-trip-panel-title">{section.title}</h2>
              {section.body}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
