"use client";

import React from "react";
import { Button, Card, Tabs } from "@heroui/react";
import { ArrowUpRight, Plane } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { FLIGHT_PASSENGERS, FLIGHT_TICKETS, type FlightPassengerId } from "@/lib/flights";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

gsap.registerPlugin(useGSAP);

interface FlightWidgetProps {
  onOpen: (passengerId: FlightPassengerId) => void;
}

export function FlightWidget({ onOpen }: FlightWidgetProps) {
  const widgetRef = React.useRef<HTMLDivElement>(null);
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
        .from("[data-ticket-content]", { y: 12, autoAlpha: 0, duration: 0.38 })
        .from("[data-ticket-time]", { y: 8, autoAlpha: 0, duration: 0.3, stagger: 0.07 }, "-=0.2")
        .from("[data-ticket-footer]", { y: 8, autoAlpha: 0, duration: 0.28 }, "-=0.16");
      return () => timeline.kill();
    });
    return () => media.revert();
  }, { scope: widgetRef, dependencies: [selectedPassenger, selectedFlight], revertOnUpdate: true });

  return (
    <Card ref={widgetRef} className="overflow-hidden rounded-[28px] border border-[#d5e1ef] bg-white p-0 shadow-[0_20px_42px_-34px_rgba(3,41,91,0.72)]">
      <Card.Content className="p-0">
        <div className="px-5 pb-5 pt-4">
          <Tabs variant="secondary" selectedKey={selectedPassenger} onSelectionChange={(key) => {
            const nextPassenger = String(key) as FlightPassengerId;
            setSelectedPassenger(nextPassenger);
            setSelectedFlight(FLIGHT_TICKETS[nextPassenger][0].id);
          }}>
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
              <Tabs variant="secondary" selectedKey={selectedFlight} onSelectionChange={(key) => setSelectedFlight(String(key) as typeof selectedFlight)}>
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
                <Tabs.Panel id={selectedFlight} className="pt-4" data-ticket-content>
                  <div className="grid grid-cols-[minmax(0,1fr)_42px_minmax(0,1fr)] items-center gap-1">
                    <div data-ticket-time>
                      <p className="text-[11px] font-bold text-[#5b83ab]">{flight.date.slice(5)} ({flight.day})</p>
                      <p className="mt-1 text-3xl font-black tracking-[-0.07em] text-[#0b3478] tabular-nums">{flight.departure.time}</p>
                      <p className="mt-1 text-sm font-black text-[#0b3478]">{flight.departure.code}</p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-500">{flight.departure.airport}{flight.departure.terminal ? ` · ${flight.departure.terminal}` : ""}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 text-[#4e93ca]" aria-label={`${flight.duration} 비행`}>
                      <span className="h-px w-full bg-[#b9d5ed]" /><Plane className="size-4 -rotate-45" aria-hidden="true" /><span className="h-px w-full bg-[#b9d5ed]" />
                    </div>
                    <div data-ticket-time className="text-right">
                      <p className="text-[11px] font-bold text-[#5b83ab]">{flight.arrival.nextDay ? "+1일 도착" : flight.duration}</p>
                      <p className="mt-1 text-3xl font-black tracking-[-0.07em] text-[#0b3478] tabular-nums">{flight.arrival.time}</p>
                      <p className="mt-1 text-sm font-black text-[#0b3478]">{flight.arrival.code}</p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-500">{flight.arrival.airport}{flight.arrival.terminal ? ` · ${flight.arrival.terminal}` : ""}</p>
                    </div>
                  </div>
                  <div data-ticket-footer className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[#d8e5f1] pt-4">
                    <div className="flex items-center gap-2" aria-label={`탑승객 ${passenger.name}`}><Avatar className="size-8 bg-sky-100"><AvatarImage src={passenger.image} alt="" /><AvatarFallback>{passenger.initials}</AvatarFallback></Avatar><span className="text-xs font-semibold text-slate-500">{passenger.name} 티켓</span></div>
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
