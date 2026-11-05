import { excerpt, formatDate } from "@/lib/format"
import type { ThemeEntry } from "@/features/themes/themeModel"

/** Longueur maximale de l'extrait de description affiché dans le bandeau. */
const EXCERPT_LENGTH = 240

/** Bandeau « Thème de la semaine » : image, titre, extrait et lien vers le thème. */
export default function WeeklyTheme({
  theme,
  loading,
  error,
  onRetry,
  onOpen,
}: {
  /** Thème à afficher, `null` tant qu'il n'est pas chargé ou s'il n'y en a aucun. */
  theme: ThemeEntry | null
  loading: boolean
  error: string | null
  onRetry: () => void
  onOpen: (id: number) => void
}) {
  if (error) {
    return (
      <div
        role="alert"
        className="min-h-64 h-full bg-panel-2 p-6 flex flex-col items-center justify-center gap-3 text-center"
      >
        <p className="mono text-xs text-ember">{error}</p>
        <button
          onClick={onRetry}
          className="mono text-xs uppercase tracking-[0.1em] text-ember hover:text-ember-soft underline underline-offset-4"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (!theme) {
    return loading ? (
      <div aria-busy className="min-h-64 h-full bg-panel-2 animate-pulse" />
    ) : (
      <div className="min-h-64 h-full bg-panel-2 p-6 grid place-items-center mono text-xs text-fog">
        Aucun thème pour le moment.
      </div>
    )
  }

  return (
    <div className="relative min-h-64 h-full bg-panel-2">
      {theme.image ? (
        <img
          src={theme.image}
          alt={theme.name}
          className="absolute inset-0 size-full object-cover grayscale-[25%]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center jp text-7xl text-line-bright">
          課
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10 lg:bg-gradient-to-r" />
      <div className="relative p-6 lg:p-8 h-full flex flex-col justify-end max-w-xl">
        <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-2">
          Thème de la semaine{theme.date && ` · ${formatDate(theme.date)}`}
        </div>
        <h2 className="display text-4xl lg:text-5xl font-900 tracking-tight mb-4">
          {theme.name}
        </h2>
        {theme.description && (
          <p className="text-sm text-chalk/80 leading-relaxed mb-5">
            {excerpt(theme.description, EXCERPT_LENGTH)}
          </p>
        )}
        <div>
          <button
            onClick={() => onOpen(theme.id)}
            className="mono text-xs uppercase tracking-[0.1em] px-4 py-2.5 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors"
          >
            Explorer le thème →
          </button>
        </div>
      </div>
      {theme.imageCredit && (
        <span className="absolute bottom-2 right-3 max-w-[50%] truncate mono text-[9px] text-fog/80">
          © {theme.imageCredit}
        </span>
      )}
    </div>
  )
}
