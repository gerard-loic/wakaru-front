import { createKnowledge, markRead } from "@/lib/knowledge"
import { SyloApiError, sf, sylo } from "@/lib/sylo"
import { useRemote, type Remote } from "@/lib/useRemote"
import {
  COMPOSITION_RELATIONS,
  WITH_KNOWLEDGE,
  WORD_ENTITY,
  WORD_RELATIONS,
  loadThemeNames,
  toSegment,
  toWord,
  type CompositionRecord,
  type ConjugationForm,
  type VocabWord,
  type WordRecord,
  type WordSegment,
} from "@/features/vocab/wordModel"

export interface WordDetail {
  word: VocabWord
  /** Décomposition du mot, dans l'ordre d'écriture (vide si non renseignée). */
  composition: WordSegment[]
  /** Tableau de conjugaison (vide hors verbes). */
  conjugation: ConjugationForm[]
}

export type UseWord = Omit<Remote<WordDetail | null>, "data"> & {
  /** Mot chargé avec sa composition, ou `null` tant qu'il ne l'est pas. */
  detail: WordDetail | null
}

/**
 * Détail d'un mot via Sylo : `GET /words/<id>` (nature, niveau, thèmes,
 * maîtrise, conjugaison) et sa composition (`QUERY /compositions`). Indépendant de la
 * liste : le mot peut être ouvert depuis n'importe quelle interface. Ne touche
 * pas à l'affichage.
 *
 * Un mot d'une nature non travaillée (`partofspeech.is_worked_on` faux) ne passe
 * jamais par les exercices : le charger pour l'afficher vaut lecture, il n'est
 * plus « nouveau ». `onRead` est appelé une fois ce marquage enregistré.
 */
export function useWord(id: number, onRead?: () => void): UseWord {
  const { data, ...remote } = useRemote<WordDetail | null>(
    async () => {
      const [record, themeNames, composition] = await Promise.all([
        sylo
          .get<WordRecord>("words", id, {
            with: WORD_RELATIONS,
            extra: WITH_KNOWLEDGE,
          })
          .catch((err) => {
            if (err instanceof SyloApiError && err.status === 404) {
              throw new SyloApiError(
                "Ce mot n'existe pas ou a été supprimé.",
                { code: err.code, status: 404 },
              )
            }
            throw err
          }),
        loadThemeNames(),
        loadComposition(id),
      ])
      const word = toWord(record, themeNames)
      if (!word.partOfSpeech?.isWorkedOn && word.isNew) {
        markWordRead(record, onRead)
      }
      return {
        word,
        composition,
        conjugation: record.conjugation ?? [],
      }
    },
    null,
    [id],
  )
  return { ...remote, detail: data }
}

/** Mots en cours de marquage : le double chargement de StrictMode ne doit pas créer deux lignes. */
const marking = new Set<number>()

/** Échec non bloquant : le mot reste « nouveau » jusqu'à la prochaine ouverture. */
function markWordRead(record: WordRecord, onRead?: () => void) {
  if (marking.has(record.id)) return
  marking.add(record.id)
  const knowledgeId = record.user_knowledge?.id
  Promise.resolve(knowledgeId ?? createKnowledge(WORD_ENTITY, record.id))
    .then(markRead)
    .then(onRead, (err) => console.error("Marquage du mot comme lu impossible", err))
    .finally(() => marking.delete(record.id))
}

/**
 * Segments du mot, dans l'ordre d'écriture (ordre de création côté API).
 * Échec non bloquant : le détail s'affiche sans la composition.
 */
async function loadComposition(wordId: number): Promise<WordSegment[]> {
  try {
    // Un mot compte quelques segments : une page suffit.
    const { data } = await sylo.query<CompositionRecord>("compositions", {
      filter: sf.eq("word_id", wordId),
      orderby: "id.ASC",
      with: COMPOSITION_RELATIONS,
      limit: 200,
    })
    return data.filter((c) => c.deleted_at == null).map(toSegment)
  } catch {
    return []
  }
}
