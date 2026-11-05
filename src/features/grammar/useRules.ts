import { useMemo, useState } from "react"
import { sf, sylo } from "@/lib/sylo"
import { likeAny } from "@/lib/syloValues"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { usePagedRemote } from "@/lib/usePagedRemote"
import type { Pagination } from "@/lib/usePagination"
import { useRemote } from "@/lib/useRemote"
import {
  RULE_RELATIONS,
  WITH_KNOWLEDGE,
  toCategory,
  toRule,
  type RuleCategory,
  type RuleCategoryRecord,
  type RuleEntry,
  type RuleRecord,
} from "@/features/grammar/ruleModel"
import { useThemeOptions, type ThemeOption } from "@/features/themes/useThemeOptions"

export interface UseRules {
  /** Règles de la page courante, triées par catégorie puis par titre. */
  rules: RuleEntry[]
  /** `true` pendant un appel réseau (les règles de la page précédente restent affichées). */
  loading: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  reload: () => void
  /** Pagination côté serveur (`total` = nombre de règles correspondant aux critères). */
  pagination: Pagination
  /** Texte recherché, tel que saisi (la requête part après une pause de frappe). */
  query: string
  setQuery: (query: string) => void
  /** Catégorie sélectionnée (`RuleCategory.id`), ou `null` pour toutes. */
  category: number | null
  setCategory: (category: number | null) => void
  /** Thème sélectionné (`theme.id`), ou `null` pour tous. */
  theme: number | null
  setTheme: (theme: number | null) => void
  /** Catégories proposées en filtre. */
  categories: RuleCategory[]
  /** Thèmes proposés en filtre. */
  themes: ThemeOption[]
}

/** Règles par page. */
const PAGE_SIZE = 20

/**
 * Règles de grammaire paginées et filtrées côté API (`QUERY /grammar_rules`) :
 * seule la page courante est chargée. Porte l'état des critères ; ne touche
 * pas à l'affichage.
 */
export function useRules(): UseRules {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<number | null>(null)
  const [theme, setTheme] = useState<number | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim())

  // Filtre : échec non bloquant, la liste reste utilisable sans.
  const categories = useRemote(
    async () =>
      (
        await sylo
          .listAll<RuleCategoryRecord>("grammar_categories", { orderby: "id.ASC" })
          .catch(() => [])
      ).map(toCategory),
    [],
    [],
  )

  const themes = useThemeOptions()

  const page = usePagedRemote<RuleRecord>(
    ({ page, pageSize }) =>
      sylo.query<RuleRecord>("grammar_rules", {
        filter:
          sf.and(
            likeAny(debouncedQuery, ["name", "description"]),
            category != null && sf.eq("grammar_category_id", category),
            theme != null && sf.eq("theme_id", theme),
          ) || undefined,
        page,
        limit: pageSize,
        // Tri par catégorie : la vue regroupe les règles consécutives.
        orderby: ["grammar_category_id.ASC", "name.ASC", "id.ASC"],
        with: RULE_RELATIONS,
        extra: WITH_KNOWLEDGE,
      }),
    { pageSize: PAGE_SIZE, deps: [debouncedQuery, category, theme] },
  )

  const rules = useMemo(() => page.data.map(toRule), [page.data])

  return {
    rules,
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
    categories: categories.data,
    themes,
  }
}
