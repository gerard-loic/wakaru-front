import { formatDate } from "@/lib/format"
import { SectionHead } from "@/components/SectionHead"
import { Empty } from "@/components/Empty"
import { NewTag } from "@/components/NewTag"
import type { ThemeEntry } from "@/features/themes/themeModel"
import { ExoProgress } from "./ExoProgress"

export function ThemesView({
  themes,
  loading = false,
  error = null,
  onRetry,
  onOpen,
}: {
  /** Thèmes, du plus récent au plus ancien. */
  themes: ThemeEntry[]
  /** Chargement en cours : squelette au premier chargement, liste estompée ensuite. */
  loading?: boolean
  /** Message d'erreur à afficher à la place de la liste. */
  error?: string | null
  /** Action du bouton « Réessayer » en cas d'erreur. */
  onRetry?: () => void
  onOpen: (id: number) => void
}) {
  const firstLoad = loading && themes.length === 0
  const count = firstLoad
    ? "Chargement…"
    : `${themes.length} thème${themes.length > 1 ? "s" : ""}`

  return (
    <div>
      <SectionHead title="Thèmes" jp="テーマ一覧" count={count} />
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
      ) : !firstLoad && themes.length === 0 ? (
        <Empty />
      ) : (
        <div
          aria-busy={loading}
          className={
            "grid gap-5 sm:grid-cols-2 xl:grid-cols-3 transition-opacity " +
            (loading && !firstLoad ? "opacity-50" : "")
          }
        >
          {firstLoad
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="border border-line bg-panel animate-pulse">
                  <div className="aspect-[3/2] bg-panel-2" />
                  <div className="h-24" />
                </div>
              ))
            : themes.map((t) => {
                return (
                <button
                  key={t.id}
                  onClick={() => onOpen(t.id)}
                  className="group text-left border border-line bg-panel hover:border-ember transition-colors overflow-hidden"
                >
                  <div className="relative aspect-[3/2] bg-panel-2 overflow-hidden">
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={t.name}
                        className="size-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="size-full grid place-items-center jp text-5xl text-line-bright">
                        課
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                    {t.isNew && <NewTag className="absolute top-3 right-3" />}
                    {t.imageCredit && (
                      <span className="absolute bottom-2 right-2 max-w-[90%] truncate mono text-[9px] text-fog/80">
                        © {t.imageCredit}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="display text-xl font-700 leading-tight group-hover:text-ember transition-colors">
                        {t.name}
                      </h3>
                      <span className="text-ember mt-1 shrink-0 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                    {t.date && (
                      <div className="mono text-[10px] text-fog mt-3">
                        {formatDate(t.date)}
                      </div>
                    )}
                    {t.description && (
                      <p className="text-sm text-fog mt-3 line-clamp-3">
                        {t.description}
                      </p>
                    )}
                    <div className="mt-4">
                      <ExoProgress program={t.program} />
                    </div>
                  </div>
                </button>
                )
              })}
        </div>
      )}
    </div>
  )
}
