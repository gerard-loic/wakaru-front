import type { ProgramTask } from "@/features/themes/themeProgram"

/* Weekly programme (planning) for a theme */

export type PlanKind = "exercice" | "vocab" | "kanji" | "hiragana" | "katakana" | "phrases"

export const PLAN_META: Record<PlanKind, { glyph: string; label: string }> = {
  exercice: { glyph: "練", label: "Exercice" },
  vocab: { glyph: "単", label: "Vocabulaire" },
  kanji: { glyph: "漢", label: "Kanji" },
  hiragana: { glyph: "あ", label: "Hiragana" },
  katakana: { glyph: "ア", label: "Katakana" },
  phrases: { glyph: "例", label: "Phrases" },
}

export const WEEK_DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
]

/** Sujet d'entraînement -> type de tâche affiché. */
const PLAN_KIND_BY_SUBJECT: Record<string, PlanKind> = {
  words: "vocab",
  kanjis: "kanji",
  hiraganas: "hiragana",
  katakanas: "katakana",
  sentences: "phrases",
}

export function planKind(task: ProgramTask): PlanKind {
  return task.kind === "training"
    ? (PLAN_KIND_BY_SUBJECT[task.request.subject] ?? "exercice")
    : "exercice"
}
