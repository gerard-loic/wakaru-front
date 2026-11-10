import { parseProgram, type WeekProgram } from "@/features/themes/themeProgram"

/**
 * Modèle « thème » (leçon) : forme brute renvoyée par Sylo, forme prête à
 * afficher et conversion.
 */

/** Enregistrement brut renvoyé par `/themes`. */
export interface ThemeRecord {
  id: number
  name: string | null
  description: string | null
  image: string | null
  image_credit: string | null
  image_licence: string | null
  created_at: string | null
  /** Présent avec `with_knowledge` : progression de l'utilisateur connecté. */
  user_knowledge?: { id: number; details: unknown; is_new?: boolean } | null
}

/** Thème prêt à afficher. */
export interface ThemeEntry {
  id: number
  name: string
  description: string | null
  image: string | null
  /** Crédit et licence de l'image, réunis pour l'affichage. */
  imageCredit: string | null
  /** Date de création (ISO), ou `null` si inconnue. */
  date: string | null
  /** Programme de la semaine, vide sans `with_knowledge`. */
  program: WeekProgram
  /** Pas encore consulté par l'utilisateur connecté (`user_knowledge.is_new`). */
  isNew: boolean
}

export function toTheme(r: ThemeRecord): ThemeEntry {
  const credit = [r.image_credit, r.image_licence]
    .map((v) => v?.trim())
    .filter(Boolean)
    .join(" · ")
  return {
    id: r.id,
    name: r.name?.trim() || `Thème ${r.id}`,
    description: r.description?.trim() || null,
    image: r.image?.trim() || null,
    imageCredit: credit || null,
    date: r.created_at,
    program: parseProgram(r.user_knowledge),
    isNew: r.user_knowledge?.is_new ?? false,
  }
}
