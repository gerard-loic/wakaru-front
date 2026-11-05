import { useMemo, useState } from "react"
import { knowledgeFilter, type Mastery } from "@/lib/mastery"
import { sf, sylo } from "@/lib/sylo"
import { likeAny, toKatakana } from "@/lib/syloValues"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { emptyPage, usePagedRemote } from "@/lib/usePagedRemote"
import type { Pagination } from "@/lib/usePagination"
import {
  KANJI_RELATIONS,
  WITH_KNOWLEDGE,
  themeKanjiIds,
  toKanji,
  type KanjiEntry,
  type KanjiRecord,
  type ThemeKanjiLinks,
} from "@/features/kanji/kanjiModel"
import { useThemeOptions, type ThemeOption } from "@/features/themes/useThemeOptions"

export interface UseKanjis {
  /** Kanji de la page courante. */
  kanjis: KanjiEntry[]
  /** `true` pendant un appel réseau (les kanji de la page précédente restent affichés). */
  loading: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  reload: () => void
  /** Pagination côté serveur (`total` = nombre de kanji correspondant à la recherche). */
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

/** Kanji par page. */
const PAGE_SIZE = 20

/**
 * Kanji paginés et filtrés côté API (`QUERY /kanjis`) : seule la page courante
 * est chargée. Porte l'état de la recherche ; ne touche pas à l'affichage.
 */
export function useKanjis(): UseKanjis {
  const [query, setQuery] = useState("")
  const [theme, setTheme] = useState<number | null>(null)
  const [mastery, setMastery] = useState<Mastery | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim())

  const themes = useThemeOptions()

  const page = usePagedRemote<KanjiRecord>(
    async ({ page, pageSize }) => {
      // Kanji liés aux thèmes par une relation : pas de `theme_id` à filtrer.
      const ids =
        theme == null
          ? null
          : themeKanjiIds(
              await sylo.get<ThemeKanjiLinks>("themes", theme, { with: ["kanjis"] }),
            )
      if (ids?.length === 0) return emptyPage<KanjiRecord>()
      return sylo.query<KanjiRecord>("kanjis", {
        filter: buildFilter(debouncedQuery, ids),
        page,
        limit: pageSize,
        orderby: ["id.ASC"],
        with: KANJI_RELATIONS,
        extra: { ...WITH_KNOWLEDGE, ...knowledgeFilter(mastery) },
      })
    },
    { pageSize: PAGE_SIZE, deps: [debouncedQuery, theme, mastery] },
  )

  const kanjis = useMemo(() => page.data.map(toKanji), [page.data])

  return {
    kanjis,
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

/**
 * Filtre Sylo : caractère, sens et lectures. `readings` et `translations` sont
 * stockés en JSON échappé ; les lectures on étant en katakana, une saisie en
 * hiragana (`さん`) est aussi cherchée en katakana (`サン`). Cumulé avec les
 * kanji du thème (`ids`).
 */
function buildFilter(query: string, ids: number[] | null): string | undefined {
  const katakana = toKatakana(query)
  return (
    sf.and(
      sf.or(
        likeAny(query, ["char", "translations"], ["translations", "readings"]),
        katakana !== query && likeAny(katakana, [], ["readings"]),
      ),
      ids != null && sf.in("id", ids),
    ) || undefined
  )
}
