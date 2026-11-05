import { sylo } from "@/lib/sylo"
import { useRemote } from "@/lib/useRemote"

export interface ThemeOption {
  id: number
  name: string
}

/** Thèmes proposés en filtre. Échec non bloquant : la liste reste utilisable sans. */
export function useThemeOptions(): ThemeOption[] {
  const { data } = useRemote(
    async () =>
      (
        await sylo
          .listAll<{ id: number; name: string | null }>("themes", { orderby: "id.ASC" })
          .catch(() => [])
      )
        .filter((t) => t.name)
        .map((t) => ({ id: t.id, name: t.name! })),
    [],
    [],
  )
  return data
}
