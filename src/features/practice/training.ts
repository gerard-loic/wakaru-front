import { sylo } from "@/lib/sylo"
import type { TrainingElement } from "@/features/practice/useTrainingConfiguration"

/** Nombre de questions demandées à `POST /training`. */
export const TRAINING_LENGTH = 20

/** Texte affiché, avec sa lecture (kana) quand il contient des kanjis. */
export interface TrainingText {
  text: string
  /** Lecture à afficher en petit, ou `""`. */
  reading: string
}

export interface TrainingProposition extends TrainingText {
  /** Id de l'élément proposé : la bonne réponse porte l'id de l'item. */
  id: number
}

/** Une étape de question : retrouver `to` parmi les propositions. */
export interface TrainingQuestion {
  to: TrainingElement
  /** Consigne affichée au-dessus de l'élément, fournie par l'API. */
  instructions: string
  propositions: TrainingProposition[]
}

/** Élément travaillé : montré (`text`), puis une question par élément à retrouver. */
export interface TrainingItem extends TrainingText {
  /** Entité Sylo de l'élément (`words`, `kanjis`…), utile pour le sujet `mix`. */
  entity: string
  id: number
  questions: TrainingQuestion[]
  /** `user_knowledge.id` de l'utilisateur pour cet élément. */
  user_knowledge: number | null
}

export interface TrainingRequest {
  subject: string
  element_from: TrainingElement
  element_to: TrainingElement[]
  focus: string
}

const TRAINING_ELEMENTS: string[] = ["french", "char", "reading"]

/** Entraînement -> paramètre d'URL `?training=words:french:char,reading:theme`. */
export function trainingToParam(r: TrainingRequest): string {
  return [r.subject, r.element_from, r.element_to.join(","), r.focus].join(":")
}

/** Paramètre d'URL -> entraînement, ou `null` s'il est invalide. */
export function trainingFromParam(value: string | null): TrainingRequest | null {
  const [subject, from, to, focus, ...rest] = (value ?? "").split(":")
  const elements = to?.split(",") ?? []
  if (!subject || !focus || rest.length) return null
  if (![from, ...elements].every((e) => TRAINING_ELEMENTS.includes(e))) return null
  return {
    subject,
    element_from: from as TrainingElement,
    element_to: elements as TrainingElement[],
    focus,
  }
}

/** Questions d'un entraînement (`POST /training`). */
export async function fetchTraining(
  request: TrainingRequest,
): Promise<TrainingItem[]> {
  const { data } = await sylo.call<{ items: TrainingItem[] }>(
    "POST",
    "/training",
    { body: { ...request, number: TRAINING_LENGTH } },
  )
  return data?.items ?? []
}

/** Bonne réponse d'une étape : la proposition qui porte l'id de l'item. */
export function isCorrect(
  item: TrainingItem,
  proposition: TrainingProposition,
): boolean {
  return proposition.id === item.id
}

/**
 * Enregistre une réussite (`user_knowledges/<id>/answer`) pour chaque élément
 * réussi, une seule fois par élément même s'il est sorti plusieurs fois.
 * L'utilisateur ne peut pas créer de ligne `user_knowledge`
 * (`POST /user_knowledges` interdit) : un élément sans `user_knowledge` est
 * ignoré. Renvoie le nombre d'éléments ignorés.
 */
export async function recordTrainingSuccesses(
  items: TrainingItem[],
): Promise<{ skipped: number }> {
  const ids = new Set<number>()
  const untracked = new Set<string>()
  for (const i of items) {
    if (i.user_knowledge != null) ids.add(i.user_knowledge)
    else untracked.add(`${i.entity}:${i.id}`)
  }
  await Promise.all(
    [...ids].map((id) =>
      sylo.call("POST", `/user_knowledges/${id}/answer`, {
        body: { success: true },
      }),
    ),
  )
  return { skipped: untracked.size }
}
