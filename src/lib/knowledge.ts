import type { ProgramTaskRef } from "@/features/themes/themeProgram"
import { sylo } from "@/lib/sylo"

/**
 * Enregistre une réussite ou un échec de l'utilisateur connecté sur un
 * élément (`POST /user_knowledges/<id>/answer`). Crée d'abord sa ligne
 * `user_knowledge` s'il n'en a pas encore pour cet élément. Renvoie l'id de
 * cette ligne, à réutiliser pour les réponses suivantes.
 */
export async function recordAnswer({
  knowledgeId,
  entityName,
  entityId,
  success,
}: {
  /** `user_knowledge.id` existant, ou `null` pour un élément jamais travaillé. */
  knowledgeId: number | null
  /** Nom de l'entité Sylo (`"exercises"`…). */
  entityName: string
  entityId: number
  success: boolean
}): Promise<number> {
  const id = knowledgeId ?? (await createKnowledge(entityName, entityId))
  await sylo.call("POST", `/user_knowledges/${id}/answer`, { body: { success } })
  return id
}

/** Crée la ligne `user_knowledge` de l'utilisateur connecté pour un élément. Renvoie son id. */
export async function createKnowledge(
  entityName: string,
  entityId: number,
): Promise<number> {
  const userId = sylo.userId
  if (userId == null) {
    throw new Error("Utilisateur inconnu : reconnecte-toi pour enregistrer ta progression.")
  }
  const created = await sylo.create<{ id: number }>("user_knowledges", {
    user_id: userId,
    entity_name: entityName,
    entity_id: entityId,
  })
  return created.id
}

/** Marque un élément comme lu (`POST /user_knowledges/<id>/read`) : il n'est plus « nouveau ». */
export async function markRead(knowledgeId: number): Promise<void> {
  await sylo.call("POST", `/user_knowledges/${knowledgeId}/read`)
}

/** Éléments en cours de marquage : le double chargement de StrictMode ne doit pas créer deux lignes. */
const marking = new Set<string>()

/**
 * Première consultation d'un élément encore « nouveau » : le marque comme lu
 * et lui compte un premier succès, ce qui le passe « en cours ». Crée sa ligne
 * `user_knowledge` s'il n'en a pas. Échec non bloquant : l'élément reste
 * « nouveau » jusqu'à la prochaine ouverture. `onRead` est appelé une fois le
 * marquage enregistré.
 */
export function markFirstView({
  entityName,
  entityId,
  knowledge,
  onRead,
}: {
  /** Nom de l'entité Sylo (`"kanji"`…). */
  entityName: string
  entityId: number
  /** `user_knowledge` de l'élément, ou `null` s'il n'a jamais été travaillé. */
  knowledge: { id: number; is_new?: boolean } | null | undefined
  onRead?: () => void
}): void {
  const key = `${entityName}:${entityId}`
  if (marking.has(key)) return
  marking.add(key)
  Promise.resolve(knowledge?.id ?? createKnowledge(entityName, entityId))
    .then(async (id) => {
      if (knowledge?.is_new !== false) await markRead(id)
      await recordAnswer({ knowledgeId: id, entityName, entityId, success: true })
    })
    .then(onRead, (err) => console.error(`Marquage de ${key} comme lu impossible`, err))
    .finally(() => marking.delete(key))
}

/**
 * Passe directement un élément en « Maîtrisé » (`POST /user_knowledges/<id>/master`) :
 * le backend relève `corrects` juste assez pour atteindre la maîtrise.
 */
export async function markMastered(knowledgeId: number): Promise<void> {
  await sylo.call("POST", `/user_knowledges/${knowledgeId}/master`)
}

/** Marque une tâche du programme comme faite (`POST /user_knowledges/<id>/done`). */
export async function markTaskDone(ref: ProgramTaskRef): Promise<void> {
  await sylo.call("POST", `/user_knowledges/${ref.knowledgeId}/done`, {
    body: { day: ref.day, index: ref.index },
  })
}
