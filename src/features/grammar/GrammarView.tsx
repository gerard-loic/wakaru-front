import { useMemo, useRef } from "react"
import type { Pagination as PaginationState } from "@/lib/usePagination"
import { SectionHead } from "@/components/SectionHead"
import { Search } from "@/components/Search"
import { Empty } from "@/components/Empty"
import FilterSelect from "@/components/FilterSelect"
import ThemeFilter from "@/components/ThemeFilter"
import FilterBar from "@/components/FilterBar"
import { Pagination } from "@/components/Pagination"
import type { RuleCategory, RuleEntry } from "@/features/grammar/ruleModel"
import type { ThemeOption } from "@/features/themes/useThemeOptions"
import { RuleRow } from "./RuleRow"

export function GrammarView({
  rules,
  loading = false,
  error = null,
  onRetry,
  pagination,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  theme,
  onThemeChange,
  categories,
  themes,
  onOpen,
}: {
  /** Règles de la page courante, triées par catégorie. */
  rules: RuleEntry[]
  /** Chargement en cours : squelette au premier chargement, liste estompée ensuite. */
  loading?: boolean
  /** Message d'erreur à afficher à la place de la liste. */
  error?: string | null
  /** Action du bouton « Réessayer » en cas d'erreur. */
  onRetry?: () => void
  pagination: PaginationState
  query: string
  onQueryChange: (query: string) => void
  /** Catégorie sélectionnée (`RuleCategory.id`), ou `null` pour toutes. */
  category: number | null
  onCategoryChange: (category: number | null) => void
  /** Thème sélectionné (`theme.id`), ou `null` pour tous. */
  theme: number | null
  onThemeChange: (theme: number | null) => void
  themes: ThemeOption[]
  categories: RuleCategory[]
  /** Ouvre le détail d'une règle (popin). */
  onOpen: (id: number) => void
}) {
  const firstLoad = loading && rules.length === 0
  const filtering = query.trim() !== "" || category !== null || theme !== null
  const groups = useMemo(() => groupByCategory(rules), [rules])

  const listRef = useRef<HTMLDivElement>(null)
  const goToPage = (page: number) => {
    pagination.setPage(page)
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const count = firstLoad
    ? "Chargement…"
    : `${pagination.total} ${filtering ? "résultat" : "règle"}${pagination.total > 1 ? "s" : ""}`

  return (
    <div>
      <SectionHead title="Grammaire" jp="文法規則" count={count}>
        <Search
          value={query}
          onChange={onQueryChange}
          placeholder="Rechercher une règle, une particule…"
        />
      </SectionHead>

      <FilterBar>
        <FilterSelect
          label="Catégorie"
          allLabel="Toutes"
          value={category}
          onChange={onCategoryChange}
          options={categories}
        />
        <ThemeFilter value={theme} onChange={onThemeChange} themes={themes} />
      </FilterBar>

      {error ? (
        <div
          role="alert"
          className="border border-ember/40 bg-ember/5 px-4 py-6 flex flex-col items-center gap-3 text-center"
        >
          <p className="mono text-xs text-ember">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mono text-xs uppercase tracking-[0.1em] text-ember hover:text-ember-soft underline underline-offset-4"
            >
              Réessayer
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            ref={listRef}
            aria-busy={loading}
            className={
              "space-y-8 scroll-mt-6 transition-opacity " +
              (loading && !firstLoad ? "opacity-50" : "")
            }
          >
            {firstLoad ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-20 border border-line bg-panel animate-pulse" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="border border-line">
                <Empty />
              </div>
            ) : (
              groups.map((g) => (
                <section key={g.key}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="mono text-[11px] uppercase tracking-[0.14em] text-ember">
                      {g.name}
                    </h2>
                    <div className="h-px flex-1 bg-line" />
                    <span className="mono text-[10px] text-fog">{g.rules.length}</span>
                  </div>
                  <div className="space-y-3">
                    {g.rules.map((r) => (
                      <RuleRow key={r.id} rule={r} onOpen={() => onOpen(r.id)} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>

          <Pagination
            className="mt-6"
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={goToPage}
            start={pagination.start}
            end={pagination.end}
            total={pagination.total}
            unit="règles"
          />
        </>
      )}
    </div>
  )
}

/** Regroupe les règles consécutives de même catégorie (la liste arrive triée). */
function groupByCategory(rules: RuleEntry[]) {
  const groups: { key: string; name: string; rules: RuleEntry[] }[] = []
  for (const r of rules) {
    const key = String(r.category?.id ?? "none")
    const last = groups[groups.length - 1]
    if (last?.key === key) last.rules.push(r)
    else groups.push({ key, name: r.category?.name ?? "Sans catégorie", rules: [r] })
  }
  return groups
}
