import type { PhraseItem } from "@/lib/phrases";

export type SpeakerGender = "male" | "female";

export const SPEAKER_GENDER_STORAGE_KEY = "monogatari_phrase_speaker_gender";

export type GenderPhraseLine = {
  th: string;
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

export function resolvePhraseForSpeaker(item: PhraseItem, gender: SpeakerGender): GenderPhraseLine & { hasGenderVariant: boolean } {
  const { male, female, hasVariant } = parsePronVariants(item.pron);
  const pron = gender === "male" ? male : female;
  const th = shouldAppendPoliteParticle(item.pron, hasVariant)
    ? appendPoliteParticle(item.th, gender)
    : item.th;

  return { th, pron, hasGenderVariant: hasVariant };
}

export function getPhraseGenderVariants(item: PhraseItem): PhraseGenderVariants {
  const male = resolvePhraseForSpeaker(item, "male");
  const female = resolvePhraseForSpeaker(item, "female");

  return {
    male: { th: male.th, pron: male.pron },
    female: { th: female.th, pron: female.pron },
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
