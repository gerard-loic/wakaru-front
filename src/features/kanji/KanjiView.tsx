import { useRef } from "react"
import type { Pagination as PaginationState } from "@/lib/usePagination"
import { SectionHead } from "@/components/SectionHead"
import { Search } from "@/components/Search"
import { ExerciseCta } from "@/components/ExerciseCta"
import { MasteryDot, MasteryLegend } from "@/components/Mastery"
import { Empty } from "@/components/Empty"
import { Pagination } from "@/components/Pagination"
import ThemeFilter from "@/components/ThemeFilter"
import FilterBar from "@/components/FilterBar"
import { LevelBadge } from "@/components/Badges"
import type { KanjiEntry } from "@/features/kanji/kanjiModel"
import type { ThemeOption } from "@/features/themes/useThemeOptions"
import type { Mastery } from "@/lib/mastery"

/** Colonnes partagées par l'en-tête et les lignes. */
const COLS = "grid-cols-[auto_1fr] md:grid-cols-[4.5rem_1fr_1fr_1.6fr]"

export function KanjiView({
  kanjis,
  loading = false,
  error = null,
  onRetry,
  pagination,
  query,
  onQueryChange,
  theme,
  onThemeChange,
  themes,
  mastery,
  onMasteryChange,
  onOpen,
  onExercise,
}: {
  /** Kanji de la page courante. */
  kanjis: KanjiEntry[]
  /** Chargement en cours : squelette au premier chargement, liste estompée ensuite. */
  loading?: boolean
  /** Message d'erreur à afficher à la place de la liste. */
  error?: string | null
  /** Action du bouton « Réessayer » en cas d'erreur. */
  onRetry?: () => void
  pagination: PaginationState
  query: string
  onQueryChange: (query: string) => void
  /** Thème sélectionné (`theme.id`), ou `null` pour tous. */
  theme: number | null
  onThemeChange: (theme: number | null) => void
  themes: ThemeOption[]
  /** Niveau de maîtrise sélectionné, ou `null` pour tous. */
  mastery: Mastery | null
  onMasteryChange: (mastery: Mastery | null) => void
  /** Ouvre le détail d'un kanji (popin). */
  onOpen: (id: number) => void
  /** Absent si le sujet n'est pas proposé à l'entraînement : bouton masqué. */
  onExercise?: () => void
}) {
  const firstLoad = loading && kanjis.length === 0
  const filtering = query.trim() !== "" || theme !== null || mastery !== null

  const listRef = useRef<HTMLDivElement>(null)
  const goToPage = (page: number) => {
    pagination.setPage(page)
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const count = firstLoad
    ? "Chargement…"
    : filtering
      ? `${pagination.total} résultat${pagination.total > 1 ? "s" : ""}`
      : `${pagination.total} kanji`

  return (
    <div>
      <SectionHead title="Kanji" jp="漢字リスト" count={count}>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            {onExercise && <ExerciseCta onClick={onExercise} />}
            <Search
              value={query}
              onChange={onQueryChange}
              placeholder="Rechercher un kanji, une lecture, un sens…"
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
              "border border-line divide-y divide-line scroll-mt-6 transition-opacity " +
              (loading && !firstLoad ? "opacity-50" : "")
            }
          >
            <div
              className={`hidden md:grid ${COLS} gap-4 px-4 py-2.5 bg-panel mono text-[10px] uppercase tracking-[0.12em] text-fog`}
            >
              <span>Kanji</span>
              <span>Lecture ON</span>
              <span>Lecture KUN</span>
              <span>Sens</span>
            </div>

            {firstLoad ? (
              Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="px-4 py-4 flex items-center gap-4">
                  <div className="size-12 bg-panel animate-pulse" />
                  <div className="h-4 flex-1 max-w-xs bg-panel animate-pulse" />
                </div>
              ))
            ) : kanjis.length === 0 ? (
              <Empty />
            ) : (
              kanjis.map((k) => (
                <KanjiRow key={k.id} kanji={k} onOpen={() => onOpen(k.id)} />
              ))
            )}
          </div>

          <Pagination
            className="mt-5"
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={goToPage}
            start={pagination.start}
            end={pagination.end}
            total={pagination.total}
            unit="kanji"
          />
        </>
      )}
    </div>
  )
}

function KanjiRow({ kanji: k, onOpen }: { kanji: KanjiEntry; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`group w-full grid ${COLS} gap-4 px-4 py-3.5 items-center text-left cursor-pointer hover:bg-panel/60 transition-colors`}
    >
      <div className="relative jp text-4xl leading-none w-14 group-hover:text-ember transition-colors">
        <MasteryDot level={k.mastery} className="absolute -top-1 -right-1" />
        {k.char}
      </div>
      <div className="jp text-sm text-fog hidden md:block">
        {k.on.join("・") || "—"}
      </div>
      <div className="jp text-sm text-fog hidden md:block">
        {k.kun.join("・") || "—"}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm">{k.meaning}</span>
        {k.otherMeanings.length > 0 && (
          <span className="text-sm text-fog">
            · {k.otherMeanings.join(", ")}
          </span>
        )}
        {k.level && <LevelBadge level={k.level} />}
      </div>
    </button>
  )
}
