import { themes } from "@/data"

export const themeTitle = (id: string) =>
  themes.find((t) => t.id === id)?.title ?? id
