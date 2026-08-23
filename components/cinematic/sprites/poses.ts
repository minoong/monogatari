import { basePose, type CharacterPose } from "@/components/cinematic/sprites/pixel-character";

const TAU = Math.PI * 2;
const UP = Math.PI;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const v = clamp01(value);
  return v * v * (3 - 2 * v);
};

/** 오타게 기본 BPM(약 176) 기준 한 박자. */
export const BEAT = 0.34;

function blinkAt(t: number) {
  return t % 3.1 < 0.12;
}

export function idlePose(t: number, offset = 0): CharacterPose {
  const pose = basePose();
  const s = Math.sin((t + offset) * 2.1);
  pose.bob = s * 1.2;
  pose.armLeft = 0.14 + s * 0.06;
  pose.armRight = 0.14 - s * 0.06;
  pose.blink = blinkAt(t + offset);
  return pose;
}

export function walkPose(t: number, offset = 0, hearts = false): CharacterPose {
  const pose = basePose();
  const s = Math.sin((t + offset) * 8.5);
  pose.legLeft = s * 0.45;
  pose.legRight = -s * 0.45;
  pose.armLeft = 0.2 - s * 0.5;
  pose.armRight = 0.2 + s * 0.5;
  pose.bob = Math.abs(Math.cos((t + offset) * 8.5)) * 1.6;
  pose.blink = blinkAt(t + offset);
  pose.hearts = hearts;
  return pose;
}

export function cheerPose(t: number, offset = 0): CharacterPose {
  const pose = basePose();
  const b = ((t + offset) / BEAT) * TAU;
  const s = Math.sin(b);
  pose.armLeft = UP * 0.78 + s * 0.25;
  pose.armRight = UP * 0.78 - s * 0.25;
  pose.jump = Math.max(0, Math.sin(b * 0.5)) * 5;
  pose.bob = s * 1.4;
  pose.mouth = 0.6 + s * 0.3;
  pose.hearts = true;
  return pose;
}

/** 생일 사진 포즈 — 박스를 앞에 들고 크게 웃는다. */
export function birthdayCheerPose(t: number, offset = 0): CharacterPose {
  const pose = basePose();
  const b = ((t + offset) / BEAT) * TAU;
  const s = Math.sin(b);
  pose.armLeft = 0.5 + s * 0.06;
  pose.armRight = 0.5 - s * 0.06;
  pose.jump = Math.max(0, Math.sin(b * 0.5)) * 4;
  pose.bob = s * 1.1;
  pose.mouth = 0.82 + s * 0.18;
  pose.hearts = true;
  pose.blink = blinkAt(t + offset);
  return pose;
}

/** 손하트 포즈 — 커플 사진용. */
export function heartHandsPose(t: number, side: "left" | "right"): CharacterPose {
  const pose = basePose();
  pose.bob = Math.sin(t * 1.6) * 0.45;
  pose.mouth = 0.3;
  pose.hearts = true;
  pose.heartHands = true;
  if (side === "left") {
    pose.armRight = 0.4;
    pose.armLeft = 0.26;
    pose.lean = 0.1;
  } else {
    pose.armLeft = 0.4;
    pose.armRight = 0.26;
    pose.lean = -0.1;
  }
  return pose;
}

/**
 * 오타게 4대 기본기를 8박자씩 순환한다.
 * 로망스 → 믹스 → OAD → 썬더스네이크.
 */
export function wotageiPose(t: number, offset = 0): CharacterPose {
  const pose = basePose();
  pose.penlight = true;

  const b = (t + offset) / BEAT;
  const move = Math.floor(b / 8) % 4;
  const local = b % 8;
  const wave = Math.sin(b * Math.PI);
  const alt = Math.sin(b * Math.PI * 2);

  pose.bob = wave * 2.2;
  pose.legLeft = alt * 0.16;
  pose.legRight = -alt * 0.16;
  pose.lean = Math.sin(b * Math.PI * 0.5) * 0.5;

  if (move === 0) {
    // 로망스: 양팔을 교대로 크게 휘두른다.
    const u = 0.5 + 0.5 * Math.sin(b * Math.PI * 2);
    pose.armLeft = 0.15 + UP * 0.82 * u;
    pose.armRight = 0.15 + UP * 0.82 * (1 - u);
    pose.mouth = u > 0.7 ? 0.75 : 0.1;
    pose.jump = local > 6 ? (local - 6) * 2.4 : 0;
  } else if (move === 1) {
    // 믹스: 박자마다 양팔 동시 찌르기 + 콜.
    const hit = Math.max(0, Math.sin(b * Math.PI * 2));
    pose.armLeft = 0.1 + UP * 0.92 * hit;
    pose.armRight = 0.1 + UP * 0.92 * hit;
    pose.mouth = hit;
    pose.jump = hit * 5.5;
    pose.lean = 0;
  } else if (move === 2) {
    // OAD: 팔을 크게 원으로 돌린다.
    const spin = (b * 0.5) % 1;
    pose.armLeft = spin * UP;
    pose.armRight = ((spin + 0.5) % 1) * UP;
    pose.mouth = 0.35;
    pose.bob = Math.sin(spin * TAU) * 3;
    pose.lean = Math.cos(spin * TAU) * 0.8;
  } else {
    // 썬더스네이크: 낮게 모았다가 폭발.
    const charge = local % 4;
    if (charge < 2.6) {
      const c = charge / 2.6;
      pose.armLeft = 0.05 + c * 0.3;
      pose.armRight = 0.05 + c * 0.3;
      pose.bob = 3 - c * 2;
      pose.mouth = 0.15;
      pose.jump = 0;
      pose.lean = 0;
    } else {
      const e = (charge - 2.6) / 1.4;
      pose.armLeft = UP * (0.4 + e * 0.6);
      pose.armRight = UP * (0.4 + e * 0.6);
      pose.jump = Math.sin(e * Math.PI) * 9;
      pose.mouth = 1;
      pose.lean = 0;
    }
  }

  pose.blink = false;
  return pose;
}

export function kneelPose(t: number, amount: number): CharacterPose {
  const pose = basePose();
  pose.kneel = amount;
  pose.armLeft = 0.1;
  pose.armRight = amount > 0.5 ? Math.PI * 0.42 : 0.2;
  pose.bob = Math.sin(t * 2) * 0.6;
  pose.mouth = 0.35;
  pose.blink = blinkAt(t);
  pose.hearts = amount > 0.35;
  return pose;
}

export function surprisedPose(t: number): CharacterPose {
  const pose = basePose();
  pose.armLeft = Math.PI * 0.62;
  pose.armRight = Math.PI * 0.62;
  pose.mouth = 0.8 + Math.sin(t * 9) * 0.2;
  pose.bob = Math.sin(t * 7) * 1.6;
  pose.hearts = true;
  return pose;
}

export function leanInPose(t: number, amount: number, direction: 1 | -1): CharacterPose {
  const pose = basePose();
  pose.lean = amount * 0.8 * direction;
  pose.armLeft = 0.35 * amount;
  pose.armRight = 0.35 * amount;
  pose.mouth = 0.15;
  pose.bob = Math.sin(t * 2.4) * 0.8;
  pose.hearts = amount > 0.6;
  return pose;
}

/** 카페에서 수다 — 컵을 든 듯한 편안한 포즈. */
export function cafeHangoutPose(t: number, offset = 0): CharacterPose {
  const pose = idlePose(t, offset);
  pose.armLeft = 0.32;
  pose.armRight = 0.22;
  pose.mouth = 0.3 + Math.sin(t * 1.5) * 0.1;
  return pose;
}

/** 조조 포즈 — 미누 (손바닥 얼굴 앞, 팔 교차). */
export function jojoMinuPose(t: number): CharacterPose {
  const pose = basePose();
  pose.armRight = UP * 0.88;
  pose.armLeft = 0.62;
  pose.lean = -0.35;
  pose.mouth = 0.25;
  pose.hearts = true;
  pose.blink = false;
  pose.bob = Math.sin(t * 2.2) * 0.5;
  return pose;
}

/** 조조 포즈 — 가현 (핑거 건 + 팔 교차). */
export function jojoGahyunPose(t: number): CharacterPose {
  const pose = basePose();
  pose.armLeft = UP * 0.94;
  pose.armRight = 0.48;
  pose.lean = 0.28;
  pose.mouth = 0.2;
  pose.hearts = true;
  pose.blink = false;
  pose.bob = Math.sin(t * 2.2 + 0.4) * 0.5;
  return pose;
}

/** 한강 벤치 — 앉기 → 살짝 기울기 → 첫 뽀뽀. */
export function benchKissPose(t: number, direction: 1 | -1, progress: number): CharacterPose {
  const pose = basePose();
  const p = clamp01(progress);

  const sitIn = smooth(p / 0.38);
  const leanIn = smooth((p - 0.3) / 0.4);
  const kiss = smooth((p - 0.62) / 0.38);

  pose.sit = sitIn;
  pose.lean = direction * leanIn * 0.28;
  pose.legLeft = 0.08;
  pose.legRight = 0.08;

  if (direction > 0) {
    pose.armLeft = 0.2;
    pose.armRight = 0.28 + leanIn * 0.1;
  } else {
    pose.armLeft = 0.28 + leanIn * 0.1;
    pose.armRight = 0.2;
  }

  pose.mouth = kiss > 0.35 ? 0.05 : 0.1 + leanIn * 0.06;
  pose.hearts = kiss > 0.3;
  pose.blink = leanIn > 0.4;
  pose.bob = Math.sin(t * 1.1) * 0.1 * (1 - kiss * 0.85);
  return pose;
}

export function fingerHeartPose(t: number): CharacterPose {
  const pose = basePose();
  pose.armRight = 0.34;
  pose.armLeft = 0.18;
  pose.mouth = 0.42;
  pose.hearts = true;
  pose.bob = Math.sin(t * 1.8) * 0.45;
  return pose;
}

export function peaceSignPose(t: number): CharacterPose {
  const pose = basePose();
  pose.armLeft = UP * 0.84;
  pose.mouth = 0.32;
  pose.hearts = true;
  pose.bob = Math.sin(t * 1.8 + 0.3) * 0.45;
  return pose;
}

export function doublePeacePose(t: number): CharacterPose {
  const pose = basePose();
  pose.armLeft = UP * 0.84;
  pose.armRight = UP * 0.84;
  pose.mouth = 0.45;
  pose.hearts = true;
  pose.bob = Math.sin(t * 1.8) * 0.45;
  return pose;
}

export function holdFigurePose(t: number): CharacterPose {
  const pose = basePose();
  pose.armLeft = 0.44;
  pose.armRight = 0.44;
  pose.mouth = 0.35;
  pose.hearts = true;
  pose.bob = Math.sin(t * 1.6) * 0.35;
  return pose;
}

export function shoppingBagsPose(t: number): CharacterPose {
  const pose = basePose();
  pose.armLeft = 0.28;
  pose.armRight = 0.28;
  pose.mouth = 0.3;
  pose.hearts = true;
  pose.bob = Math.sin(t * 1.5) * 0.4;
  return pose;
}

export function travelCouplePose(t: number, offset: number): CharacterPose {
  const pose = idlePose(t, offset);
  pose.mouth = 0.35;
  pose.hearts = true;
  pose.lean = offset > 0 ? -0.08 : 0.08;
  return pose;
}

/** 생일 축하 — 좋아서 춤추는 포즈. */
export function happyDancePose(t: number, offset = 0): CharacterPose {
  const pose = basePose();
  const b = ((t + offset) / BEAT) * TAU;
  const s = Math.sin(b);
  const sway = Math.sin(b * 0.5);
  pose.armLeft = 0.18 + UP * 0.58 * (0.5 + sway * 0.5);
  pose.armRight = 0.18 + UP * 0.58 * (0.5 - sway * 0.5);
  pose.legLeft = sway * 0.32;
  pose.legRight = -sway * 0.32;
  pose.lean = sway * 0.32;
  pose.jump = Math.max(0, Math.sin(b * 0.5)) * 4.5;
  pose.bob = s * 2.2;
  pose.mouth = 0.78 + s * 0.22;
  pose.hearts = true;
  pose.blink = blinkAt(t + offset);
  return pose;
}
