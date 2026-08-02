"use client";

import React from "react";
import { Button, Card, Tabs } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";
import { FLIGHT_PASSENGERS, FLIGHT_TICKETS, KOREAN_AIR_LOGO_URL, KOREAN_AIR_MARK_URL, type FlightPassengerId } from "@/lib/flights";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StateTextRoll } from "@/components/core/state-text-roll";
import { SlidingNumber } from "@/components/core/sliding-number";

interface FlightWidgetProps {
  onOpen: (passengerId: FlightPassengerId) => void;
}

function getDurationParts(duration: string) {
  const match = duration.match(/(\d+)시간\s*(\d+)분/);
  return { hours: Number(match?.[1] ?? 0), minutes: Number(match?.[2] ?? 0) };
}

export function FlightWidget({ onOpen }: FlightWidgetProps) {
  const [selectedPassenger, setSelectedPassenger] = React.useState<FlightPassengerId>("gahyun");
  const tickets = FLIGHT_TICKETS[selectedPassenger];
  const [selectedFlight, setSelectedFlight] = React.useState(tickets[0].id);
  const [transitionKey, setTransitionKey] = React.useState(0);
  const flight = tickets.find((item) => item.id === selectedFlight) ?? tickets[0];
  const passenger = FLIGHT_PASSENGERS.find((item) => item.id === selectedPassenger) ?? FLIGHT_PASSENGERS[0];
const duration = getDurationParts(flight.duration);
  const [previousFlight, setPreviousFlight] = React.useState(flight);
  const [previousPassenger, setPreviousPassenger] = React.useState(passenger);

  const handlePassengerSelection = (key: React.Key) => {
    const nextPassenger = String(key) as FlightPassengerId;
    setPreviousFlight(flight);
    setPreviousPassenger(passenger);
    setSelectedPassenger(nextPassenger);
    setSelectedFlight(FLIGHT_TICKETS[nextPassenger][0].id);
    setTransitionKey((version) => version + 1);
  };

  const handleFlightSelection = (key: React.Key) => {
    setPreviousFlight(flight);
    setPreviousPassenger(passenger);
    setSelectedFlight(String(key) as typeof selectedFlight);
    setTransitionKey((version) => version + 1);
  };

  return (
    <Card className="overflow-hidden rounded-[28px] border border-[#d5e1ef] bg-white p-0 shadow-[0_20px_42px_-34px_rgba(3,41,91,0.72)]">
      <Card.Content className="p-0">
        <div className="px-5 pb-5 pt-4">
          <div className="mb-1 flex justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={KOREAN_AIR_LOGO_URL} alt="대한항공" className="h-4 w-auto" />
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
            <Tabs.Panel id={selectedPassenger} className="pt-3">
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
                <Tabs.Panel id={selectedFlight} className="pt-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(76px,0.72fr)_minmax(0,1fr)] items-center gap-2">
                    <div>
                      <p className="text-[11px] font-bold text-[#5b83ab]"><StateTextRoll value={`${flight.date.slice(0, 4)}년 ${flight.date.slice(5)} (${flight.day})`} previousValue={`${previousFlight.date.slice(0, 4)}년 ${previousFlight.date.slice(5)} (${previousFlight.day})`} transitionKey={transitionKey} className="min-w-[10.5em]" /></p>
                      <p className="mt-1 text-3xl font-black tracking-[-0.07em] text-[#0b3478] tabular-nums"><StateTextRoll value={flight.departure.time} previousValue={previousFlight.departure.time} transitionKey={transitionKey} className="min-w-[2.85em]" /></p>
                      <p className="mt-1 text-sm font-black text-[#0b3478]"><StateTextRoll value={flight.departure.code} previousValue={previousFlight.departure.code} transitionKey={transitionKey} className="min-w-[2.5em]" /></p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-500">{flight.departure.airport}{flight.departure.terminal ? ` · ${flight.departure.terminal}` : ""}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-[#4e93ca]" aria-label={`${flight.duration} 비행`}>
                      <div className="flex items-center justify-center gap-0.5 whitespace-nowrap text-[10px] font-bold text-[#4772a1]" style={{ fontFamily: "var(--font-geist-mono)", fontVariantNumeric: "tabular-nums" }}>
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
                      <p className="mt-1 text-3xl font-black tracking-[-0.07em] text-[#0b3478] tabular-nums"><StateTextRoll value={flight.arrival.time} previousValue={previousFlight.arrival.time} transitionKey={transitionKey} className="w-full min-w-[3.15em] text-right" /></p>
                      <p className="mt-1 text-sm font-black text-[#0b3478]"><StateTextRoll value={flight.arrival.code} previousValue={previousFlight.arrival.code} transitionKey={transitionKey} className="w-full min-w-[2.7em] text-right" /></p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-500">{flight.arrival.airport}{flight.arrival.terminal ? ` · ${flight.arrival.terminal}` : ""}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-[#4772a1]">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf4fc] px-2.5 py-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={KOREAN_AIR_MARK_URL} alt="대한항공" className="size-3.5" />
                      {flight.flightNumber}
                    </span>
                    <span className="rounded-full bg-[#f2f6fa] px-2.5 py-1 text-slate-500">{flight.aircraft}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[#d8e5f1] pt-4">
                    <div className="flex items-center gap-2" aria-label={`탑승객 ${passenger.name}`}><Avatar className="size-8 bg-sky-100"><AvatarImage src={passenger.image} alt="" /><AvatarFallback>{passenger.initials}</AvatarFallback></Avatar><span className="text-xs font-semibold text-slate-500"><StateTextRoll value={`${passenger.name} 티켓`} previousValue={`${previousPassenger.name} 티켓`} transitionKey={transitionKey} className="min-w-[5.5em]" /></span></div>
                    <Button variant="ghost" size="sm" className="shrink-0 px-0 font-bold text-[#135ba9]" onPress={() => onOpen(selectedPassenger)}>티켓 보기 <ArrowUpRight className="size-4" aria-hidden="true" /></Button>
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
