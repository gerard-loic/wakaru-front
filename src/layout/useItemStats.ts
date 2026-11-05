import type { DependencyList } from "react"
import { sylo } from "@/lib/sylo"
import { useRemote, type Remote } from "@/lib/useRemote"

/** Compteurs d'une famille d'items. */
export interface ItemCount {
  all: number
  new: number
  /**
   * Éléments réellement travaillés, sur lesquels portent les `proportions`.
   * Absent si ce sont tous les éléments (`all`) : seuls `words` le renseigne.
   */
  worked_on?: number
  /**
   * Part de chaque `user_knowledge.type`, en pourcentage. Absent pour les
   * familles sans suivi de maîtrise dans l'API (`themes`, `grammar_rules`).
   */
  proportions?: Record<"aucun" | "encours" | "maitrise" | "arevoir", number>
}

/** Réponse de `GET /stats/items`, indexée par famille d'items. */
export type ItemStats = Partial<
  Record<
    | "words"
    | "hiraganas"
    | "katakanas"
    | "themes"
    | "kanjis"
    | "grammar_rules"
    | "sentences"
    | "exercises",
    ItemCount
  >
>

/** Charge les compteurs d'items (`GET /stats/items`). */
export function useItemStatsRemote(
  deps: DependencyList = [],
): Remote<ItemStats> {
  return useRemote(
    async () => (await sylo.call<ItemStats>("GET", "/stats/items")).data ?? {},
    {} as ItemStats,
    deps,
  )
}

/**
 * Compteurs d'items seuls. En cas d'erreur, renvoie un objet vide : les
 * pastilles du menu disparaissent simplement.
 */
export function useItemStats(deps: DependencyList = []): ItemStats {
  return useItemStatsRemote(deps).data
}
