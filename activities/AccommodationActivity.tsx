import React from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Accessibility, AirVent, AlarmClock, Armchair, Baby, Banknote, Bath, BedDouble, Bike, Blinds, Building2, BusFront, CalendarDays, Camera, ChefHat, Cigarette, CigaretteOff, CircleParking, Clock3, Coffee, ConciergeBell, CookingPot, CreditCard, Dumbbell, ExternalLink, FireExtinguisher, Flame, Flower2, GlassWater, KeyRound, Languages, Laptop, Luggage, Map, MapPin, Microwave, Mountain, PackageCheck, PawPrint, PenOff, Plane, Refrigerator, Router, ShowerHead, ShieldCheck, Shirt, ShoppingBag, Snowflake, Sparkles, SprayCan, Star, TentTree, Thermometer, Ticket, Trash2, Trees, Tv, Utensils, Vault, WashingMachine, Waves, Wifi, Wine, Wrench, type LucideIcon } from "lucide-react";
import { Tabs } from "@heroui/react";
import { triggerHapticFeedback } from "../components/BottomNav";
import { CompactSegmentedTabsList } from "../components/ui/compact-segmented-tabs";
import { ACCOMMODATIONS, formatStayCheckDateTime, getStayCheckoutDate, type Accommodation } from "../lib/accommodations";
import { cn } from "../lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const amenityIconEntries: Array<[LucideIcon, string[]]> = [
  [Wifi, ["Wi-Fi (공용 구역)", "Wi‑Fi (공용 구역)", "Wi-Fi (무료)", "Wi‑Fi (무료)", "무료 Wi-Fi", "무료 Wi-Fi (모든 객실)", "무료 Wi‑Fi (모든 객실)", "무선인터넷", "유선인터넷(무료)"]],
  [Router, ["인터넷", "인터넷 서비스"]],
  [Languages, ["영어", "태국어"]],
  [Clock3, ["24시간 경비", "24시간 경비 서비스", "24시간 상시 체크인"]],
  [ConciergeBell, ["24시간 프런트", "24시간 프런트 데스크", "룸서비스", "컨시어지", "호텔 룸서비스용 앱"]],
  [ShieldCheck, ["공용 구역 CCTV", "공용 구역 내 CCTV", "숙소 외부 CCTV", "안전/보안 시설/서비스", "공용 구역의 안전 보호막", "신체적 거리 두기 (최소 1m)", "안전한 식사 환경 조성", "직원 대상 안전 규정 교육", "직원의 안면 보호 장구 착용"]],
  [CreditCard, ["무현금 결제 서비스"]],
  [FireExtinguisher, ["소화기", "소화기 (Fire extinguisher)", "연기 감지기", "화재감지기"]],
  [SprayCan, ["구급상자", "객실 소독 제외 가능", "리넨 및 세탁물 온수 세탁", "마스크 무료 제공", "매일 소독", "모든 객실 매일 소독", "손 소독제", "안티 바이러스 청소 용품", "위생 인증", "주방 및 식기류 소독", "투숙 간 객실 소독", "투숙객 및 직원 대상 체온 측정", "살균/소독 장비"]],
  [Thermometer, ["체온계"]],
  [KeyRound, ["익스프레스 체크인/체크아웃", "프라이빗 체크인/체크아웃", "전자 객실 키"]],
  [Luggage, ["여행 가방 보관 서비스"]],
  [Accessibility, ["휠체어 접근 가능", "장애인용 편의 시설/서비스", "지체/이동 장애인 친화형 편의"]],
  [Baby, ["패밀리룸", "가족/아동 여행객 친화형 시설", "아동용 수영장", "유아용 침대(요청 시)"]],
  [CircleParking, ["무료 주차", "주차장(무료)", "숙소 근처 주차장", "숙소 내 주차장"]],
  [BusFront, ["공항 셔틀", "공항 이동 교통편 서비스", "셔틀 서비스", "택시 서비스"]],
  [Waves, ["수영장", "수영장 시설", "실외 수영장", "전망이 있는 수영장", "전용 수영장", "전용탕", "스노클링"]],
  [Bath, ["욕조 및 샤워실", "프라이빗 욕실"]],
  [ShowerHead, ["샤워실", "세면도구", "슬리퍼", "타월"]],
  [Mountain, ["등산로"]],
  [Trees, ["정원", "야외용 가구"]],
  [TentTree, ["테라스", "발코니/테라스"]],
  [Bike, ["자전거"]],
  [Dumbbell, ["체육관/피트니스", "피트니스 센터"]],
  [Flower2, ["마사지", "사우나", "스팀룸/한증실", "스파/사우나"]],
  [Utensils, ["단품 요리 레스토랑", "레스토랑", "샐러드 레스토랑", "스프 레스토랑", "조식 레스토랑", "주방", "식기세척기", "식사 공간", "식탁"]],
  [ChefHat, ["미국식 조식", "아시아식 조식", "유럽식 조식", "조식 서비스"]],
  [Coffee, ["디저트 카페", "카페", "커피숍", "조식 뷔페", "커피/티 메이커", "무료 인스턴트 커피", "무료 차"]],
  [Wine, ["바", "주류", "미니바"]],
  [GlassWater, ["생수(병)", "무료 생수"]],
  [ShoppingBag, ["음식 배달", "상점", "편의점"]],
  [AirVent, ["공용 구역 내 냉방", "에어컨"]],
  [Snowflake, ["개별 에어컨"]],
  [Flame, ["난로"]],
  [CigaretteOff, ["금연", "금연 객실", "금연 숙소"]],
  [WashingMachine, ["세탁 서비스", "다림질 서비스", "드라이클리닝"]],
  [Shirt, ["단장/미용 서비스", "미용실", "헤어드라이어", "옷 거는 행거", "옷장"]],
  [Refrigerator, ["냉장고"]],
  [Microwave, ["전자레인지"]],
  [CookingPot, ["간이주방", "전기 주전자", "주전자"]],
  [BedDouble, ["리넨", "숙면용 편의 용품", "접이식 침대"]],
  [Armchair, ["소파", "휴식 공간", "공용 라운지/TV 시청 구역"]],
  [Camera, ["거울"]],
  [Tv, ["DVD/CD 플레이어", "위성 방송/케이블 방송", "스트리밍 서비스"]],
  [Vault, ["객실 내 안전 금고", "안전 금고"]],
  [AlarmClock, ["모닝콜 서비스", "알람시계"]],
  [Laptop, ["컴퓨터 사용 가능 구역", "책상", "전화기", "침대 옆 콘센트"]],
  [Ticket, ["티켓 서비스"]],
  [Map, ["여행 안내소"]],
  [PawPrint, ["반려동물 불가"]],
  [Building2, ["계단 이용 가능", "고층", "외부 복도", "성인 전용 숙소", "엘리베이터", "엘리베이터 없음", "엘리베이터 이용 가능", "저층 객실 이용 가능", "열리는 창문", "창문", "회의/연회 시설"]],
  [Sparkles, ["일일 청소", "일일 청소 서비스", "청소용품"]],
  [PackageCheck, ["개별 포장된 음식"]],
  [PenOff, ["공용 문구류 비치 제외"]],
  [Wrench, ["복사기/팩스"]],
  [Banknote, ["현금 인출기"]],
  [Cigarette, ["흡연 가능", "흡연 구역"]],
  [Blinds, ["암막 커튼"]],
  [Trash2, ["휴지통"]],
];

const amenityIconMap = Object.fromEntries(
  amenityIconEntries.flatMap(([icon, items]) => items.map((item) => [item, icon])),
) as Record<string, LucideIcon>;

const getAmenityIcon = (item: string) => amenityIconMap[item] ?? Building2;

const AmenitySvgIcon: React.FC<{ item: string }> = ({ item }) => {
  const Icon = getAmenityIcon(item);

  return React.createElement(Icon, {
    "aria-hidden": true,
    className: "amenity-svg shrink-0 text-gray-400 dark:text-gray-500",
    size: 14,
    strokeWidth: 1.7,
  });
};

const findScrollContainer = (element: HTMLElement | null) => {
  let parent = element?.parentElement ?? null;

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if ((overflowY === "auto" || overflowY === "scroll") && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return undefined;
};

type StayFilter = "all" | Accommodation["id"];

interface AccommodationActivityProps {
  params: { stayId?: string };
}

const getInitialStayFilter = (stayId?: string): StayFilter =>
  stayId === "all" || ACCOMMODATIONS.some((stay) => stay.id === stayId)
    ? stayId as StayFilter
    : "all";

export const AccommodationActivity: React.FC<AccommodationActivityProps> = ({ params }) => {
  const initialFilter = getInitialStayFilter(params.stayId);
  const [activeFilter, setActiveFilter] = React.useState<StayFilter>(initialFilter);
  const amenitiesRef = React.useRef<HTMLDivElement>(null);
  const visibleStays = activeFilter === "all"
    ? ACCOMMODATIONS
    : ACCOMMODATIONS.filter((stay) => stay.id === activeFilter);

  useGSAP(() => {
    const media = gsap.matchMedia();
    const scroller = findScrollContainer(amenitiesRef.current);

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const icons = gsap.utils.toArray<SVGSVGElement>(".amenity-svg");
      const triggers = icons.map((icon) => {
        const paths = Array.from(icon.querySelectorAll<SVGGeometryElement>("path, line, polyline, polygon, rect, circle"))
          .filter((path) => typeof path.getTotalLength === "function");

        paths.forEach((path) => {
          const length = path.getTotalLength();
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        });

        return ScrollTrigger.create({
          trigger: icon,
          scroller,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(paths, {
              strokeDashoffset: 0,
              duration: 0.48,
              ease: "power2.out",
              stagger: 0.035,
              overwrite: "auto",
            });
          },
        });
      });

      ScrollTrigger.refresh();

      return () => triggers.forEach((trigger) => trigger.kill());
    });

    return () => media.revert();
  }, { scope: amenitiesRef, dependencies: [activeFilter], revertOnUpdate: true });

  return (
    <AppScreen appBar={{ title: "숙소 자세히 보기" }}>
      <div ref={amenitiesRef} className="min-h-full w-full bg-white pb-16 dark:bg-black">
        <Tabs
          className="w-full"
          selectedKey={activeFilter}
          onSelectionChange={(key) => {
            triggerHapticFeedback(10);
            setActiveFilter(String(key) as StayFilter);
          }}
        >
          <CompactSegmentedTabsList
            ariaLabel="숙소 일정"
            className="px-4 pb-3 pt-4"
            listClassName="mx-auto w-full max-w-lg"
            items={[
              { id: "all", label: "전체" },
              ...ACCOMMODATIONS.map((stay) => ({ id: stay.id, label: stay.city })),
            ]}
          />

          <div className="mt-2 flex flex-col">
          {visibleStays.map((stay, stayIndex) => (
            <article key={stay.id} className={cn("flex flex-col", stayIndex > 0 && "mt-10 border-t border-gray-100 pt-10 dark:border-white/10")}>
              <div
                role="img"
                aria-label={`${stay.name} 대표 이미지`}
                className="relative h-52 bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(180deg, transparent 45%, rgba(0,0,0,.58)), url(${stay.imageUrl})` }}
              >
                <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {stay.date} · {stay.city}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                  <div className="min-w-0 flex-1">
                    <p className="text-balance text-lg font-bold leading-tight">{stay.name}</p>
                    <p className="mt-0.5 text-xs leading-4 text-white/80">{stay.englishName}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-sm font-bold backdrop-blur-sm"><Star size={14} fill="currentColor" /> {stay.score}</span>
                </div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-white/10">
                <div className="grid grid-cols-2 gap-4 px-4 py-3.5">
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400"><CalendarDays size={13} /> 체크인</span>
                    <p className="mt-1 text-sm font-bold leading-5 text-gray-900 dark:text-gray-100">{formatStayCheckDateTime(stay.date, stay.checkIn)}</p>
                  </div>
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400"><Clock3 size={13} /> 체크아웃</span>
                    <p className="mt-1 text-sm font-bold leading-5 text-gray-900 dark:text-gray-100">{formatStayCheckDateTime(getStayCheckoutDate(stay.date), stay.checkOut)}</p>
                  </div>
                </div>

                <div>
                  <iframe
                    title={`${stay.name} Google 지도`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(stay.mapQuery)}&output=embed`}
                    loading="lazy"
                    className="h-44 w-full border-0"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <p className="px-4 py-3 text-xs leading-5 text-gray-500 dark:text-gray-400"><MapPin className="mr-1 inline text-indigo-500" size={13} />{stay.address}</p>
                </div>

                {stay.importantInfo ? (
                  <>
                    <div className="flex gap-3 px-4 py-3.5">
                      <span className="flex size-8 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500"><Coffee size={16} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold tracking-wide text-gray-400 dark:text-gray-500">조식</p>
                        <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-gray-100">{stay.importantInfo.breakfast.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-gray-600 dark:text-gray-300">{stay.importantInfo.breakfast.details}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 px-4 py-3.5">
                      <span className="flex size-8 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500"><Plane size={16} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold tracking-wide text-gray-400 dark:text-gray-500">셔틀</p>
                        <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-gray-100">{stay.importantInfo.shuttle.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-gray-600 dark:text-gray-300">{stay.importantInfo.shuttle.details}</p>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="flex gap-3 px-4 py-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500"><Coffee size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold tracking-wide text-gray-400 dark:text-gray-500">식사 · 레스토랑</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-gray-100">{stay.dining.primary}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{stay.dining.details.join(" · ")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 px-4 py-3.5">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.mapQuery)}`} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 transition-transform active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100">
                    Google 지도 <ExternalLink size={14} />
                  </a>
                  <a href={stay.agodaUrl} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#5392f9] text-xs font-bold text-white transition-transform active:scale-[0.98]">
                    Agoda 예약 정보 <ExternalLink size={14} />
                  </a>
                </div>

                <section className="px-4 py-4">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">편의시설 · 서비스</h2>
                  <div className="mt-4 flex flex-col gap-5">
                    {stay.facilityGroups.map((group) => (
                      <section key={group.title}>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400">{group.title}</h3>
                        <ul className="mt-2 divide-y divide-gray-100 dark:divide-white/10">
                          {group.items.map((item) => (
                            <li key={item} className="flex items-center gap-2.5 py-2.5 text-sm text-gray-700 dark:text-gray-300">
                              <AmenitySvgIcon item={item} />
                              <span className="min-w-0 flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </section>

                {stay.notice ? <p className="px-4 pb-4 text-xs leading-5 text-amber-800 dark:text-amber-200">{stay.notice}</p> : null}
              </div>
            </article>
          ))}
        </div>
        </Tabs>
      </div>
    </AppScreen>
  );
};
