import { useRef } from "react"
import type { Pagination as PaginationState } from "@/lib/usePagination"
import type { Mastery } from "@/lib/mastery"
import { formatDate } from "@/lib/format"
import { SectionHead } from "@/components/SectionHead"
import { Search } from "@/components/Search"
import { Empty } from "@/components/Empty"
import { MasteryDot, MasteryLegend } from "@/components/Mastery"
import FilterSelect from "@/components/FilterSelect"
import ThemeFilter from "@/components/ThemeFilter"
import FilterBar from "@/components/FilterBar"
import { Pagination } from "@/components/Pagination"
import type { ThemeOption } from "@/features/themes/useThemeOptions"
import { LevelBadge, ThemeTag } from "@/components/Badges"
import type {
  ExerciseCategory,
  ExerciseEntry,
} from "@/features/exercises/exerciseModel"

export function ExercisesView({
  exercises,
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
  mastery,
  onMasteryChange,
  categories,
  themes,
  onOpen,
  onRun,
}: {
  /** Exercices de la page courante. */
  exercises: ExerciseEntry[]
  /** Chargement en cours : squelette au premier chargement, liste estompée ensuite. */
  loading?: boolean
  /** Message d'erreur à afficher à la place de la liste. */
  error?: string | null
  /** Action du bouton « Réessayer » en cas d'erreur. */
  onRetry?: () => void
  pagination: PaginationState
  query: string
  onQueryChange: (query: string) => void
  /** Catégorie sélectionnée, ou `null` pour toutes. */
  category: number | null
  onCategoryChange: (category: number | null) => void
  /** Thème sélectionné, ou `null` pour tous. */
  theme: number | null
  onThemeChange: (theme: number | null) => void
  /** Niveau de maîtrise sélectionné, ou `null` pour tous. */
  mastery: Mastery | null
  onMasteryChange: (mastery: Mastery | null) => void
  categories: ExerciseCategory[]
  themes: ThemeOption[]
  onOpen: (id: number) => void
  onRun: (id: number) => void
}) {
  const firstLoad = loading && exercises.length === 0
  const filtering =
    query.trim() !== "" || category !== null || theme !== null || mastery !== null

  const listRef = useRef<HTMLDivElement>(null)
  const goToPage = (page: number) => {
    pagination.setPage(page)
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const count = firstLoad
    ? "Chargement…"
    : `${pagination.total} ${filtering ? "résultat" : "exercice"}${pagination.total > 1 ? "s" : ""}`

  return (
    <div>
      <SectionHead title="Exercices" jp="練習問題" count={count}>
        <div className="flex flex-col items-end gap-3">
          <Search
            value={query}
            onChange={onQueryChange}
            placeholder="Rechercher un exercice…"
          />
          <MasteryLegend withNew value={mastery} onChange={onMasteryChange} />
        </div>
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
              "border border-line divide-y divide-line scroll-mt-6 transition-opacity " +
              (loading && !firstLoad ? "opacity-50" : "")
            }
          >
            <div className="hidden md:grid grid-cols-[2fr_1.2fr_1.4fr_auto_auto] gap-4 px-4 py-2.5 bg-panel mono text-[10px] uppercase tracking-[0.12em] text-fog">
              <span>Titre</span>
              <span>Catégorie</span>
              <span>Thème</span>
              <span>Date</span>
              <span>Action</span>
            </div>
            {firstLoad ? (
              Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-16 bg-panel animate-pulse" />
              ))
            ) : exercises.length === 0 ? (
              <Empty />
            ) : (
              exercises.map((e) => (
                <ExerciseRow
                  key={e.id}
                  e={e}
                  onOpen={() => onOpen(e.id)}
                  onRun={() => onRun(e.id)}
                />
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
            unit="exercices"
          />
        </>
      )}
    </div>
  )
}

function ExerciseRow({
  e,
  onOpen,
  onRun,
}: {
  e: ExerciseEntry
  onOpen: () => void
  onRun: () => void
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.2fr_1.4fr_auto_auto] gap-4 px-4 py-3.5 items-center hover:bg-panel/60 transition-colors group">
      <button onClick={onOpen} className="text-left min-w-0">
        <div className="flex items-center gap-2">
          <MasteryDot level={e.mastery} />
          <span className="text-sm group-hover:text-ember transition-colors">
            {e.title}
          </span>
          {e.level && <LevelBadge level={e.level} />}
        </div>
        {e.instructions && (
          <div className="text-xs text-fog mt-0.5 pl-4.5 line-clamp-1">
            {e.instructions}
          </div>
        )}
      </button>
      <div className="mono text-xs text-ember hidden md:block">
        {e.category?.name}
      </div>
      <div className="col-start-1 md:col-start-3 flex flex-wrap gap-1.5">
        {e.theme && <ThemeTag name={e.theme.name} id={e.theme.id} />}
      </div>
      <div className="hidden md:block mono text-[11px] text-fog">
        {e.date && formatDate(e.date)}
      </div>
      <div className="row-start-1 col-start-2 md:row-auto md:col-auto justify-self-end">
        <button
          onClick={onRun}
          className="mono text-[11px] uppercase tracking-[0.08em] px-3 py-2 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Lancer
        </button>
      </div>
    </div>
  )
}
