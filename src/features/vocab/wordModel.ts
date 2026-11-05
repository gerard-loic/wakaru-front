import { sf, sylo } from "@/lib/sylo"
import { masteryFromKnowledge, type Mastery } from "@/lib/mastery"
import { parseList, parseStringList } from "@/lib/syloValues"

/**
 * Modèle « mot » partagé par la liste (`useWords`) et le détail (`useWord`) :
 * forme brute renvoyée par Sylo, forme prête à afficher et conversion.
 */

/** Enregistrement brut renvoyé par `/words` (avec `WORD_RELATIONS` + `with_knowledge`). */
export interface WordRecord {
  id: number
  uid: string
  writing: string | null
  reading: string | null
  /** Tableau JSON sérialisé : `'["parc", "jardin public"]'`. */
  translations: string | null
  description: string | null
  /** Tableau JSON sérialisé : `'[{"text": "…", "translation": "…"}]'`. */
  examples: string | null
  partofspeech: PartOfSpeechRecord | null
  level: { uid: string; name: string } | null
  theme_words: { theme_id: number; deleted_at: string | null }[] | null
  /** Présent avec `with_knowledge` : progression de l'utilisateur connecté. */
  user_knowledge: { id: number; type: string | null; is_new?: boolean } | null
  /** Détail uniquement (`GET /words/<id>`) : `null` hors verbes. */
  conjugation?: ConjugationForm[] | null
}

export interface PartOfSpeechRecord {
  id: number
  uid: string
  name: string
  short_name?: string | null
  caption?: string | null
  is_worked_on?: boolean | null
}

interface ThemeRecord {
  id: number
  name: string | null
}

export interface WordExample {
  text: string
  translation: string
}

/** Case du tableau de conjugaison : le verbe conjugué, en kanji et en kana. */
export interface ConjugatedVerb {
  writing: string
  reading: string
}

/** Une forme est déclinée en affirmatif / négatif ; `null` : pas d'usage courant. */
export interface ConjugationPolarity {
  affirmative: ConjugatedVerb | null
  negative: ConjugatedVerb | null
}

/** Ligne du tableau de conjugaison calculé par l'API (présent, passé, forme en て…). */
export interface ConjugationForm {
  uid: string
  label: string
  plain: ConjugationPolarity
  polite: ConjugationPolarity
}

/** Nature grammaticale, libellés fournis par l'API. */
export interface PartOfSpeech {
  id: number
  uid: string
  /** `short_name` : libellé des filtres. */
  shortName: string
  /** `caption` : libellé de la colonne « Nature ». */
  caption: string
  /** `name` : libellé complet (infobulle, détail). */
  name: string
  /** `is_worked_on` : mots proposés en exercice. Sinon, ils sont marqués comme lus à l'ouverture. */
  isWorkedOn: boolean
}

/** Mot prêt à afficher. */
export interface VocabWord {
  id: number
  /** Identifiant stable côté Sylo (`écriture:lecture`). */
  uid: string
  /** Graphie usuelle (kanji / kana). */
  writing: string
  /** Lecture en kana. */
  reading: string
  translations: string[]
  description: string | null
  examples: WordExample[]
  partOfSpeech: PartOfSpeech | null
  /** Niveau JLPT, ex : `"N5"`. */
  level: string | null
  themes: { id: number; name: string }[]
  /** Maîtrise de l'utilisateur connecté (`user_knowledge.type`). */
  mastery: Mastery
  /** Pas encore lu par l'utilisateur connecté (`user_knowledge.is_new`). */
  isNew: boolean
}

/** Nom de l'entité dans `user_knowledges.entity_name` : le modèle Sylo, pas la table. */
export const WORD_ENTITY = "word"

/** Relations à charger pour construire un `VocabWord`. */
export const WORD_RELATIONS = ["partofspeech", "level", "theme_words"]

/** Paramètre propre au backend : ajoute `user_knowledge` à chaque mot. */
export const WITH_KNOWLEDGE = { with_knowledge: true }

/** Noms des thèmes, par id. Échec non bloquant : les mots s'affichent sans thème. */
export async function loadThemeNames(): Promise<Map<number, string>> {
  const themes = await sylo.listAll<ThemeRecord>("themes").catch(() => [])
  return new Map(themes.map((t) => [t.id, t.name ?? ""]))
}

/** Ids des mots rattachés à un thème (via `theme_words`). */
export async function loadThemeWordIds(themeId: number): Promise<number[]> {
  const links = await sylo.queryAll<{ word_id: number }>("theme_words", {
    filter: sf.eq("theme_id", themeId),
  })
  return [...new Set(links.map((l) => l.word_id))]
}

export function toWord(r: WordRecord, themeNames: Map<number, string>): VocabWord {
  const reading = r.reading ?? ""
  return {
    id: r.id,
    uid: r.uid,
    writing: r.writing || reading,
    reading,
    translations: parseStringList(r.translations),
    description: r.description?.trim() || null,
    examples: parseList(r.examples).filter(isExample),
    partOfSpeech: r.partofspeech && toPartOfSpeech(r.partofspeech),
    level: r.level?.name ?? null,
    // Les liaisons supprimées (soft delete) restent renvoyées par `with`.
    themes: (r.theme_words ?? [])
      .filter((tw) => tw.deleted_at == null && themeNames.has(tw.theme_id))
      .map((tw) => ({ id: tw.theme_id, name: themeNames.get(tw.theme_id)! })),
    mastery: masteryFromKnowledge(r.user_knowledge?.type),
    // Sans ligne `user_knowledge`, le mot n'a jamais été lu.
    isNew: r.user_knowledge?.is_new ?? true,
  }
}

/**
 * Niveau de la puce d'un mot, ou `null` sans puce : un mot lu d'une nature non
 * travaillée n'est plus « nouveau », et n'aura pas de maîtrise à afficher.
 */
export function wordDotLevel(w: VocabWord): Mastery | null {
  const read = !w.partOfSpeech?.isWorkedOn && !w.isNew
  return read && w.mastery === "new" ? null : w.mastery
}

/** `short_name` et `caption` sont optionnels : `name` sert de repli. */
export function toPartOfSpeech(pos: PartOfSpeechRecord): PartOfSpeech {
  const name = pos.name.trim()
  return {
    id: pos.id,
    uid: pos.uid,
    shortName: pos.short_name?.trim() || name,
    caption: pos.caption?.trim() || name,
    name,
    isWorkedOn: Boolean(pos.is_worked_on),
  }
}

function isExample(value: unknown): value is WordExample {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as WordExample).text === "string" &&
    typeof (value as WordExample).translation === "string"
  )
}

/** Enregistrement brut renvoyé par `QUERY /compositions` (avec `composition_type`, `kanjis`). */
export interface CompositionRecord {
  id: number
  text: string | null
  reading: string | null
  word_id: number | null
  is_rendaku: boolean | null
  deleted_at: string | null
  composition_type: { uid: string; name: string } | null
  kanjis: { id: number; char: string; deleted_at: string | null }[] | null
}

/** Segment d'un mot (un kanji, un groupe de kanji ou des kana) et sa lecture. */
export interface WordSegment {
  id: number
  /** Texte du segment tel qu'écrit dans le mot (`狩`, `紅葉`, `り`…). */
  text: string
  /** Lecture du segment dans ce mot (`が`, `もみじ`…). */
  reading: string
  /** Type de lecture (`composition_type.uid` : `on`, `kun`, `jukujikun`…). */
  kind: string
  /** Explication du type fournie par l'API (`composition_type.name`). */
  kindName: string | null
  /** Lecture adoucie par rendaku (か -> が…). */
  rendaku: boolean
  /** Kanji du segment présents dans la base (ouvrables en détail). */
  kanjis: { id: number; char: string }[]
}

/** Relations à charger pour construire un `WordSegment`. */
export const COMPOSITION_RELATIONS = ["composition_type", "kanjis"]

export function toSegment(c: CompositionRecord): WordSegment {
  return {
    id: c.id,
    text: c.text ?? "",
    reading: c.reading ?? "",
    kind: c.composition_type?.uid ?? "",
    kindName: c.composition_type?.name.trim() || null,
    rendaku: c.is_rendaku === true,
    kanjis: (c.kanjis ?? [])
      .filter((k) => k.deleted_at == null)
      .map((k) => ({ id: k.id, char: k.char })),
  }
}
