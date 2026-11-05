import { useState, type DependencyList } from "react"
import type { SyloListResult } from "@/lib/sylo"
import { usePagination, type Pagination } from "@/lib/usePagination"
import { useRemote, type Remote } from "@/lib/useRemote"

export interface PagedRemoteOptions {
  /** Éléments par page (`limit` côté Sylo, 200 max). */
  pageSize: number
  /**
   * Critères de la requête (recherche, filtres…). Quand ils changent, on
   * revient à la page 1 et on recharge. Doivent être sérialisables en JSON.
   */
  deps: DependencyList
}

/** Résultat vide, pour répondre sans appel réseau quand aucun élément ne peut correspondre. */
export function emptyPage<T>(): SyloListResult<T> {
  return { data: [], meta: { total: 0, limit: 0, offset: 0, page: 1 } }
}

export type PagedRemote<T> = Remote<T[]> & {
  /** État de page, `total` issu de `meta.total`. À brancher sur `<Pagination>`. */
  pagination: Pagination
}

/**
 * Liste paginée côté serveur : seule la page courante est chargée. `load`
 * reçoit la page demandée et renvoie le résultat Sylo (`data` + `meta`).
 *
 * Pendant le chargement d'une nouvelle page, les éléments de la précédente
 * restent disponibles (`data`) : la vue peut les estomper plutôt que de vider
 * la liste.
 */
export function usePagedRemote<T>(
  load: (page: { page: number; pageSize: number }) => Promise<SyloListResult<T>>,
  { pageSize, deps }: PagedRemoteOptions,
): PagedRemote<T> {
  const [total, setTotal] = useState(0)
  const pagination = usePagination({ total, pageSize })
  const { page } = pagination

  // Nouveaux critères -> page 1, ajusté pendant le rendu pour que la requête
  // parte directement sur la bonne page.
  const key = JSON.stringify(deps)
  const [lastKey, setLastKey] = useState(key)
  if (key !== lastKey) {
    setLastKey(key)
    pagination.setPage(1)
  }

  const { data: result, ...remote } = useRemote<SyloListResult<T> | null>(
    () => load({ page, pageSize }),
    null,
    [key, page, pageSize],
  )

  // Le total vient de la dernière réponse acceptée par `useRemote` (les
  // réponses périmées sont ignorées), et non de chaque appel à `load`.
  const latestTotal = result ? (result.meta?.total ?? result.data.length) : total
  if (latestTotal !== total) setTotal(latestTotal)

  return { ...remote, data: result?.data ?? [], pagination }
}
