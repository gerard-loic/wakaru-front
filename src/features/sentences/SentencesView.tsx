import { useRef } from "react"
import type { Pagination as PaginationState } from "@/lib/usePagination"
import { SectionHead } from "@/components/SectionHead"
import { Search } from "@/components/Search"
import { ExerciseCta } from "@/components/ExerciseCta"
import { MasteryDot, MasteryLegend } from "@/components/Mastery"
import { Empty } from "@/components/Empty"
import ThemeFilter from "@/components/ThemeFilter"
import FilterBar from "@/components/FilterBar"
import { Pagination } from "@/components/Pagination"
import type { ThemeOption } from "@/features/themes/useThemeOptions"
import { LevelBadge, ThemeTag } from "@/components/Badges"
import type { SentenceEntry } from "@/features/sentences/sentenceModel"
import type { Mastery } from "@/lib/mastery"

export function SentencesView({
  sentences,
  loading = false,
  error = null,
  onRetry,
  pagination,
  query,
  onQueryChange,
  theme,
  onThemeChange,
  mastery,
  onMasteryChange,
  themes,
  onOpen,
  onExercise,
}: {
  /** Phrases de la page courante. */
  sentences: SentenceEntry[]
  /** Chargement en cours : squelette au premier chargement, liste estompée ensuite. */
  loading?: boolean
  /** Message d'erreur à afficher à la place de la liste. */
  error?: string | null
  /** Action du bouton « Réessayer » en cas d'erreur. */
  onRetry?: () => void
  pagination: PaginationState
  query: string
  onQueryChange: (query: string) => void
  /** Thème sélectionné, ou `null` pour tous. */
  theme: number | null
  onThemeChange: (theme: number | null) => void
  /** Niveau de maîtrise sélectionné, ou `null` pour tous. */
  mastery: Mastery | null
  onMasteryChange: (mastery: Mastery | null) => void
  themes: ThemeOption[]
  /** Ouvre le détail d'une phrase (popin). */
  onOpen: (id: number) => void
  /** Absent si le sujet n'est pas proposé à l'entraînement : bouton masqué. */
  onExercise?: () => void
}) {
  const firstLoad = loading && sentences.length === 0
  const filtering = query.trim() !== "" || theme !== null || mastery !== null

  const listRef = useRef<HTMLDivElement>(null)
  const goToPage = (page: number) => {
    pagination.setPage(page)
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const count = firstLoad
    ? "Chargement…"
    : `${pagination.total} ${filtering ? "résultat" : "phrase"}${pagination.total > 1 ? "s" : ""}`

  return (
    <div>
      <SectionHead title="Phrases" jp="例文集" count={count}>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            {onExercise && <ExerciseCta onClick={onExercise} />}
            <Search
              value={query}
              onChange={onQueryChange}
              placeholder="Rechercher dans les phrases…"
            />
          </div>
          <MasteryLegend withNew value={mastery} onChange={onMasteryChange} />
        </div>
      </SectionHead>

      <FilterBar>
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
              "grid gap-4 lg:grid-cols-2 scroll-mt-6 transition-opacity " +
              (loading && !firstLoad ? "opacity-50" : "")
            }
          >
            {firstLoad ? (
              Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-36 border border-line bg-panel animate-pulse" />
              ))
            ) : sentences.length === 0 ? (
              <div className="border border-line lg:col-span-2">
                <Empty />
              </div>
            ) : (
              sentences.map((s) => (
                <SentenceCard key={s.id} sentence={s} onOpen={() => onOpen(s.id)} />
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
            unit="phrases"
          />
        </>
      )}
    </div>
  )
}

export function SentenceCard({
  sentence: s,
  onOpen,
}: {
  sentence: SentenceEntry
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group text-left border border-line bg-panel p-5 hover:border-ember transition-colors cursor-pointer flex flex-col"
    >
      <div className="flex items-start gap-3">
        <MasteryDot level={s.mastery} className="mt-3" />
        <p className="jp text-2xl leading-relaxed group-hover:text-ember transition-colors">
          {s.text}
        </p>
      </div>
      <p className="text-sm text-chalk/80 mt-2 pl-5.5">{s.translation}</p>
      <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-line">
        {s.level && <LevelBadge level={s.level} />}
        {s.theme && <ThemeTag name={s.theme.name} />}
        <span className="ml-auto mono text-[10px] uppercase tracking-[0.1em] text-fog group-hover:text-ember transition-colors">
          Analyser →
        </span>
      </div>
    </button>
  )
}
