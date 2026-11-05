import type { DailyTask } from "./types"

export const dailyPlan: DailyTask[] = [
  {
    kind: "revision",
    label: "Révision du jour",
    detail: "12 mots du thème « La famille »",
    done: true,
  },
  {
    kind: "exercice",
    label: "Exercice du jour",
    detail: "Particule は — 20 questions",
    done: false,
  },
]

// Mots maîtrisés cumulés, par semaine (8 dernières semaines)
export const evolution: { week: string; mastered: number }[] = [
  { week: "S-7", mastered: 640 },
  { week: "S-6", mastered: 712 },
  { week: "S-5", mastered: 805 },
  { week: "S-4", mastered: 918 },
  { week: "S-3", mastered: 1002 },
  { week: "S-2", mastered: 1104 },
  { week: "S-1", mastered: 1230 },
  { week: "Cette sem.", mastered: 1418 },
]
