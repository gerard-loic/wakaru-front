import { speak } from "@/lib/speak"
import type { Mastery } from "@/lib/mastery"
import { SectionHead } from "@/components/SectionHead"
import { ExerciseCta } from "@/components/ExerciseCta"
import { Empty } from "@/components/Empty"
import { MasteryDot, MasteryLegend } from "@/components/Mastery"

/** Kana prêt à afficher. */
export interface KanaEntry {
  id: number
  kana: string
  romaji: string
  /** Maîtrise de l'utilisateur connecté (`user_knowledge.type`). */
  mastery: Mastery
}

/** Sous-catégorie de kana. Sans `title`, la grille est affichée sans en-tête. */
export interface KanaSection {
  key: string
  title?: string
  jp?: string
  items: KanaEntry[]
  /** Kana par ligne : 5 (a・i・u・e・o, défaut) ou 3 (ya・yu・yo, pour les yōon). */
  columns?: 3 | 5
}

/**
 * Une ligne par série, à toutes les tailles d'écran. La largeur max de la grille
 * à 3 colonnes vaut 3/5 de celle à 5 colonnes : les cases gardent la même taille.
 */
const GRID = {
  5: "grid grid-cols-5 gap-1.5 sm:gap-2 max-w-3xl",
  3: "grid grid-cols-3 gap-1.5 sm:gap-2 max-w-[28.8rem]",
} as const

export function KanaView({
  title,
  jp,
  sections,
  total,
  counts,
  mastery,
  onMasteryChange,
  loading = false,
  error = null,
  onRetry,
  onExercise,
}: {
  title: string
  jp: string
  /** Sections à afficher (déjà filtrées par maîtrise). */
  sections: KanaSection[]
  /** Nombre total de caractères du syllabaire (sans filtre). */
  total: number
  /** Effectif par niveau de maîtrise, affiché dans le filtre. */
  counts?: Partial<Record<Mastery, number>>
  /** Niveau de maîtrise sélectionné, ou `null` pour tous. */
  mastery: Mastery | null
  onMasteryChange: (mastery: Mastery | null) => void
  /** Affiche un état de chargement à la place des grilles. */
  loading?: boolean
  /** Message d'erreur à afficher à la place des grilles. */
  error?: string | null
  /** Action du bouton « Réessayer » en cas d'erreur. */
  onRetry?: () => void
  /** Absent si le sujet n'est pas proposé à l'entraînement : bouton masqué. */
  onExercise?: () => void
}) {
  const shown = sections.reduce((n, s) => n + s.items.length, 0)
  const count = loading
    ? "Chargement…"
    : mastery
      ? `${shown} résultat${shown > 1 ? "s" : ""}`
      : `${total} caractères`

  return (
    <div>
      <SectionHead title={title} jp={jp} count={count}>
        <div className="flex flex-col items-end gap-3">
          {onExercise && <ExerciseCta onClick={onExercise} />}
          <MasteryLegend
            withNew
            value={mastery}
            onChange={onMasteryChange}
            counts={loading ? undefined : counts}
          />
        </div>
      </SectionHead>
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
      ) : loading ? (
        <div className={GRID[5]}>
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className="aspect-square border border-line bg-panel animate-pulse"
            />
          ))}
        </div>
      ) : shown === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.key}>
              {section.title && (
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="display text-xl font-700 tracking-tight leading-none">
                    {section.title}
                  </h2>
                  {section.jp && (
                    <span className="jp text-fog text-sm">{section.jp}</span>
                  )}
                  <span className="mono text-xs text-fog">
                    / {section.items.length}
                  </span>
                  <div className="flex-1 h-px bg-line" />
                </div>
              )}
              <div className={GRID[section.columns ?? 5]}>
                {section.items.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => speak(k.kana)}
                    className="group relative aspect-square border border-line bg-panel hover:border-ember hover:bg-panel-2 transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <MasteryDot
                      level={k.mastery}
                      className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5"
                    />
                    <span className="jp text-2xl sm:text-4xl leading-none group-hover:text-ember transition-colors">
                      {k.kana}
                    </span>
                    <span className="mono text-[10px] sm:text-xs text-fog uppercase tracking-[0.1em]">
                      {k.romaji}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
