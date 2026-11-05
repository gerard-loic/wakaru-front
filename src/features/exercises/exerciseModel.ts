import { masteryFromKnowledge, type Mastery } from "@/lib/mastery"
import { parseList, parseStringList } from "@/lib/syloValues"

/**
 * Modèle « exercice » partagé par la liste (`useExercises`), le détail et le
 * lanceur (`useExercise`) : forme brute renvoyée par Sylo, forme prête à
 * afficher et conversion, dont le découpage des énoncés à trous.
 */

/** Enregistrement brut renvoyé par `/exercises` (avec `EXERCISE_RELATIONS` + `with_knowledge`). */
export interface ExerciseRecord {
  id: number
  created_at: string | null
  name: string
  instructions: string | null
  /** Tableau JSON (non ASCII échappé) des réponses proposées, ou `null` (saisie libre). */
  choices: string | null
  exercise_category: { id: number; uid: string; name: string } | null
  exercise_type: { id: number; uid: string; name: string } | null
  theme: { id: number; name: string | null; deleted_at: string | null } | null
  level: { uid: string; name: string } | null
  /** Présent avec `with_knowledge` : progression de l'utilisateur connecté. */
  user_knowledge: { id: number; type: string | null } | null
}

/** Enregistrement brut renvoyé par `QUERY /exercise_items`. */
export interface ExerciseItemRecord {
  id: number
  exercise_id: number
  /** Énoncé ; les trous sont notés `{{1}}`, `{{2}}`… */
  prompt: string
  translation: string | null
  /** Tableau JSON `[{ key: 1, answers: ["を"] }]`. */
  blanks: string | null
  explanation: string | null
}

/** Catégorie ou type d'exercice. */
export interface ExerciseCategory {
  id: number
  uid: string
  name: string
}

/** Exercice prêt à afficher. */
export interface ExerciseEntry {
  id: number
  title: string
  instructions: string | null
  /** Réponses proposées ; vide = réponse à saisir. */
  choices: string[]
  category: ExerciseCategory | null
  type: ExerciseCategory | null
  theme: { id: number; name: string } | null
  /** Niveau JLPT, ex : `"N5"`. */
  level: string | null
  /** Date de création (ISO), ou `null` si inconnue. */
  date: string | null
  /** Maîtrise de l'utilisateur connecté (`user_knowledge.type`). */
  mastery: Mastery
  /** `user_knowledge.id`, ou `null` si l'exercice n'a jamais été fait. */
  knowledgeId: number | null
}

/** Morceau d'énoncé : texte, ou trou à compléter (`key` = numéro du trou). */
export type PromptPart =
  | { kind: "text"; text: string }
  | { kind: "blank"; key: number; answers: string[] }

/** Question prête à afficher. */
export interface ExerciseItem {
  id: number
  parts: PromptPart[]
  translation: string | null
  explanation: string | null
}

/** Exercice et ses questions. */
export interface ExerciseDetail {
  exercise: ExerciseEntry
  items: ExerciseItem[]
}

/** Relations à charger pour construire un `ExerciseEntry`. */
export const EXERCISE_RELATIONS = [
  "exercise_category",
  "exercise_type",
  "theme",
  "level",
]

/** Nom de l'entité dans `user_knowledges.entity_name`. */
export const EXERCISE_ENTITY = "exercises"

/** Exercice réussi à partir de cette part de bonnes réponses. */
export const SUCCESS_RATE = 0.8

/** Paramètre propre au backend : ajoute `user_knowledge` à chaque exercice. */
export const WITH_KNOWLEDGE = { with_knowledge: true }

export function toExercise(r: ExerciseRecord): ExerciseEntry {
  const theme = r.theme && r.theme.deleted_at == null && r.theme.name ? r.theme : null
  return {
    id: r.id,
    title: r.name.trim(),
    instructions: r.instructions?.trim() || null,
    choices: parseStringList(r.choices),
    category: r.exercise_category && toCategory(r.exercise_category),
    type: r.exercise_type && toCategory(r.exercise_type),
    theme: theme && { id: theme.id, name: theme.name! },
    level: r.level?.name ?? null,
    date: r.created_at,
    mastery: masteryFromKnowledge(r.user_knowledge?.type),
    knowledgeId: r.user_knowledge?.id ?? null,
  }
}

export function toCategory(c: { id: number; uid: string; name: string }): ExerciseCategory {
  return { id: c.id, uid: c.uid, name: c.name.trim() }
}

export function toItem(r: ExerciseItemRecord): ExerciseItem {
  const answers = new Map<number, string[]>()
  for (const b of parseList(r.blanks)) {
    if (!b || typeof b !== "object") continue
    const { key, answers: list } = b as { key?: unknown; answers?: unknown }
    if (typeof key !== "number" || !Array.isArray(list)) continue
    answers.set(
      key,
      list.filter((a): a is string => typeof a === "string" && a.trim() !== ""),
    )
  }

  // `split` avec groupe capturant : texte aux index pairs, numéro de trou aux impairs.
  const parts: PromptPart[] = r.prompt
    .split(/\{\{\s*(\d+)\s*\}\}/)
    .flatMap((chunk, i): PromptPart[] => {
      if (i % 2 === 0) return chunk ? [{ kind: "text", text: chunk }] : []
      const key = Number(chunk)
      return [{ kind: "blank", key, answers: answers.get(key) ?? [] }]
    })

  return {
    id: r.id,
    parts,
    translation: r.translation?.trim() || null,
    explanation: r.explanation?.trim() || null,
  }
}

/** Trous de la question, dans l'ordre de l'énoncé. */
export function blanksOf(item: ExerciseItem) {
  return item.parts.filter(
    (p): p is Extract<PromptPart, { kind: "blank" }> => p.kind === "blank",
  )
}

/** Comparaison tolérante : espaces (y compris pleine chasse) et largeur ignorés. */
function normalize(text: string): string {
  return text.normalize("NFKC").replace(/\s+/g, "")
}

/** La réponse donnée correspond-elle à l'une des réponses attendues ? */
export function isCorrect(given: string, answers: string[]): boolean {
  const g = normalize(given)
  return g !== "" && answers.some((a) => normalize(a) === g)
}
