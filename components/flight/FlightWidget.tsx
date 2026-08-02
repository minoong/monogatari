"use client";

import React from "react";
import { Button, Card, Tabs } from "@heroui/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ArrowUpRight } from "lucide-react";
import { FLIGHT_PASSENGERS, FLIGHT_TICKETS, FLIGHT_TICKET_NUMBERS, KOREAN_AIR_LOGO_URL, KOREAN_AIR_MARK_URL, getDefaultFlightSegmentId, type FlightPassengerId } from "@/lib/flights";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StateTextRoll } from "@/components/core/state-text-roll";
import { SlidingNumber } from "@/components/core/sliding-number";

interface FlightWidgetProps {
  onOpen: (passengerId: FlightPassengerId) => void;
}

const A330_SEAT_MAP_URL = "https://www.koreanair.com/contents/plan-your-travel/in-flight-experience/fleet/a330/300-276/seat-map";

function getDurationParts(duration: string) {
  const match = duration.match(/(\d+)시간\s*(\d+)분/);
  return { hours: Number(match?.[1] ?? 0), minutes: Number(match?.[2] ?? 0) };
}

function FlightTime({ value, align = "left" }: { value: string; align?: "left" | "right" }) {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);

  return (
    <span
      className={`inline-flex w-full items-center ${align === "right" ? "justify-end" : "justify-start"} leading-none`}
      style={{ fontFamily: "var(--font-korean-air)", fontVariantNumeric: "tabular-nums" }}
      aria-label={value}
    >
      <SlidingNumber value={hours} padStart aria-hidden="true" />
      <span className="px-px text-[#31558d]" aria-hidden="true">:</span>
      <SlidingNumber value={minutes} padStart aria-hidden="true" />
    </span>
  );
}

export function FlightWidget({ onOpen }: FlightWidgetProps) {
  const [selectedPassenger, setSelectedPassenger] = React.useState<FlightPassengerId>("gahyun");
  const tickets = FLIGHT_TICKETS[selectedPassenger];
  const [selectedFlight, setSelectedFlight] = React.useState(() => getDefaultFlightSegmentId());
  const [transitionKey, setTransitionKey] = React.useState(0);
  const flight = tickets.find((item) => item.id === selectedFlight) ?? tickets[0];
  const passenger = FLIGHT_PASSENGERS.find((item) => item.id === selectedPassenger) ?? FLIGHT_PASSENGERS[0];
  const ticketNumber = FLIGHT_TICKET_NUMBERS[selectedPassenger];
const duration = getDurationParts(flight.duration);
  const [previousFlight, setPreviousFlight] = React.useState(flight);
  const [previousPassenger, setPreviousPassenger] = React.useState(passenger);

  const handlePassengerSelection = (key: React.Key) => {
    const nextPassenger = String(key) as FlightPassengerId;
    setPreviousFlight(flight);
    setPreviousPassenger(passenger);
    setSelectedPassenger(nextPassenger);
    if (!FLIGHT_TICKETS[nextPassenger].some((item) => item.id === selectedFlight)) {
      setSelectedFlight(getDefaultFlightSegmentId());
    }
    setTransitionKey((version) => version + 1);
  };

  const handleFlightSelection = (key: React.Key) => {
    setPreviousFlight(flight);
    setPreviousPassenger(passenger);
    setSelectedFlight(String(key) as typeof selectedFlight);
    setTransitionKey((version) => version + 1);
  };

  return (
    <Card className="overflow-hidden rounded-[28px] border border-[#d5e1ef] bg-white p-0 shadow-[0_20px_42px_-34px_rgba(3,41,91,0.72)] [font-family:var(--font-korean-air)]">
      <Card.Content className="p-0">
        <div className="px-3 pb-4 pt-3 sm:px-5">
          <div className="mb-0.5 flex h-10 items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={KOREAN_AIR_LOGO_URL} alt="대한항공" className="h-5 w-auto" />
            <DotLottieReact
              src="/korean-air/airplane.lottie"
              autoplay
              loop
              aria-hidden="true"
              className="size-10 shrink-0"
            />
          </div>
          <Tabs variant="secondary" selectedKey={selectedPassenger} onSelectionChange={handlePassengerSelection}>
            <Tabs.ListContainer>
              <Tabs.List aria-label="탑승객" className="grid h-11 w-full grid-cols-2 border-b border-[#dce8f3] bg-transparent p-0 *:h-11 *:w-full">
                {FLIGHT_PASSENGERS.map((item) => (
                  <Tabs.Tab key={item.id} id={item.id} className="relative z-0 flex gap-2 rounded-none text-xs font-extrabold text-slate-400 data-[selected=true]:text-[#0b3478]">
                    <Avatar className="size-5"><AvatarImage src={item.image} alt="" /><AvatarFallback>{item.initials}</AvatarFallback></Avatar>
                    {item.name}
                    <Tabs.Indicator className="-z-10 bottom-0 h-0.5 rounded-full bg-[#1269b0]" />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel id={selectedPassenger} className="!px-0 !pb-0 !pt-2">
              <Tabs variant="secondary" selectedKey={selectedFlight} onSelectionChange={handleFlightSelection}>
                <Tabs.ListContainer>
                  <Tabs.List aria-label={`${passenger.name}의 항공편 구간`} className="grid h-9 w-full grid-cols-2 border-b border-[#e1ebf4] bg-transparent p-0 *:h-9 *:w-full">
                    {tickets.map((item) => (
                      <Tabs.Tab key={item.id} id={item.id} className="relative z-0 rounded-none text-[11px] font-bold text-slate-400 data-[selected=true]:text-[#0b3478]">
                        {item.label}
                        <Tabs.Indicator className="-z-10 bottom-0 h-0.5 rounded-full bg-[#66aedd]" />
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </Tabs.ListContainer>
                <Tabs.Panel id={selectedFlight} className="!px-0 !pb-0 !pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-bold text-[#5b83ab]"><StateTextRoll value={`${flight.date.slice(0, 4)}년 ${flight.date.slice(5)} (${flight.day})`} previousValue={`${previousFlight.date.slice(0, 4)}년 ${previousFlight.date.slice(5)} (${previousFlight.day})`} transitionKey={transitionKey} className="min-w-[10.5em]" /></p>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[9px] font-bold tracking-[0.12em] text-[#7995b4]">항공권 번호</p>
                      <p className="font-mono text-[10px] font-bold text-[#0b3478]" aria-label={`항공권 번호 ${ticketNumber}`}>{ticketNumber}</p>
                    </div>
                  </div>
                  <div className="relative mt-3 space-y-3 pl-12 md:hidden" aria-label={`${flight.duration} 비행`}>
                    <div className="absolute bottom-4 left-2 top-3 border-l-2 border-dotted border-[#91b7da]" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/korean-air/flight-to.svg" alt="" className="absolute left-0 top-1 size-5" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/korean-air/flight-dot.svg" alt="" className="absolute left-[3px] top-[48%] size-3" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/korean-air/flight-dot-from.svg" alt="" className="absolute bottom-1 left-[3px] size-3" aria-hidden="true" />
                    <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                      <div><p className="text-3xl font-black tracking-[-0.07em] text-[#0b3478] tabular-nums"><FlightTime value={flight.departure.time} /></p><p className="mt-1 text-[11px] font-semibold text-slate-500">{flight.departure.airport}{flight.departure.terminal ? ` · ${flight.departure.terminal}` : ""}</p></div>
                      <p className="pt-1 text-xl font-black text-[#0b3478]">{flight.departure.code}</p>
                    </div>
                    <div className="flex items-center gap-3 py-1.5 text-[#4772a1]"><span className="h-px flex-1 bg-[#d7e4ef]" /><span className="whitespace-nowrap text-[11px] font-bold">{flight.duration}</span><span className="h-px flex-1 bg-[#d7e4ef]" /></div>
                    <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                      <div><div className="flex items-start gap-1.5"><p className="text-3xl font-black tracking-[-0.07em] text-[#0b3478] tabular-nums"><FlightTime value={flight.arrival.time} /></p>{flight.arrival.nextDay ? <span className="pt-0.5 text-xs font-bold leading-none text-[#3e9468]">+1일</span> : null}</div><p className="mt-1 text-[11px] font-semibold text-slate-500">{flight.arrival.airport}{flight.arrival.terminal ? ` · ${flight.arrival.terminal}` : ""}</p></div>
                      <p className="pt-1 text-xl font-black text-[#0b3478]">{flight.arrival.code}</p>
                    </div>
                  </div>
                  <div className="mt-3 hidden grid-cols-[minmax(0,1fr)_minmax(76px,0.72fr)_minmax(0,1fr)] items-center gap-2 md:grid">
                    <div>
                      <p className="text-3xl font-black tracking-[-0.07em] text-[#0b3478] tabular-nums"><FlightTime value={flight.departure.time} /></p>
                      <p className="mt-1 text-sm font-black text-[#0b3478]"><StateTextRoll value={flight.departure.code} previousValue={previousFlight.departure.code} transitionKey={transitionKey} className="min-w-[2.5em]" /></p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-500">{flight.departure.airport}{flight.departure.terminal ? ` · ${flight.departure.terminal}` : ""}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-[#4e93ca]" aria-label={`${flight.duration} 비행`}>
                      <div className="flex items-center justify-center gap-0.5 whitespace-nowrap text-[10px] font-bold text-[#4772a1]" style={{ fontFamily: "var(--font-korean-air)", fontVariantNumeric: "tabular-nums" }}>
                        <SlidingNumber value={duration.hours} />
                        <span>시간</span>
                        <SlidingNumber value={duration.minutes} padStart />
                        <span>분</span>
                      </div>
                      <div className="flex w-full items-center gap-1.5" aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/korean-air/flight-to.svg" alt="" className="size-5 shrink-0" />
                        <span className="h-px min-w-0 flex-1 border-t border-dashed border-[#91b7da]" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/korean-air/flight-dot.svg" alt="" className="size-3 shrink-0" />
                        <span className="h-px min-w-0 flex-1 border-t border-dashed border-[#91b7da]" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/korean-air/flight-dot-from.svg" alt="" className="size-3 shrink-0" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="h-[1.35em] text-[11px] font-bold text-[#5b83ab]">{flight.arrival.nextDay ? <StateTextRoll value="+1일 도착" previousValue={previousFlight.arrival.nextDay ? "+1일 도착" : ""} transitionKey={transitionKey} className="min-w-[5.7em] text-right" /> : null}</p>
                      <p className="mt-1 text-3xl font-black tracking-[-0.07em] text-[#0b3478] tabular-nums"><FlightTime value={flight.arrival.time} align="right" /></p>
                      <p className="mt-1 text-sm font-black text-[#0b3478]"><StateTextRoll value={flight.arrival.code} previousValue={previousFlight.arrival.code} transitionKey={transitionKey} className="w-full min-w-[2.7em] text-right" /></p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-500">{flight.arrival.airport}{flight.arrival.terminal ? ` · ${flight.arrival.terminal}` : ""}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-xl bg-[#f5f6f7] px-3 py-2 text-[#0b3478]">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={KOREAN_AIR_MARK_URL} alt="대한항공" className="size-3.5" />
                      {flight.flightNumber}
                    </span>
                    <a
                      href={A330_SEAT_MAP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold underline decoration-1 underline-offset-3 transition-colors hover:text-[#2778be] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2778be] focus-visible:ring-offset-2"
                    >
                      {flight.aircraft}
                    </a>
                    <span className="text-[11px] font-bold">{flight.cabin}</span>
                    <span className="rounded-full bg-[#e1f3fd] px-2 py-0.5 text-[10px] font-bold">{flight.fareFamily}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-[#d8e5f1] pt-3">
                    <div className="flex items-center gap-2" aria-label={`탑승객 ${passenger.name}`}><span key={selectedPassenger} className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-75 motion-safe:duration-200"><Avatar className="size-8 bg-sky-100"><AvatarImage src={passenger.image} alt="" /><AvatarFallback>{passenger.initials}</AvatarFallback></Avatar></span><span className="text-xs font-semibold text-slate-500"><StateTextRoll value={`${passenger.name} 티켓`} previousValue={`${previousPassenger.name} 티켓`} transitionKey={transitionKey} className="min-w-[5.5em]" /></span></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!h-5 !min-h-0 !min-w-0 !gap-1 !rounded-none !px-0 !py-0 font-bold text-[#135ba9] ![--button-bg-hover:transparent] ![--button-bg-pressed:transparent] hover:text-[#0b3478]"
                      onPress={() => onOpen(selectedPassenger)}
                    >
                      티켓 보기 <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </Tabs.Panel>
              </Tabs>
            </Tabs.Panel>
          </Tabs>
        </div>
      </Card.Content>
    </Card>
  );
}
