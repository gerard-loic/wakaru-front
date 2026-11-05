import { useRef } from "react"
import type { Pagination as PaginationState } from "@/lib/usePagination"
import { SectionHead } from "@/components/SectionHead"
import { Search } from "@/components/Search"
import { ExerciseCta } from "@/components/ExerciseCta"
import { MasteryDot, MasteryLegend } from "@/components/Mastery"
import { Empty } from "@/components/Empty"
import FilterSelect from "@/components/FilterSelect"
import ThemeFilter from "@/components/ThemeFilter"
import FilterBar from "@/components/FilterBar"
import { Pagination } from "@/components/Pagination"
import type { PartOfSpeech, VocabWord } from "@/features/vocab/useWords"
import { wordDotLevel } from "@/features/vocab/wordModel"
import type { ThemeOption } from "@/features/themes/useThemeOptions"
import type { Mastery } from "@/lib/mastery"
import { LevelBadge } from "@/components/Badges"

/** Colonnes partagées par l'en-tête et les lignes. */
const COLS = "md:grid-cols-[1.2fr_2fr_0.9fr]"

export function VocabView({
  words,
  loading = false,
  error = null,
  onRetry,
  pagination,
  query,
  onQueryChange,
  pos,
  onPosChange,
  theme,
  onThemeChange,
  mastery,
  onMasteryChange,
  partsOfSpeech,
  themes,
  onOpen,
  onExercise,
}: {
  /** Mots de la page courante. */
  words: VocabWord[]
  /** Chargement en cours : squelette au premier chargement, liste estompée ensuite. */
  loading?: boolean
  /** Message d'erreur à afficher à la place de la liste. */
  error?: string | null
  /** Action du bouton « Réessayer » en cas d'erreur. */
  onRetry?: () => void
  pagination: PaginationState
  query: string
  onQueryChange: (query: string) => void
  /** Nature sélectionnée (`PartOfSpeech.id`), ou `null` pour toutes. */
  pos: number | null
  onPosChange: (pos: number | null) => void
  /** Thème sélectionné (`theme.id`), ou `null` pour tous. */
  theme: number | null
  onThemeChange: (theme: number | null) => void
  themes: ThemeOption[]
  /** Niveau de maîtrise sélectionné, ou `null` pour tous. */
  mastery: Mastery | null
  onMasteryChange: (mastery: Mastery | null) => void
  partsOfSpeech: PartOfSpeech[]
  /** Ouvre le détail d'un mot (popin). */
  onOpen: (id: number) => void
  /** Absent si le sujet n'est pas proposé à l'entraînement : bouton masqué. */
  onExercise?: () => void
}) {
  const firstLoad = loading && words.length === 0
  const filtering =
    query.trim() !== "" || pos !== null || theme !== null || mastery !== null

  const listRef = useRef<HTMLDivElement>(null)
  const goToPage = (page: number) => {
    pagination.setPage(page)
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const count = firstLoad
    ? "Chargement…"
    : `${pagination.total} ${filtering ? "résultat" : "mot"}${pagination.total > 1 ? "s" : ""}`

  return (
    <div>
      <SectionHead title="Vocabulaire" jp="単語リスト" count={count}>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            {onExercise && <ExerciseCta onClick={onExercise} />}
            <Search
              value={query}
              onChange={onQueryChange}
              placeholder="Rechercher un mot, une lecture, un sens…"
            />
          </div>
          <MasteryLegend withNew value={mastery} onChange={onMasteryChange} />
        </div>
      </SectionHead>

      <FilterBar>
        <FilterSelect
          label="Nature"
          allLabel="Toutes"
          value={pos}
          onChange={onPosChange}
          options={partsOfSpeech}
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
            <div
              className={`hidden md:grid ${COLS} gap-4 px-4 py-2.5 bg-panel mono text-[10px] uppercase tracking-[0.12em] text-fog`}
            >
              <span>Mot</span>
              <span>Traduction</span>
              <span>Nature</span>
            </div>

            {firstLoad ? (
              Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="px-4 py-4 flex items-center gap-4">
                  <div className="h-7 w-24 bg-panel animate-pulse" />
                  <div className="h-4 flex-1 max-w-xs bg-panel animate-pulse" />
                </div>
              ))
            ) : words.length === 0 ? (
              <Empty />
            ) : (
              words.map((w) => (
                <WordRow key={w.id} word={w} onOpen={() => onOpen(w.id)} />
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
            unit="mots"
          />
        </>
      )}
    </div>
  )
}

function WordRow({ word: w, onOpen }: { word: VocabWord; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`group w-full grid grid-cols-1 ${COLS} gap-x-4 gap-y-1 px-4 py-3.5 items-center text-left cursor-pointer hover:bg-panel/60 transition-colors`}
    >
      <div className="flex items-center gap-2.5">
        <MasteryDot level={wordDotLevel(w)} />
        <span className="jp text-2xl group-hover:text-ember transition-colors">
          {w.writing}
        </span>
        {w.level && <LevelBadge level={w.level} />}
      </div>
      <div className="text-sm">{w.translations.join(", ")}</div>
      <div
        className="mono text-[10px] uppercase tracking-[0.1em] text-fog"
        title={w.partOfSpeech?.name}
      >
        {w.partOfSpeech?.caption}
      </div>
    </button>
  )
}
