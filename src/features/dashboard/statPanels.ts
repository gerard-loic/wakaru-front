import type { ItemStats } from "@/layout/useItemStats"

/** Panneau de statistiques d'une famille d'items, en nombre d'éléments. */
export interface StatPanel {
  id: keyof ItemStats
  label: string
  jp: string
  /** Route de la page listant les items de la famille. */
  to: string
  total: number
  known: number
  learning: number
  hard: number
}

/** Familles affichées, dans l'ordre. Les thèmes n'ont pas de maîtrise propre. */
const FAMILIES: Pick<StatPanel, "id" | "label" | "jp" | "to">[] = [
  { id: "words", label: "Vocabulaire", jp: "単語", to: "/vocab" },
  { id: "hiraganas", label: "Hiragana", jp: "ひらがな", to: "/hiragana" },
  { id: "katakanas", label: "Katakana", jp: "カタカナ", to: "/katakana" },
  { id: "kanjis", label: "Kanji", jp: "漢字", to: "/kanji" },
  { id: "grammar_rules", label: "Grammaire", jp: "文法", to: "/grammar" },
  { id: "sentences", label: "Phrases", jp: "例文", to: "/sentences" },
  { id: "exercises", label: "Exercices", jp: "練習", to: "/exercises" },
]

/**
 * Convertit `GET /stats/items` en panneaux : l'API donne des pourcentages, on
 * revient à des effectifs. Une famille sans `proportions` n'a pas de panneau.
 */
export function toStatPanels(stats: ItemStats): StatPanel[] {
  return FAMILIES.flatMap((family) => {
    const item = stats[family.id]
    if (!item?.proportions) return []
    const { all, worked_on: total = all, proportions: p } = item
    const count = (percent: number) => Math.round((total * percent) / 100)
    return [
      {
        ...family,
        total,
        known: count(p.maitrise),
        learning: count(p.encours),
        hard: count(p.arevoir),
      },
    ]
  })
}
