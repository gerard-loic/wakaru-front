import { useMemo, useState } from "react"
import { knowledgeFilter, type Mastery } from "@/lib/mastery"
import { sf, sylo } from "@/lib/sylo"
import { likeAny } from "@/lib/syloValues"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { emptyPage, usePagedRemote } from "@/lib/usePagedRemote"
import type { Pagination } from "@/lib/usePagination"
import { useRemote } from "@/lib/useRemote"
import {
  WITH_KNOWLEDGE,
  WORD_RELATIONS,
  loadThemeNames,
  loadThemeWordIds,
  toPartOfSpeech,
  toWord,
  type PartOfSpeech,
  type PartOfSpeechRecord,
  type VocabWord,
  type WordRecord,
} from "@/features/vocab/wordModel"
import { useThemeOptions, type ThemeOption } from "@/features/themes/useThemeOptions"

export type { PartOfSpeech, VocabWord } from "@/features/vocab/wordModel"

export interface UseWords {
  /** Mots de la page courante. */
  words: VocabWord[]
  /** `true` pendant un appel réseau (les mots de la page précédente restent affichés). */
  loading: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  reload: () => void
  /** Pagination côté serveur (`total` = nombre de mots correspondant aux critères). */
  pagination: Pagination
  /** Texte recherché, tel que saisi (la requête part après une pause de frappe). */
  query: string
  setQuery: (query: string) => void
  /** Nature sélectionnée (`partofspeech.id`), ou `null` pour toutes. */
  pos: number | null
  setPos: (pos: number | null) => void
  /** Thème sélectionné (`theme.id`), ou `null` pour tous. */
  theme: number | null
  setTheme: (theme: number | null) => void
  /** Niveau de maîtrise sélectionné, ou `null` pour tous. */
  mastery: Mastery | null
  setMastery: (mastery: Mastery | null) => void
  /** Natures proposées en filtre. */
  partsOfSpeech: PartOfSpeech[]
  /** Thèmes proposés en filtre. */
  themes: ThemeOption[]
}

/** Mots par page. */
const PAGE_SIZE = 20

/**
 * Vocabulaire paginé et filtré côté API (`QUERY /words`) : seule la page
 * courante est chargée. Porte l'état des critères ; ne touche pas à l'affichage.
 */
export function useWords(): UseWords {
  const [query, setQuery] = useState("")
  const [pos, setPos] = useState<number | null>(null)
  const [theme, setTheme] = useState<number | null>(null)
  const [mastery, setMastery] = useState<Mastery | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim())

  const lookups = useRemote(
    async () => {
      // Données annexes : leur échec ne bloque pas la liste.
      const [themeNames, partsOfSpeech] = await Promise.all([
        loadThemeNames(),
        sylo
          .listAll<PartOfSpeechRecord>("partofspeeches", { orderby: "id.ASC" })
          .catch(() => []),
      ])
      return { themeNames, partsOfSpeech: partsOfSpeech.map(toPartOfSpeech) }
    },
    { themeNames: new Map<number, string>(), partsOfSpeech: [] },
    [],
  )

  const themes = useThemeOptions()

  const page = usePagedRemote<WordRecord>(
    async ({ page, pageSize }) => {
      // Mots liés aux thèmes par `theme_words` : pas de `theme_id` à filtrer.
      const ids = theme == null ? null : await loadThemeWordIds(theme)
      if (ids?.length === 0) return emptyPage<WordRecord>()
      return sylo.query<WordRecord>("words", {
        filter: buildFilter(debouncedQuery, pos, ids),
        page,
        limit: pageSize,
        orderby: ["reading.ASC", "id.ASC"],
        with: WORD_RELATIONS,
        extra: { ...WITH_KNOWLEDGE, ...knowledgeFilter(mastery) },
      })
    },
    { pageSize: PAGE_SIZE, deps: [debouncedQuery, pos, theme, mastery] },
  )

  const { themeNames } = lookups.data
  const words = useMemo(
    () => page.data.map((r) => toWord(r, themeNames)),
    [page.data, themeNames],
  )

  return {
    words,
    loading: page.loading,
    error: page.error,
    reload: page.reload,
    pagination: page.pagination,
    query,
    setQuery,
    pos,
    setPos,
    theme,
    setTheme,
    mastery,
    setMastery,
    partsOfSpeech: lookups.data.partsOfSpeech,
    themes,
  }
}

/**
 * Filtre Sylo : texte cherché dans la graphie, la lecture et les traductions,
 * cumulé avec la nature et les mots du thème. `undefined` quand il n'y a aucun
 * critère.
 */
function buildFilter(
  query: string,
  pos: number | null,
  ids: number[] | null,
): string | undefined {
  return (
    sf.and(
      // `translations` est stocké en JSON échappé (`"\u00e9rable"`).
      likeAny(query, ["writing", "reading", "translations"], ["translations"]),
      pos != null && sf.eq("partofspeech_id", pos),
      ids != null && sf.in("id", ids),
    ) || undefined
  )
}
