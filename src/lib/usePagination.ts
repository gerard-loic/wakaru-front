import { useCallback, useMemo, useState } from "react"

export interface PaginationOptions {
  /** Nombre total d'éléments (longueur de la liste, ou `meta.total` côté Sylo). */
  total: number
  /** Éléments par page. */
  pageSize: number
  /** Page de départ, 1-indexée. Défaut : 1. */
  initialPage?: number
}

export interface Pagination {
  /** Page courante, 1-indexée, toujours comprise dans `[1, pageCount]`. */
  page: number
  /** Nombre de pages (au moins 1, même sans élément). */
  pageCount: number
  pageSize: number
  total: number
  /** Index (0-indexé, inclus) du premier élément de la page. */
  start: number
  /** Index (0-indexé, exclu) de fin de la page : `items.slice(start, end)`. */
  end: number
  hasPrev: boolean
  hasNext: boolean
  /** Va à la page demandée (bornée à `[1, pageCount]`). */
  setPage: (page: number) => void
  prev: () => void
  next: () => void
}

/**
 * État de pagination, indépendant de la source des données : convient à une
 * liste chargée en entier comme à une API paginée (passer `meta.total`, puis
 * `page` / `pageSize` à la requête).
 */
export function usePagination({
  total,
  pageSize,
  initialPage = 1,
}: PaginationOptions): Pagination {
  const [requested, setRequested] = useState(initialPage)

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  // Borne à l'affichage plutôt qu'en effet : si `total` diminue, on ne rend
  // jamais une page vide.
  const page = clamp(requested, 1, pageCount)
  const start = (page - 1) * pageSize

  const setPage = useCallback(
    (p: number) => setRequested(clamp(Math.trunc(p), 1, pageCount)),
    [pageCount],
  )

  return {
    page,
    pageCount,
    pageSize,
    total,
    start,
    end: Math.min(start + pageSize, total),
    hasPrev: page > 1,
    hasNext: page < pageCount,
    setPage,
    prev: () => setPage(page - 1),
    next: () => setPage(page + 1),
  }
}

/**
 * Pagination d'une liste déjà en mémoire. Revient à la première page dès que
 * la liste change (nouvelle recherche, nouveau filtre) : `items` doit donc être
 * stable entre deux rendus (`useMemo`).
 */
export function usePaginatedItems<T>(
  items: T[],
  pageSize: number,
): Pagination & { pageItems: T[] } {
  const pagination = usePagination({ total: items.length, pageSize })

  // Réinitialisation pendant le rendu (pattern React « ajuster l'état quand
  // une prop change ») : évite d'afficher une frame sur l'ancienne page.
  const [source, setSource] = useState(items)
  if (source !== items) {
    setSource(items)
    pagination.setPage(1)
  }

  const { start, end } = pagination
  const pageItems = useMemo(() => items.slice(start, end), [items, start, end])

  return { ...pagination, pageItems }
}

/** Élément de la barre de pagination : un numéro de page, ou une ellipse. */
export type PageRangeItem = number | "…"

/**
 * Numéros de page à afficher : toujours la première et la dernière, la page
 * courante entourée de `siblings` voisines, et « … » pour les trous. La
 * longueur reste constante quand la page courante change, ce qui évite que les
 * boutons bougent sous le curseur.
 *
 *   pageRange(1, 3)   -> [1, 2, 3]
 *   pageRange(6, 20)  -> [1, "…", 5, 6, 7, "…", 20]
 *   pageRange(2, 20)  -> [1, 2, 3, 4, 5, "…", 20]
 */
export function pageRange(
  page: number,
  pageCount: number,
  siblings = 1,
): PageRangeItem[] {
  // Première + dernière + courante + voisines + deux ellipses.
  const slots = 2 * siblings + 5
  if (pageCount <= slots) return range(1, pageCount)

  const left = Math.max(page - siblings, 1)
  const right = Math.min(page + siblings, pageCount)
  const showLeftGap = left > 3
  const showRightGap = right < pageCount - 2
  const edge = slots - 2 // éléments d'un bloc collé à une extrémité

  if (!showLeftGap) return [...range(1, edge), "…", pageCount]
  if (!showRightGap) return [1, "…", ...range(pageCount - edge + 1, pageCount)]
  return [1, "…", ...range(left, right), "…", pageCount]
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
