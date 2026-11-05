import { useMemo, useState } from "react"
import { knowledgeFilter, type Mastery } from "@/lib/mastery"
import { sf, sylo } from "@/lib/sylo"
import { likeAny } from "@/lib/syloValues"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { usePagedRemote } from "@/lib/usePagedRemote"
import type { Pagination } from "@/lib/usePagination"
import { useRemote } from "@/lib/useRemote"
import {
  EXERCISE_RELATIONS,
  WITH_KNOWLEDGE,
  toCategory,
  toExercise,
  type ExerciseCategory,
  type ExerciseEntry,
  type ExerciseRecord,
} from "@/features/exercises/exerciseModel"
import { useThemeOptions, type ThemeOption } from "@/features/themes/useThemeOptions"

export interface UseExercises {
  /** Exercices de la page courante, du plus récent au plus ancien. */
  exercises: ExerciseEntry[]
  /** `true` pendant un appel réseau (les exercices de la page précédente restent affichés). */
  loading: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  reload: () => void
  /** Pagination côté serveur (`total` = nombre d'exercices correspondant aux critères). */
  pagination: Pagination
  /** Texte recherché, tel que saisi (la requête part après une pause de frappe). */
  query: string
  setQuery: (query: string) => void
  /** Catégorie sélectionnée (`ExerciseCategory.id`), ou `null` pour toutes. */
  category: number | null
  setCategory: (category: number | null) => void
  /** Thème sélectionné (`theme.id`), ou `null` pour tous. */
  theme: number | null
  setTheme: (theme: number | null) => void
  /** Niveau de maîtrise sélectionné, ou `null` pour tous. */
  mastery: Mastery | null
  setMastery: (mastery: Mastery | null) => void
  /** Catégories proposées en filtre. */
  categories: ExerciseCategory[]
  /** Thèmes proposés en filtre. */
  themes: ThemeOption[]
}

/** Exercices par page. */
const PAGE_SIZE = 20

/**
 * Exercices paginés et filtrés côté API (`QUERY /exercises`) : seule la page
 * courante est chargée. Porte l'état des critères ; ne touche pas à
 * l'affichage.
 */
export function useExercises(): UseExercises {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<number | null>(null)
  const [theme, setTheme] = useState<number | null>(null)
  const [mastery, setMastery] = useState<Mastery | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim())

  // Filtre : échec non bloquant, la liste reste utilisable sans.
  const categories = useRemote(
    async () =>
      (
        await sylo
          .listAll<{ id: number; uid: string; name: string }>("exercise_categories", {
            orderby: "id.ASC",
          })
          .catch(() => [])
      ).map(toCategory),
    [],
    [],
  )
  const themes = useThemeOptions()

  const page = usePagedRemote<ExerciseRecord>(
    ({ page, pageSize }) =>
      sylo.query<ExerciseRecord>("exercises", {
        filter:
          sf.and(
            likeAny(debouncedQuery, ["name", "instructions"]),
            category != null && sf.eq("exercise_category_id", category),
            theme != null && sf.eq("theme_id", theme),
          ) || undefined,
        page,
        limit: pageSize,
        orderby: ["created_at.DESC", "id.DESC"],
        with: EXERCISE_RELATIONS,
        extra: { ...WITH_KNOWLEDGE, ...knowledgeFilter(mastery) },
      }),
    { pageSize: PAGE_SIZE, deps: [debouncedQuery, category, theme, mastery] },
  )

  const exercises = useMemo(() => page.data.map(toExercise), [page.data])

  return {
    exercises,
    loading: page.loading,
    error: page.error,
    reload: page.reload,
    pagination: page.pagination,
    query,
    setQuery,
    category,
    setCategory,
    theme,
    setTheme,
    mastery,
    setMastery,
    categories: categories.data,
    themes,
  }
}
