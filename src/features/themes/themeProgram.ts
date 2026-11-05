import type { TrainingRequest } from "@/features/practice/training"

/**
 * Programme hebdomadaire d'un thème, lu dans `user_knowledge.details` :
 * `{ "day1": [...], ..., "day7": [...] }`. Chaque tâche est soit un exercice
 * (`type: "exercises"`), soit un entraînement sur un sujet (`words`…).
 */

/** Emplacement d'une tâche, attendu par `POST /user_knowledges/<id>/done`. */
export interface ProgramTaskRef {
  /** `user_knowledge.id` du thème. */
  knowledgeId: number
  /** `day1` à `day7`. */
  day: string
  /** Position de la tâche dans le tableau du jour de `details`. */
  index: number
}

export type ProgramTask = {
  name: string
  done: boolean
  ref: ProgramTaskRef
} & (
  | { kind: "exercise"; exerciseId: number }
  | { kind: "training"; request: TrainingRequest }
)

/** Tâches de chaque jour du programme : l'index 0 correspond à `day1`. */
export type WeekProgram = ProgramTask[][]

const DAYS_PER_WEEK = 7

/** Jour de la semaine du `day1` : 1 (lundi) à 7 (dimanche). */
const FIRST_DAY = parseFirstDay(import.meta.env.VITE_PROGRAM_FIRST_DAY)

function parseFirstDay(value: string | undefined): number {
  const day = Number(value)
  return Number.isInteger(day) && day >= 1 && day <= DAYS_PER_WEEK ? day : 1
}

/** Index dans `WeekProgram` du jour `date`. */
export function programDayIndex(date = new Date(), firstDay = FIRST_DAY): number {
  const weekday = date.getDay() || DAYS_PER_WEEK // dimanche : 0 -> 7
  return (weekday - firstDay + DAYS_PER_WEEK) % DAYS_PER_WEEK
}

/** Jour de la semaine (lundi = 0) d'un index de `WeekProgram`. */
export function programWeekdayIndex(index: number, firstDay = FIRST_DAY): number {
  return (firstDay - 1 + index) % DAYS_PER_WEEK
}

/** Avancement du programme. Arrondi à l'inférieur : 100 % signifie tout fait. */
export function programProgress(program: WeekProgram): {
  done: number
  total: number
  percent: number
} {
  const tasks = program.flat()
  const done = tasks.filter((t) => t.done).length
  const total = tasks.length
  return { done, total, percent: total ? Math.floor((done / total) * 100) : 0 }
}

/** Emplacement d'une tâche -> paramètre d'URL `?task=12:day1:0`. */
export function taskRefToParam(ref: ProgramTaskRef): string {
  return [ref.knowledgeId, ref.day, ref.index].join(":")
}

/** Paramètre d'URL -> emplacement d'une tâche, ou `null` s'il est invalide. */
export function taskRefFromParam(value: string | null): ProgramTaskRef | null {
  const match = /^(\d+):(day[1-7]):(\d+)$/.exec(value ?? "")
  return match
    ? { knowledgeId: Number(match[1]), day: match[2], index: Number(match[3]) }
    : null
}

/**
 * Lit le programme de la ligne `user_knowledge` d'un thème. `details` est du
 * JSON texte, ou déjà un objet selon la route. Illisible ou absent : programme
 * vide. Une tâche invalide est ignorée, sans décaler l'index des suivantes.
 */
export function parseProgram(
  knowledge: { id: number; details: unknown } | null | undefined,
): WeekProgram {
  const raw = readDetails(knowledge?.details)
  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => {
    const day = `day${i + 1}`
    const tasks = raw[day]
    if (!knowledge || !Array.isArray(tasks)) return []
    return tasks.flatMap((task, index) =>
      toTask(task, { knowledgeId: knowledge.id, day, index }),
    )
  })
}

function readDetails(details: unknown): Record<string, unknown> {
  try {
    const value = typeof details === "string" ? JSON.parse(details) : details
    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function toTask(value: unknown, ref: ProgramTaskRef): ProgramTask[] {
  if (typeof value !== "object" || value === null) return []
  const t = value as Record<string, unknown>
  if (typeof t.name !== "string") return []
  const base = { name: t.name, done: t.done === true, ref }

  if (t.type === "exercises") {
    return typeof t.exercise_id === "number"
      ? [{ ...base, kind: "exercise", exerciseId: t.exercise_id }]
      : []
  }
  if (
    typeof t.type !== "string" ||
    typeof t.element_from !== "string" ||
    !Array.isArray(t.element_to) ||
    typeof t.focus !== "string"
  ) {
    return []
  }
  return [
    {
      ...base,
      kind: "training",
      request: {
        subject: t.type,
        element_from: t.element_from as TrainingRequest["element_from"],
        element_to: t.element_to as TrainingRequest["element_to"],
        focus: t.focus,
      },
    },
  ]
}
