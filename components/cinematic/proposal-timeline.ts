export type CutId =
  | "g-tower"
  | "minu-bday-2025"
  | "dating-start"
  | "wotagei"
  | "gahyun-bday"
  | "adventure"
  | "minu-bday-2026"
  | "flight-out"
  | "proposal"
  | "flight-home"
  | "tbc";

/** 만화 오버레이 강도. */
export type CutEnergy = "calm" | "warm" | "high";

export interface CinematicCut {
  id: CutId;
  caption: string;
  duration: number;
  energy: CutEnergy;
  /** 캡션 위에 작게 붙는 날짜 태그. */
  tag?: string;
}

export const CINEMATIC_CUTS: CinematicCut[] = [
  { id: "g-tower", caption: "코웨이 G타워에서 마주친 그날", duration: 10, energy: "calm", tag: "2025.02.14" },
  { id: "minu-bday-2025", caption: "미누쿤 생일", duration: 6.5, energy: "warm", tag: "2025.05.27" },
  { id: "dating-start", caption: "우리 1일", duration: 7, energy: "warm", tag: "2025.08.31" },
  { id: "wotagei", caption: "둘이서 오타게 대폭발", duration: 12, energy: "high", tag: "2025.09.13" },
  { id: "gahyun-bday", caption: "가현짱 생일", duration: 6.5, energy: "warm", tag: "2025.10.31" },
  { id: "adventure", caption: "여기저기 모험을 떠남", duration: 10, energy: "high", tag: "2025 — 2026" },
  { id: "minu-bday-2026", caption: "미누쿤 생일", duration: 6.5, energy: "warm", tag: "2026.05.27" },
  { id: "flight-out", caption: "인천 → 수완나품", duration: 8, energy: "high", tag: "TAKE OFF" },
  // 문구는 나중에 직접 채워 넣는다. 비어 있으면 캡션 패널이 뜨지 않는다.
  { id: "proposal", caption: "", duration: 15, energy: "warm", tag: "KOH SICHANG" },
  { id: "flight-home", caption: "수완나품 → 인천", duration: 7, energy: "warm", tag: "COMING HOME" },
  { id: "tbc", caption: "내 멍멍이. ❣️🏡 내 가현짱", duration: 10, energy: "high", tag: "TO BE CONTINUED" },
];

export const CINEMATIC_TOTAL_DURATION = CINEMATIC_CUTS.reduce((sum, cut) => sum + cut.duration, 0);
export const REDUCED_MOTION_TIME_SCALE = 8;
export const TBC_CAPTION = "내 멍멍이. ❣️🏡 내 가현짱";

export const CINEMATIC_ASSETS = [
  "/cinematic/g-tower.png",
  "/cinematic/cafe-table.png",
  "/cinematic/miku.png",
  "/cinematic/to-be-continued.png",
  "/cinematic/birthday/minu-2025.jpg",
  "/cinematic/birthday/gahyun-2025.jpg",
  "/cinematic/birthday/minu-2026.jpg",
  "/cinematic/adventure/01.jpg",
  "/cinematic/adventure/02.jpg",
  "/cinematic/adventure/03.jpg",
] as const;

export interface ActiveCut {
  cut: CinematicCut;
  localTime: number;
  progress: number;
  start: number;
}

export function getCutAt(time: number): ActiveCut {
  const clamped = Math.max(0, time);
  let cursor = 0;

  for (const cut of CINEMATIC_CUTS) {
    if (clamped < cursor + cut.duration) {
      const localTime = clamped - cursor;
      return {
        cut,
        localTime,
        progress: localTime / cut.duration,
        start: cursor,
      };
    }
    cursor += cut.duration;
  }

  const last = CINEMATIC_CUTS[CINEMATIC_CUTS.length - 1];
  return { cut: last, localTime: last.duration, progress: 1, start: cursor - last.duration };
}
