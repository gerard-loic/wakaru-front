import type { CSSProperties } from "react"
import { MASTERY_LEVELS, MASTERY_META, type Mastery } from "@/lib/mastery"

/**
 * Légende des niveaux de maîtrise. Avec `onChange`, chaque niveau devient un
 * filtre : un clic le sélectionne, un second clic le désélectionne (`null`).
 */
export function MasteryLegend({
  withNew = false,
  value = null,
  onChange,
  counts,
}: {
  /** Ajoute l'entrée « Nouveau » (éléments jamais travaillés). */
  withNew?: boolean
  /** Niveau sélectionné (mode filtre). */
  value?: Mastery | null
  /** Active le mode filtre. */
  onChange?: (value: Mastery | null) => void
  /** Effectif affiché à côté de chaque niveau. */
  counts?: Partial<Record<Mastery, number>>
}) {
  const levels = withNew
    ? MASTERY_LEVELS
    : MASTERY_LEVELS.filter((l) => l !== "new")

  return (
    <div
      role={onChange ? "group" : undefined}
      aria-label={onChange ? "Filtrer par maîtrise" : undefined}
      className="flex flex-wrap items-center gap-x-4 gap-y-1.5"
    >
      <span className="mono text-[10px] uppercase tracking-[0.1em] text-fog">
        Maîtrise
      </span>
      {levels.map((l) => {
        const active = onChange != null && value === l
        const content = (
          <>
            <span
              className="size-2.5 rounded-full shrink-0"
              style={dotStyle(l, active)}
            />
            <span className="mono text-[10px] uppercase tracking-[0.08em]">
              {MASTERY_META[l].label}
              {counts?.[l] != null && (
                <span className="opacity-60"> {counts[l]}</span>
              )}
            </span>
          </>
        )
        if (!onChange) {
          return (
            <span key={l} className="flex items-center gap-1.5 text-fog">
              {content}
            </span>
          )
        }
        const { color } = MASTERY_META[l]
        return (
          <button
            key={l}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : l)}
            // Filtre actif : bordure et fond teinté de la couleur du niveau.
            style={
              active
                ? { borderColor: color, background: `${color}1f` }
                : undefined
            }
            className={
              "flex items-center gap-1.5 -mx-1.5 px-1.5 py-0.5 border transition-colors cursor-pointer " +
              (active
                ? "text-chalk"
                : value
                  ? "border-transparent text-fog/50 hover:text-chalk"
                  : "border-transparent text-fog hover:text-chalk")
            }
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}

export function MasteryDot({
  level,
  className = "",
}: {
  /** `null` : pas de puce, mais sa place reste réservée pour l'alignement. */
  level: Mastery | null
  className?: string
}) {
  if (!level) {
    return <span aria-hidden className={"size-2.5 shrink-0 " + className} />
  }
  const m = MASTERY_META[level]
  return (
    <span
      title={`Maîtrise : ${m.label}`}
      className={"size-2.5 rounded-full shrink-0 " + className}
      style={dotStyle(level, true)}
    />
  )
}

/** Pastille pleine, sauf « nouveau » : anneau vide, pour signaler « pas encore travaillé ». */
function dotStyle(level: Mastery, halo: boolean): CSSProperties {
  const { color } = MASTERY_META[level]
  const glow = halo ? `, 0 0 0 3px ${color}22` : ""
  return level === "new"
    ? { boxShadow: `inset 0 0 0 2px ${color}${glow}` }
    : { background: color, boxShadow: halo ? `0 0 0 3px ${color}22` : undefined }
}
