/**
 * Types de lecture d'un segment de mot (`composition_type.uid` côté Sylo) :
 * libellé, couleur et explication de repli, partagés par les détails de mot
 * et de kanji pour qu'un même type s'affiche partout de la même façon.
 */

export interface ReadingKindMeta {
  /** Libellé court (badges). */
  label: string
  /** Nom japonais du procédé. */
  jp: string
  /** Couleur d'accent (texte et bordure du badge). */
  color: string
  /** Explication utilisée quand l'API n'en fournit pas. */
  help: string
}

const KINDS: Record<string, ReadingKindMeta> = {
  on: {
    label: "On",
    jp: "音読み",
    color: "#ff6a1a",
    help: "Lecture d'origine chinoise du kanji, notée en katakana.",
  },
  kun: {
    label: "Kun",
    jp: "訓読み",
    color: "#5aa9e6",
    help: "Lecture japonaise du kanji, notée en hiragana.",
  },
  jukujikun: {
    label: "Jukujikun",
    jp: "熟字訓",
    color: "#b28cf5",
    help: "Lecture portée par le groupe de kanji entier : elle ne se décompose pas caractère par caractère.",
  },
  ateji: {
    label: "Ateji",
    jp: "当て字",
    color: "#f2a63b",
    help: "Kanji choisis pour leur son, sans rapport avec le sens.",
  },
  iteration: {
    label: "Répétition",
    jp: "踊り字",
    color: "#9aa0a6",
    help: "Le signe 々 répète le kanji qui le précède.",
  },
  kana: {
    label: "Kana",
    jp: "仮名",
    color: "#9aa0a6",
    help: "Partie du mot écrite sans kanji : okurigana (terminaison) ou préfixe.",
  },
}

const UNKNOWN: ReadingKindMeta = {
  label: "Autre",
  jp: "",
  color: "#9aa0a6",
  help: "",
}

export function readingKind(uid: string | null | undefined): ReadingKindMeta {
  return (uid && KINDS[uid]) || { ...UNKNOWN, label: uid || UNKNOWN.label }
}

/** Ordre d'affichage des types (mots-exemples d'un kanji…). */
export const READING_KIND_ORDER = ["on", "kun", "jukujikun", "ateji", "iteration", "kana"]
