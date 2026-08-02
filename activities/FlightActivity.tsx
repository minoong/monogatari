import React from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Check, Luggage, Plane, Ticket } from "lucide-react";
import { Chip, Tabs } from "@heroui/react";
import { FLIGHT_PASSENGERS, FLIGHT_TICKETS, KOREAN_AIR_LOGO_URL, KOREAN_AIR_MARK_URL, type FlightPassengerId, type FlightSegment } from "@/lib/flights";
import { TextEffect } from "@/components/core/text-effect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

gsap.registerPlugin(useGSAP);

const PassengerTicket: React.FC<{ passenger: (typeof FLIGHT_PASSENGERS)[number]; flight: FlightSegment }> = ({ passenger, flight }) => (
  <article data-passenger-ticket className="relative overflow-hidden rounded-[26px] border border-[#d7e5f2] bg-white shadow-[0_18px_38px_-30px_rgba(7,47,100,0.66)]">
    <div className="absolute -right-5 top-14 size-10 rounded-full bg-[#f5f9fd]" aria-hidden="true" />
    <div className="absolute -left-5 top-14 size-10 rounded-full bg-[#f5f9fd]" aria-hidden="true" />
    <div className="flex items-center justify-between bg-[#071c4a] px-5 py-3.5 text-white">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8 border border-white/30 bg-sky-100"><AvatarImage src={passenger.image} alt="" /><AvatarFallback>{passenger.initials}</AvatarFallback></Avatar>
        <div><p className="text-sm font-black">{passenger.name}</p><p className="text-[10px] font-bold tracking-[0.14em] text-[#a5d2f5]">BOARDING TICKET</p></div>
      </div>
      <Ticket className="size-5 text-[#8ac7f0]" aria-hidden="true" />
    </div>

    <div className="px-5 pb-5 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-[#5d82a9]">{flight.date} ({flight.day})</p>
          <p className="mt-1 text-sm font-extrabold text-[#12366f]">대한항공 {flight.flightNumber}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={KOREAN_AIR_LOGO_URL} alt="대한항공" className="h-5 w-auto" />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_38px_minmax(0,1fr)] items-center gap-1">
        <div>
          <p className="text-3xl font-black tracking-[-0.07em] text-[#092f70] tabular-nums">{flight.departure.time}</p>
          <p className="mt-1 text-xl font-black text-[#092f70]">{flight.departure.code}</p>
          <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">{flight.departure.airport}{flight.departure.terminal ? ` · ${flight.departure.terminal}` : ""}</p>
        </div>
        <div className="relative flex h-20 flex-col items-center justify-between">
          <span data-flight-line className="absolute inset-y-2 left-1/2 -translate-x-1/2 border-l-2 border-dotted border-[#82b1d8]" />
          <span className="relative flex size-5 items-center justify-center rounded-full bg-[#1470ba] text-white"><Plane data-flight-plane className="size-3 -rotate-45" aria-hidden="true" /></span>
          <span className="relative size-3 rounded-full border-2 border-[#1470ba] bg-white" />
        </div>
        <div className="text-right">
          <p className="text-3xl font-black tracking-[-0.07em] text-[#092f70] tabular-nums">{flight.arrival.time}</p>
          <p className="mt-1 text-xl font-black text-[#092f70]">{flight.arrival.code}</p>
          <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">{flight.arrival.nextDay ? "+1일 · " : ""}{flight.arrival.airport}{flight.arrival.terminal ? ` · ${flight.arrival.terminal}` : ""}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-dashed border-[#d8e5f1] pt-4">
        <Chip className="border-0 bg-[#eff7fd] px-2 text-xs font-bold text-[#285b93]">{flight.aircraft}</Chip>
        <Chip className="border-0 bg-[#eff7fd] px-2 text-xs font-bold text-[#285b93]">{flight.cabin}</Chip>
        <Chip className="border-0 bg-[#eff7fd] px-2 text-xs font-bold text-[#285b93]"><Luggage className="mr-1 inline size-3" />{flight.baggage}</Chip>
      </div>
    </div>
  </article>
);

export const FlightActivity: React.FC = () => {
  const screenRef = React.useRef<HTMLDivElement>(null);
  const [selectedPassenger, setSelectedPassenger] = React.useState<FlightPassengerId>("gahyun");
  const tickets = FLIGHT_TICKETS[selectedPassenger];
  const [selectedFlight, setSelectedFlight] = React.useState(tickets[0].id);
  const flight = tickets.find((item) => item.id === selectedFlight) ?? tickets[0];
  const passenger = FLIGHT_PASSENGERS.find((item) => item.id === selectedPassenger) ?? FLIGHT_PASSENGERS[0];

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out", overwrite: "auto" } });
      timeline
        .from("[data-flight-header]", { y: 18, autoAlpha: 0, duration: 0.5 })
        .from("[data-flight-tabs]", { y: 12, autoAlpha: 0, duration: 0.36 }, "-=0.18")
        .from("[data-passenger-ticket]", { y: 26, autoAlpha: 0, duration: 0.54, stagger: 0.12 }, "-=0.06");
      gsap.from("[data-flight-line]", { scaleY: 0, transformOrigin: "top", duration: 0.5, stagger: 0.12, ease: "power2.inOut", delay: 0.36 });
      gsap.from("[data-flight-plane]", { y: -14, rotation: -18, autoAlpha: 0, duration: 0.42, stagger: 0.12, ease: "back.out(1.6)", delay: 0.52 });
      return () => timeline.kill();
    });
    return () => media.revert();
  }, { scope: screenRef, dependencies: [selectedFlight], revertOnUpdate: true });

  return (
    <AppScreen appBar={{ title: "항공권" }}>
      <main ref={screenRef} className="min-h-full w-full bg-[#f5f9fd] px-4 pb-10 pt-5">
        <section data-flight-header className="rounded-[28px] bg-[linear-gradient(135deg,#071c4a_0%,#0c3f85_62%,#2789c9_100%)] px-5 py-5 text-white shadow-[0_20px_44px_-30px_rgba(4,44,103,0.9)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#acd6f6]">KOREAN AIR · BANGKOK 2026</p>
              <TextEffect as="h1" per="word" preset="fade-in-blur" speedReveal={1.8} className="mt-2 text-2xl font-black tracking-[-0.055em]" segmentTransition={{ duration: 0.28 }}>
                {`${passenger.name}의 티켓`}
              </TextEffect>
            </div>
            <span className="rounded-lg bg-white px-2.5 py-2 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={KOREAN_AIR_LOGO_URL} alt="대한항공" className="h-5 w-auto" />
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold text-white/80">개별 구간과 터미널 정보를 확인하세요.</p>
        </section>

        <section data-flight-tabs className="mt-5">
          <Tabs selectedKey={selectedPassenger} onSelectionChange={(key) => {
            const nextPassenger = String(key) as FlightPassengerId;
            setSelectedPassenger(nextPassenger);
            setSelectedFlight(FLIGHT_TICKETS[nextPassenger][0].id);
          }}>
            <Tabs.ListContainer>
              <Tabs.List aria-label="탑승객" className="grid h-13 w-full grid-cols-2 rounded-2xl bg-[#e9f1f9] p-1.5 *:h-10 *:w-full">
                {FLIGHT_PASSENGERS.map((item) => (
                  <Tabs.Tab key={item.id} id={item.id} className="relative z-0 flex gap-2 rounded-xl text-sm font-extrabold text-slate-500 data-[selected=true]:text-[#0a3479]">
                    <Avatar className="size-6"><AvatarImage src={item.image} alt="" /><AvatarFallback>{item.initials}</AvatarFallback></Avatar>
                    {item.name}
                    <Tabs.Indicator className="-z-10 rounded-xl bg-white shadow-[0_4px_12px_-7px_rgba(6,48,107,0.65)]" />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          <Tabs className="mt-3" selectedKey={selectedFlight} onSelectionChange={(key) => setSelectedFlight(String(key) as typeof selectedFlight)}>
            <Tabs.ListContainer>
              <Tabs.List aria-label={`${passenger.name}의 구간`} className="grid h-11 w-full grid-cols-2 rounded-xl bg-white p-1 ring-1 ring-[#dce8f3] *:h-9 *:w-full">
                {tickets.map((item) => (
                  <Tabs.Tab key={item.id} id={item.id} className="relative z-0 rounded-lg text-xs font-extrabold text-slate-500 data-[selected=true]:text-[#0a3479]">
                    {item.label} · {item.departure.code} → {item.arrival.code}
                    <Tabs.Indicator className="-z-10 rounded-lg bg-[#eaf4fc]" />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          <div className="mt-4 flex items-center gap-2 px-1 text-xs font-semibold text-[#4772a1]"><Check className="size-4" aria-hidden="true" />{flight.duration} · {flight.flightNumber} · {flight.departure.terminal ?? "출발 터미널 확인"}</div>
        </section>

        <section className="mt-4 space-y-4" aria-label={`${flight.label} 탑승객 티켓`}>
          <PassengerTicket key={`${flight.id}-${passenger.id}`} passenger={passenger} flight={flight} />
          <div className="flex items-center gap-2 rounded-2xl border border-[#dce9f5] bg-white px-4 py-3 text-xs font-semibold text-slate-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={KOREAN_AIR_MARK_URL} alt="" className="size-4" />
            탑승객별 항공편과 터미널 정보는 각각 독립적으로 관리됩니다.
          </div>
        </section>
      </main>
    </AppScreen>
  );
};
