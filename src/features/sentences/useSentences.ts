import { useMemo, useState } from "react"
import { knowledgeFilter, type Mastery } from "@/lib/mastery"
import { sf, sylo } from "@/lib/sylo"
import { likeAny } from "@/lib/syloValues"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { usePagedRemote } from "@/lib/usePagedRemote"
import type { Pagination } from "@/lib/usePagination"
import {
  SENTENCE_RELATIONS,
  WITH_KNOWLEDGE,
  toSentence,
  type SentenceEntry,
  type SentenceRecord,
} from "@/features/sentences/sentenceModel"
import { useThemeOptions, type ThemeOption } from "@/features/themes/useThemeOptions"

export interface UseSentences {
  /** Phrases de la page courante. */
  sentences: SentenceEntry[]
  /** `true` pendant un appel réseau (les phrases de la page précédente restent affichées). */
  loading: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  reload: () => void
  /** Pagination côté serveur (`total` = nombre de phrases correspondant aux critères). */
  pagination: Pagination
  /** Texte recherché, tel que saisi (la requête part après une pause de frappe). */
  query: string
  setQuery: (query: string) => void
  /** Thème sélectionné (`theme.id`), ou `null` pour tous. */
  theme: number | null
  setTheme: (theme: number | null) => void
  /** Niveau de maîtrise sélectionné, ou `null` pour tous. */
  mastery: Mastery | null
  setMastery: (mastery: Mastery | null) => void
  /** Thèmes proposés en filtre. */
  themes: ThemeOption[]
}

/** Phrases par page. */
const PAGE_SIZE = 20

/**
 * Phrases paginées et filtrées côté API (`QUERY /sentences`) : seule la page
 * courante est chargée. Porte l'état des critères ; ne touche pas à
 * l'affichage.
 */
export function useSentences(): UseSentences {
  const [query, setQuery] = useState("")
  const [theme, setTheme] = useState<number | null>(null)
  const [mastery, setMastery] = useState<Mastery | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim())

  const themes = useThemeOptions()

  const page = usePagedRemote<SentenceRecord>(
    ({ page, pageSize }) =>
      sylo.query<SentenceRecord>("sentences", {
        filter:
          sf.and(
            likeAny(debouncedQuery, ["text", "translation"]),
            theme != null && sf.eq("theme_id", theme),
          ) || undefined,
        page,
        limit: pageSize,
        orderby: ["id.ASC"],
        with: SENTENCE_RELATIONS,
        extra: { ...WITH_KNOWLEDGE, ...knowledgeFilter(mastery) },
      }),
    { pageSize: PAGE_SIZE, deps: [debouncedQuery, theme, mastery] },
  )

  const sentences = useMemo(() => page.data.map(toSentence), [page.data])

  return {
    sentences,
    loading: page.loading,
    error: page.error,
    reload: page.reload,
    pagination: page.pagination,
    query,
    setQuery,
    theme,
    setTheme,
    mastery,
    setMastery,
    themes,
  }
}
