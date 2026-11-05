export type Mastery = "new" | "known" | "learning" | "hard"

export const MASTERY_META: Record<Mastery, { color: string; label: string }> = {
  new: { color: "#ff6a1a", label: "Nouveau" },
  known: { color: "#3fbf7f", label: "Maîtrisé" },
  learning: { color: "#f2a63b", label: "En cours" },
  hard: { color: "#e5484d", label: "À revoir" },
}

/** Ordre d'affichage des niveaux (légende, filtres). */
export const MASTERY_LEVELS: Mastery[] = ["new", "known", "learning", "hard"]

/** Effectif par niveau de maîtrise. */
export function countByMastery<T>(
  items: T[],
  masteryOfItem: (item: T) => Mastery,
): Record<Mastery, number> {
  const counts: Record<Mastery, number> = { new: 0, known: 0, learning: 0, hard: 0 }
  for (const item of items) counts[masteryOfItem(item)]++
  return counts
}

/** `user_knowledge.type` (Sylo) -> niveau affiché. */
const KNOWLEDGE_TYPES: Record<string, Mastery> = {
  aucun: "new",
  maitrise: "known",
  encours: "learning",
  arevoir: "hard",
}

/** Niveau affiché -> `user_knowledge.type` (paramètre `knowledge` des QUERY). */
export const KNOWLEDGE_TYPE_OF: Record<Mastery, string> = {
  new: "aucun",
  known: "maitrise",
  learning: "encours",
  hard: "arevoir",
}

/**
 * Paramètre `knowledge` des QUERY (maîtrise calculée côté backend, donc pas
 * filtrable via `filter`) : à fusionner dans `extra`. Vide sans sélection.
 */
export function knowledgeFilter(mastery: Mastery | null): { knowledge?: string[] } {
  return mastery ? { knowledge: [KNOWLEDGE_TYPE_OF[mastery]] } : {}
}

/**
 * Niveau de maîtrise d'après `user_knowledge.type` (`aucun`, `maitrise`,
 * `encours`, `arevoir`). Tolère casse, accents et espaces (`"À revoir"`).
 * Sans connaissance enregistrée, ou valeur inconnue, l'élément est « nouveau ».
 */
export function masteryFromKnowledge(type: string | null | undefined): Mastery {
  const key = (type ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/gi, "")
    .toLowerCase()
  return KNOWLEDGE_TYPES[key] ?? "new"
}

// Deterministic level per element so the indicator stays stable between renders.
export function masteryOf(seed: string): Mastery {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const m = h % 10
  if (m < 5) return "known"
  if (m < 8) return "learning"
  return "hard"
}
