import { sylo } from "@/lib/sylo"
import { useRemote, type Remote } from "@/lib/useRemote"
import {
  toTheme,
  type ThemeEntry,
  type ThemeRecord,
} from "@/features/themes/themeModel"

/** Du plus récent au plus ancien. */
const LATEST_FIRST = ["created_at.DESC", "id.DESC"]

/**
 * Tous les thèmes (leçons) avec leur programme, du plus récent au plus ancien.
 * Peu nombreux : pas de pagination côté vue.
 */
export function useThemes(): Remote<ThemeEntry[]> {
  return useRemote(
    async () =>
      (
        await sylo.listAll<ThemeRecord>("themes", {
          orderby: LATEST_FIRST,
          extra: { with_knowledge: true },
        })
      ).map(toTheme),
    [],
    [],
  )
}

/** Thème le plus récent avec son programme, ou `null` s'il n'y en a aucun. */
export function useLatestTheme(): Remote<ThemeEntry | null> {
  return useRemote(
    async () => {
      const { data } = await sylo.list<ThemeRecord>("themes", {
        limit: 1,
        orderby: LATEST_FIRST,
        extra: { with_knowledge: true },
      })
      return data[0] ? toTheme(data[0]) : null
    },
    null,
    [],
  )
}
