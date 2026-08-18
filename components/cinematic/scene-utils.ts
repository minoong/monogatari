export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const smooth = (value: number) => {
  const v = clamp01(value);
  return v * v * (3 - 2 * v);
};

/** progress 구간 [from, to]을 0~1로 되돌린다. */
export const seg = (progress: number, from: number, to: number) =>
  clamp01((progress - from) / (to - from));

export const easeOutBack = (value: number) => {
  const v = clamp01(value);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (v - 1) ** 3 + c1 * (v - 1) ** 2;
};

export const pulse = (value: number) => Math.sin(clamp01(value) * Math.PI);

/** 모바일 세로 화면 기준 디자인 박스. 모든 씬이 같은 프레임을 공유한다. */
export const STAGE_WIDTH = 7.6;
export const STAGE_HEIGHT = 13;
