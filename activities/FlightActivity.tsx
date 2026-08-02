import React from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { BriefcaseBusiness, CircleCheck, Luggage, Plane, UsersRound } from "lucide-react";
import { Chip } from "@heroui/react";
import Image from "next/image";
import { FLIGHT_PASSENGERS, FLIGHT_ROUTE_LABEL, FLIGHT_SEGMENTS, type FlightSegment } from "@/lib/flights";
import { TextEffect } from "@/components/core/text-effect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

gsap.registerPlugin(useGSAP);

const FlightTimeline: React.FC<{ flight: FlightSegment }> = ({ flight }) => (
  <article data-flight-card className="overflow-hidden rounded-3xl border border-[#dbe8f5] bg-white shadow-[0_18px_40px_-32px_rgba(12,72,145,0.7)]">
    <div className="flex items-center justify-between bg-[#f1f7fd] px-5 py-3.5">
      <div className="flex items-center gap-2 text-[#164d91]">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#d9edfc]"><Plane className="size-4 -rotate-45" aria-hidden="true" /></span>
        <span className="text-sm font-extrabold">{flight.label}</span>
      </div>
      <TextEffect as="p" per="word" preset="fade" speedReveal={1.8} className="text-sm font-bold text-[#1e4f8d]" segmentTransition={{ duration: 0.2 }}>
        {`${flight.date} (${flight.day})`}
      </TextEffect>
    </div>

    <div className="p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-1">
        <div className="min-w-0">
          <p className="text-4xl font-black tracking-[-0.07em] text-[#0d347c] tabular-nums">{flight.departure.time}</p>
          <p className="mt-2 text-lg font-black tracking-[-0.04em] text-[#0d347c]">{flight.departure.code}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{flight.departure.airport}{flight.departure.terminal ? ` · ${flight.departure.terminal}` : ""}</p>
        </div>
        <div className="relative flex h-24 flex-col items-center justify-between">
          <span data-flight-line className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 border-l-2 border-dotted border-[#82aad5]" />
          <span className="relative flex size-5 items-center justify-center rounded-full bg-[#0b4f9b] text-white"><Plane data-flight-plane className="size-3 -rotate-45" aria-hidden="true" /></span>
          <span className="relative size-3 rounded-full border-2 border-[#0b4f9b] bg-white" />
        </div>
        <div className="min-w-0 text-right">
          <p className="text-4xl font-black tracking-[-0.07em] text-[#0d347c] tabular-nums">{flight.arrival.time}</p>
          <p className="mt-2 text-lg font-black tracking-[-0.04em] text-[#0d347c]">{flight.arrival.code}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{flight.arrival.nextDay ? "+1일 · " : ""}{flight.arrival.airport}{flight.arrival.terminal ? ` · ${flight.arrival.terminal}` : ""}</p>
        </div>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs font-bold text-[#35659e] before:h-px before:flex-1 before:bg-[#dce8f4] after:h-px after:flex-1 after:bg-[#dce8f4]">
        {flight.duration}
      </div>

      <div data-flight-meta className="rounded-2xl bg-[#f6f9fc] p-4">
        <div className="flex items-center gap-2">
          <Image src="/korean-air-mark.svg" alt="대한항공" width={176} height={44} className="h-6 w-auto" />
          <span className="font-extrabold text-[#112f67]">대한항공 {flight.flightNumber}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip className="border-0 bg-white px-2 text-xs font-bold text-slate-600 shadow-sm">{flight.aircraft}</Chip>
          <Chip className="border-0 bg-white px-2 text-xs font-bold text-slate-600 shadow-sm">{flight.cabin}</Chip>
          <Chip className="border-0 bg-white px-2 text-xs font-bold text-slate-600 shadow-sm">{flight.baggage}</Chip>
        </div>
      </div>
    </div>
  </article>
);

export const FlightActivity: React.FC = () => {
  const screenRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out", overwrite: "auto" } });
      timeline
        .from("[data-flight-header]", { y: 20, autoAlpha: 0, duration: 0.56 })
        .from("[data-flight-card]", { y: 28, autoAlpha: 0, duration: 0.62, stagger: 0.14 }, "-=0.2")
        .from("[data-flight-meta]", { y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.12 }, "-=0.48")
        .from("[data-passengers-card]", { y: 18, autoAlpha: 0, duration: 0.5 }, "-=0.15");

      gsap.from("[data-flight-line]", { scaleY: 0, transformOrigin: "top", duration: 0.55, stagger: 0.15, ease: "power2.inOut", delay: 0.28 });
      gsap.from("[data-flight-plane]", { y: -18, rotation: -18, autoAlpha: 0, duration: 0.48, stagger: 0.15, ease: "back.out(1.6)", delay: 0.48 });

      return () => timeline.kill();
    });
    return () => media.revert();
  }, { scope: screenRef });

  return (
    <AppScreen appBar={{ title: "항공권" }}>
      <main ref={screenRef} className="min-h-full w-full bg-[#f5f9fd] px-4 pb-10 pt-5">
        <section data-flight-header className="rounded-3xl bg-[linear-gradient(135deg,#073778_0%,#0f63b4_58%,#66c1ee_100%)] px-5 py-5 text-white shadow-[0_20px_44px_-28px_rgba(10,63,138,0.9)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-white/70">KOREAN AIR</p>
              <TextEffect as="h1" per="word" preset="fade-in-blur" speedReveal={1.8} className="mt-2 text-2xl font-black tracking-[-0.055em]" segmentTransition={{ duration: 0.28 }}>
                가현짱과 미누쿤의 비행
              </TextEffect>
            </div>
            <Image src="/korean-air-mark.svg" alt="Korean Air" width={176} height={44} className="h-8 w-auto brightness-0 invert" />
          </div>
          <TextEffect as="p" per="word" preset="slide" speedReveal={1.7} className="mt-5 text-lg font-bold tracking-[-0.035em]" segmentTransition={{ duration: 0.25 }}>
            {FLIGHT_ROUTE_LABEL}
          </TextEffect>
          <p className="mt-2 text-sm font-medium text-white/80">8월 29일 출발 · 9월 2일 귀국</p>
        </section>

        <section className="mt-5 space-y-4" aria-label="왕복 여정">
          {FLIGHT_SEGMENTS.map((flight) => <FlightTimeline key={flight.id} flight={flight} />)}
        </section>

        <section data-passengers-card className="mt-5 rounded-3xl border border-[#dbe8f5] bg-white p-5 shadow-[0_18px_40px_-32px_rgba(12,72,145,0.7)]">
          <div className="flex items-center gap-2 text-[#164d91]"><UsersRound className="size-5" aria-hidden="true" /><h2 className="text-lg font-black tracking-[-0.04em]">탑승객</h2></div>
          <div className="mt-4 space-y-3">
            {FLIGHT_PASSENGERS.map((passenger) => (
              <div key={passenger.id} className="flex items-center gap-3 rounded-2xl bg-[#f5f9fd] px-3.5 py-3">
                <Avatar className="size-10 bg-sky-100"><AvatarImage src={passenger.image} alt="" /><AvatarFallback>{passenger.initials}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1"><p className="font-extrabold text-[#163a78]">{passenger.name}</p><p className="mt-0.5 text-xs font-medium text-slate-500">KE657 · KE658 동일 여정</p></div>
                <CircleCheck className="size-5 text-[#2684c7]" aria-label="여정 확인" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#dce9f6] bg-[#f8fbfe] px-4 py-3 text-sm text-slate-600">
            <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-[#3977b5]" aria-hidden="true" />
            <p><span className="font-bold text-[#234b83]">탑승 준비 안내</span><br />공항·터미널과 수하물 정보를 출발 전에 한 번 더 확인해 주세요.</p>
            <Luggage className="mt-0.5 size-4 shrink-0 text-[#3977b5]" aria-hidden="true" />
          </div>
        </section>
      </main>
    </AppScreen>
  );
};
