import type { QType } from "@/lib/quiz"
import { sylo } from "@/lib/sylo"
import { useRemote, type Remote } from "@/lib/useRemote"

/** Élément d'un item travaillé : traduction, graphie ou lecture. */
export type TrainingElement = "french" | "char" | "reading"

/** Sens d'entraînement : ce qui est montré -> ce qu'il faut retrouver (dans l'ordre). */
export interface TrainingMode {
  name: string
  element_from: TrainingElement
  element_to: TrainingElement[]
}

/** Contenu sur lequel porte l'entraînement. */
export interface TrainingFocus {
  name: string
  /** `theme`, `weakness`, `random`… */
  focus: string
}

/** Sujet d'entraînement, avec les sens et focus qu'il autorise. */
export interface TrainingSubject {
  name: string
  /** `words`, `kanjis`, `hiraganas`, `katakanas`, `sentences`, `mix`… */
  subject: string
  modes: TrainingMode[]
  focus: TrainingFocus[]
}

/** Sujet API présélectionné depuis les boutons « M'exercer » des pages. */
export const SUBJECT_BY_QTYPE: Partial<Record<QType, string>> = {
  vocab: "words",
  kanji: "kanjis",
  hiragana: "hiraganas",
  katakana: "katakanas",
  sentences: "sentences",
}

/** Réponse de `GET /training/configuration`. */
export interface TrainingConfiguration {
  subjects: TrainingSubject[]
}

export type UseTrainingConfiguration = Omit<
  Remote<TrainingConfiguration>,
  "data"
> & {
  subjects: TrainingSubject[]
}

/** Combinaisons sujet / sens / focus proposées (`GET /training/configuration`). */
export function useTrainingConfiguration(): UseTrainingConfiguration {
  const { data, ...remote } = useRemote<TrainingConfiguration>(
    async () =>
      (await sylo.call<TrainingConfiguration>("GET", "/training/configuration"))
        .data ?? { subjects: [] },
    { subjects: [] },
    [],
  )
  return { ...remote, subjects: data.subjects ?? [] }
}
