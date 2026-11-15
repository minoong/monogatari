import type { PhraseItem } from "@/lib/phrases";

export type SpeakerGender = "male" | "female";

export const SPEAKER_GENDER_STORAGE_KEY = "monogatari_phrase_speaker_gender";

export type GenderPhraseLine = {
  text: string;
  pron: string;
};

export type PhraseGenderVariants = {
  male: GenderPhraseLine;
  female: GenderPhraseLine;
  hasGenderVariant: boolean;
};

function parsePronVariants(pron: string) {
  const normalized = pron.trim();

  if (normalized.includes(" / ")) {
    const [male, female] = normalized.split(" / ").map((part) => part.trim());
    return { male, female, hasVariant: male !== female };
  }

  if (/크럽\s*\/\s*카/.test(normalized)) {
    return {
      male: normalized.replace(/크럽\s*\/\s*카/g, "크럽"),
      female: normalized.replace(/크럽\s*\/\s*카/g, "카"),
      hasVariant: true,
    };
  }

  return { male: normalized, female: normalized, hasVariant: false };
}

function shouldAppendPoliteParticle(pron: string, hasVariant: boolean) {
  if (hasVariant) return true;
  return /크럽|카/.test(pron);
}

function appendPoliteParticle(th: string, gender: SpeakerGender) {
  if (/ครับ|ค่ะ|คะ/.test(th)) return th;

  const isQuestion = /(?:ไหม|เท่าไหร่|ได้ไหม|ที่ไหน|เท่าไร|\?)/.test(th);
  const particle = gender === "male" ? "ครับ" : isQuestion ? "คะ" : "ค่ะ";
  return `${th}${particle}`;
}

/**
 * 말하는 사람 성별에 맞춰 회화를 고른다. 성별에 따라 공손 어미가 달라지는 언어(태국어)만 변형을 적용하고,
 * 그렇지 않은 언어(일본어)는 원문과 독음을 그대로 돌려준다. 일본어 독음에도 "카"가 흔히 들어가므로
 * 언어를 확인하지 않고 태국어 규칙을 적용하면 안 된다.
 */
export function resolvePhraseForSpeaker(
  item: PhraseItem,
  gender: SpeakerGender,
  genderedPoliteness: boolean,
): GenderPhraseLine & { hasGenderVariant: boolean } {
  if (!genderedPoliteness) return { text: item.text, pron: item.pron, hasGenderVariant: false };

  const { male, female, hasVariant } = parsePronVariants(item.pron);
  const pron = gender === "male" ? male : female;
  const text = shouldAppendPoliteParticle(item.pron, hasVariant)
    ? appendPoliteParticle(item.text, gender)
    : item.text;

  return { text, pron, hasGenderVariant: hasVariant };
}

export function getPhraseGenderVariants(item: PhraseItem, genderedPoliteness: boolean): PhraseGenderVariants {
  const male = resolvePhraseForSpeaker(item, "male", genderedPoliteness);
  const female = resolvePhraseForSpeaker(item, "female", genderedPoliteness);

  return {
    male: { text: male.text, pron: male.pron },
    female: { text: female.text, pron: female.pron },
    hasGenderVariant: male.hasGenderVariant,
  };
}

export function getSpeakerGenderLabel(gender: SpeakerGender) {
  return gender === "male" ? "남성" : "여성";
}

export function getSpeakerGenderShortLabel(gender: SpeakerGender) {
  return gender === "male" ? "남" : "여";
}

export const SPEAKER_GENDER_META: Record<
  SpeakerGender,
  { label: string; image: string; avatarColor: "accent" | "success" }
> = {
  male: { label: "미누쿤", image: "/avatars/minu.webp", avatarColor: "success" },
  female: { label: "가현쨩", image: "/avatars/gahyun.webp", avatarColor: "accent" },
};

export function readStoredSpeakerGender(): SpeakerGender {
  if (typeof window === "undefined") return "female";

  try {
    const stored = localStorage.getItem(SPEAKER_GENDER_STORAGE_KEY);
    return stored === "male" ? "male" : "female";
  } catch {
    return "female";
  }
}

export function storeSpeakerGender(gender: SpeakerGender) {
  try {
    localStorage.setItem(SPEAKER_GENDER_STORAGE_KEY, gender);
  } catch {
    // localStorage 에러 무시
  }
}
