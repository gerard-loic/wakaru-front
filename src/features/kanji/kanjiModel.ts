import { masteryFromKnowledge, type Mastery } from "@/lib/mastery"
import { parseObject, parseStringList } from "@/lib/syloValues"

/**
 * Modèle « kanji » partagé par la liste (`useKanjis`) et le détail
 * (`useKanji`) : forme brute renvoyée par Sylo, forme prête à afficher et
 * conversion.
 */

/** Enregistrement brut renvoyé par `/kanjis` (avec `KANJI_RELATIONS` + `with_knowledge`). */
export interface KanjiRecord {
  id: number
  char: string
  /** Objet JSON sérialisé : `'{"on": ["サン"], "kun": ["やま"]}'`. */
  readings: string | null
  description: string | null
  /** Tableau PostgreSQL (`'{montagne}'`) ou JSON sérialisé. */
  translations: string | null
  strokes: number | null
  radical: string | null
  grade: string | null
  unicode: string | null
  level: { uid: string; name: string } | null
  themes: { id: number; name: string | null; deleted_at: string | null }[] | null
  compositions?: CompositionRecord[] | null
  /** Présent avec `with_knowledge` : progression de l'utilisateur connecté. */
  user_knowledge: { type: string | null } | null
}

/** Segment d'un mot rattaché au kanji : lecture utilisée dans ce mot. */
export interface CompositionRecord {
  id: number
  text: string | null
  reading: string | null
  word_id: number | null
  composition_type_id: number | null
  is_rendaku: boolean | null
  deleted_at: string | null
}

/** Kanji prêt à afficher. */
export interface KanjiEntry {
  id: number
  char: string
  /** Lectures on (音読み), en katakana. */
  on: string[]
  /** Lectures kun (訓読み), en hiragana. */
  kun: string[]
  /** Sens principal, puis sens secondaires. */
  meaning: string
  otherMeanings: string[]
  /** Explication / moyen mnémotechnique. */
  description: string | null
  strokes: number | null
  radical: string | null
  /** Année d'apprentissage à l'école japonaise (kyōiku kanji). */
  grade: string | null
  unicode: string | null
  /** Niveau JLPT, ex : `"N5"`. */
  level: string | null
  themes: { id: number; name: string }[]
  /** Maîtrise de l'utilisateur connecté (`user_knowledge.type`). */
  mastery: Mastery
}

/** Relations à charger pour construire un `KanjiEntry`. */
export const KANJI_RELATIONS = ["level", "themes"]

/** Paramètre propre au backend : ajoute `user_knowledge` à chaque kanji. */
export const WITH_KNOWLEDGE = { with_knowledge: true }

/** `GET /themes/<id>?with=kanjis` : ids ou kanji complets selon le backend. */
export interface ThemeKanjiLinks {
  kanjis?: (number | { id: number; deleted_at?: string | null })[] | null
}

/** Ids des kanji encore actifs d'un thème chargé avec `with=kanjis`. */
export function themeKanjiIds(record: ThemeKanjiLinks): number[] {
  return (record.kanjis ?? [])
    .filter((k) => typeof k === "number" || k.deleted_at == null)
    .map((k) => (typeof k === "number" ? k : k.id))
}

export function toKanji(r: KanjiRecord): KanjiEntry {
  const readings = parseObject(r.readings)
  const [meaning = "", ...otherMeanings] = parseStringList(r.translations)
  return {
    id: r.id,
    char: r.char,
    on: readingList(readings?.on),
    kun: readingList(readings?.kun),
    meaning,
    otherMeanings,
    description: r.description?.trim() || null,
    strokes: r.strokes,
    radical: r.radical?.trim() || null,
    grade: r.grade?.trim() || null,
    unicode: r.unicode?.trim() || null,
    level: r.level?.name ?? null,
    themes: (r.themes ?? [])
      .filter((t) => t.deleted_at == null && t.name)
      .map((t) => ({ id: t.id, name: t.name! })),
    mastery: masteryFromKnowledge(r.user_knowledge?.type),
  }
}

function readingList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && v !== "")
    : []
}
