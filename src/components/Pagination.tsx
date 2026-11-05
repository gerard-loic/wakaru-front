import type { ReactNode } from "react"
import { pageRange } from "@/lib/usePagination"

/**
 * Barre de pagination. Purement présentationnelle : se branche sur
 * `usePagination` / `usePaginatedItems` (ou tout autre état de page).
 * Ne s'affiche pas quand tout tient sur une page.
 */
export function Pagination({
  page,
  pageCount,
  onChange,
  start,
  end,
  total,
  unit = "éléments",
  className = "",
}: {
  /** Page courante, 1-indexée. */
  page: number
  pageCount: number
  onChange: (page: number) => void
  /** Avec `end` et `total` : affiche « 21–26 sur 26 mots ». */
  start?: number
  end?: number
  total?: number
  /** Libellé des éléments dans le résumé. Défaut : « éléments ». */
  unit?: string
  className?: string
}) {
  if (pageCount <= 1) return null

  const summary =
    start != null && end != null && total != null
      ? `${start + 1}–${end} sur ${total} ${unit}`
      : `Page ${page} sur ${pageCount}`

  return (
    <nav
      aria-label="Pagination"
      className={
        "flex flex-wrap items-center justify-between gap-3 " + className
      }
    >
      <span className="mono text-[11px] text-fog" aria-live="polite">
        {summary}
      </span>

      <div className="flex items-center gap-1">
        <PageButton
          label="Page précédente"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          ←
        </PageButton>

        {pageRange(page, pageCount).map((item, i) =>
          item === "…" ? (
            <span
              key={`gap-${i}`}
              className="mono text-xs text-fog w-8 text-center select-none"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PageButton
              key={item}
              label={`Page ${item}`}
              current={item === page}
              onClick={() => onChange(item)}
            >
              {item}
            </PageButton>
          ),
        )}

        <PageButton
          label="Page suivante"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          →
        </PageButton>
      </div>
    </nav>
  )
}

function PageButton({
  label,
  current = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  current?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? "page" : undefined}
      disabled={disabled || current}
      onClick={onClick}
      className={
        "mono text-xs min-w-8 h-8 px-2 border transition-colors " +
        (current
          ? "bg-ember border-ember text-ink font-600 cursor-default"
          : "border-line text-fog hover:border-line-bright hover:text-chalk " +
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-fog")
      }
    >
      {children}
    </button>
  )
}
