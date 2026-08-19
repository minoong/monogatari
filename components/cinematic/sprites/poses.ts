import { basePose, type CharacterPose } from "@/components/cinematic/sprites/pixel-character";

const TAU = Math.PI * 2;
const UP = Math.PI;

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
