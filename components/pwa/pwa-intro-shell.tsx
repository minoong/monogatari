import { pwaIntroBleedClassName, pwaIntroBleedStyle } from "@/components/pwa/pwa-intro-layout";

export function PwaIntroShell() {
  return (
    <div
      aria-busy="true"
      aria-label="앱을 불러오는 중"
      className={`${pwaIntroBleedClassName} z-[120] grid place-items-center bg-neutral-950 text-white`}
      style={pwaIntroBleedStyle}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.22),rgba(2,6,23,0.72))]" />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="text-sm font-black tracking-[0.14em] text-white/70">가현쨩 ❤️ 미누쿤</p>
        <p className="mt-5 text-7xl font-black leading-none tabular-nums">…</p>
      </div>
    </div>
  );
}
