import { Link } from "react-router-dom"

/** Niveau JLPT (`N5`…). */
export function LevelBadge({ level }: { level: string }) {
  return (
    <span className="mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-[2px] border border-line text-fog leading-none">
      {level}
    </span>
  )
}

const THEME_TAG =
  "mono text-[10px] uppercase tracking-[0.1em] leading-snug px-2 py-[3px] border border-line text-fog"

/**
 * Thème rattaché à un élément (mot, kanji…). Avec `id`, lien vers la page du
 * thème (à ne pas passer quand le tag est déjà dans un bouton ou un lien).
 */
export function ThemeTag({ name, id }: { name: string; id?: number }) {
  if (id == null) return <span className={THEME_TAG}>{name}</span>
  return (
    <Link
      to={`/themes/${id}`}
      className={`${THEME_TAG} hover:border-ember hover:text-ember transition-colors`}
    >
      {name} →
    </Link>
  )
}
