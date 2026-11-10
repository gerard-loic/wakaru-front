/** Une version publiée et ses nouveautés. */
export interface Release {
  version: string
  /** Date de mise en ligne (ISO, `AAAA-MM-JJ`). */
  date: string
  changes: string[]
}

/** Historique des versions, la plus récente en premier. */
export const RELEASES: Release[] = [
  {
    version: "1.1.0",
    date: "2026-11-10",
    changes: [
      "Mode vacances",
      "Apprentissage progressif des hiraganas et katakanas",
      "Correctifs dans les choix des items pour les exercices",
      "Correctifs dans la gestion de la progression",
      "Correctifs graphiques",
    ],
  },
]

export const CURRENT_RELEASE = RELEASES[0]
