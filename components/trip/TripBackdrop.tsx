"use client";

import { useTrip } from "@/components/providers/trip-provider";

/**
 * 홈 상단에 깔리는 여행 테마 배경. 아래로 갈수록 투명해져 본문 가독성을 해치지 않는다.
 * 움직임은 CSS 애니메이션뿐이라 가볍고, 움직임 줄이기를 켠 환경에서는 정지한다(globals.css).
 */
export function TripBackdrop({ className }: { className?: string }) {
  const { trip } = useTrip();
  const backdrop = trip.theme.backdrop;
  if (backdrop.kind === "none") return null;

  return (
    <div
      aria-hidden
      className={className}
      style={{
        // 빛 덩어리가 화면 오른쪽 밖으로 나가도 홈이 가로로 스크롤되지 않도록 잘라낸다.
        overflow: "hidden",
        background: backdrop.gradient,
        maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
      }}
    >
      {backdrop.puffColors.map((color, index) => (
        <span
          className="trip-steam-puff"
          key={color}
          style={{
            background: `radial-gradient(closest-side, ${color}, transparent)`,
            left: `${[8, 38, 66][index % 3]}%`,
            animationDelay: `${index * -5}s`,
            animationDuration: `${16 + index * 4}s`,
          }}
        />
      ))}
    </div>
  );
}
