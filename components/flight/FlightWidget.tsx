"use client";

import { Button, Card } from "@heroui/react";
import { ArrowUpRight, Plane } from "lucide-react";
import Image from "next/image";
import { FLIGHT_PASSENGERS, FLIGHT_ROUTE_LABEL, FLIGHT_SEGMENTS } from "@/lib/flights";
import { TextEffect } from "@/components/core/text-effect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FlightWidgetProps {
  onOpen: () => void;
}

export function FlightWidget({ onOpen }: FlightWidgetProps) {
  const [outbound, returnFlight] = FLIGHT_SEGMENTS;

  return (
    <Card className="overflow-hidden rounded-3xl border border-[#d7e6f7] bg-white p-0 shadow-[0_18px_42px_-30px_rgba(10,68,148,0.55)]">
      <Card.Content className="p-0">
        <div className="bg-[linear-gradient(135deg,#073778_0%,#0f63b4_54%,#5cbcec_100%)] px-5 pb-4 pt-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20"><Plane className="size-5 -rotate-45" aria-hidden="true" /></span>
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-white/70">KOREAN AIR</p>
                <p className="mt-0.5 text-sm font-semibold">우리의 방콕 왕복 항공권</p>
              </div>
            </div>
            <Image src="/korean-air-mark.svg" alt="Korean Air" width={176} height={44} className="h-6 w-auto brightness-0 invert" />
          </div>
          <TextEffect as="p" per="word" preset="slide" speedReveal={1.6} className="mt-5 text-2xl font-black tracking-[-0.045em]" segmentTransition={{ duration: 0.32 }}>
            {FLIGHT_ROUTE_LABEL}
          </TextEffect>
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {[outbound, returnFlight].map((flight) => (
              <div key={flight.id} className="min-w-0 rounded-2xl bg-[#f3f8fd] px-3 py-3">
                <p className="text-[11px] font-bold text-[#3977b5]">{flight.label}</p>
                <p className="mt-1 truncate text-sm font-extrabold text-[#102d5c]">{flight.departure.code} → {flight.arrival.code}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{flight.date.slice(5)} · {flight.flightNumber}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex -space-x-2" aria-label="탑승객 가현짱, 미누쿤">
              {FLIGHT_PASSENGERS.map((passenger) => (
                <Avatar key={passenger.id} className="size-8 border-2 border-white bg-sky-100">
                  <AvatarImage src={passenger.image} alt="" />
                  <AvatarFallback>{passenger.initials}</AvatarFallback>
                </Avatar>
              ))}
              <span className="pl-4 text-xs font-semibold text-slate-500">가현짱 · 미누쿤</span>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 font-bold text-[#135ba9]" onPress={onOpen}>
              상세 보기 <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
