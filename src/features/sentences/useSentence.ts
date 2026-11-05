import { SyloApiError, sf, sylo } from "@/lib/sylo"
import { useRemote, type Remote } from "@/lib/useRemote"
import {
  SENTENCE_RELATIONS,
  TOKEN_RELATIONS,
  WITH_KNOWLEDGE,
  toSentence,
  toToken,
  type SentenceEntry,
  type SentenceRecord,
  type SentenceToken,
  type TokenRecord,
} from "@/features/sentences/sentenceModel"

export interface SentenceDetail {
  sentence: SentenceEntry
  /** Éléments de la phrase dans l'ordre (vide si l'analyse n'est pas renseignée). */
  tokens: SentenceToken[]
}

export type UseSentence = Omit<Remote<SentenceDetail | null>, "data"> & {
  /** Phrase chargée avec son analyse, ou `null` tant qu'elle ne l'est pas. */
  detail: SentenceDetail | null
}

/**
 * Détail d'une phrase via Sylo : `GET /sentences/<id>` et ses éléments
 * (`QUERY /sentence_tokens`). Indépendant de la liste : la phrase peut être
 * ouverte depuis n'importe quelle interface. Ne touche pas à l'affichage.
 */
export function useSentence(id: number): UseSentence {
  const { data, ...remote } = useRemote<SentenceDetail | null>(
    async () => {
      const [record, tokens] = await Promise.all([
        sylo
          .get<SentenceRecord>("sentences", id, {
            with: SENTENCE_RELATIONS,
            extra: WITH_KNOWLEDGE,
          })
          .catch((err) => {
            if (err instanceof SyloApiError && err.status === 404) {
              throw new SyloApiError(
                "Cette phrase n'existe pas ou a été supprimée.",
                { code: err.code, status: 404 },
              )
            }
            throw err
          }),
        loadTokens(id),
      ])
      return { sentence: toSentence(record), tokens }
    },
    null,
    [id],
  )
  return { ...remote, detail: data }
}

/**
 * Éléments de la phrase, dans l'ordre (ordre de création côté API). Échec non
 * bloquant : la phrase s'affiche sans son analyse.
 */
async function loadTokens(sentenceId: number): Promise<SentenceToken[]> {
  try {
    // Une phrase compte quelques dizaines d'éléments au plus : une page suffit.
    const { data } = await sylo.query<TokenRecord>("sentence_tokens", {
      filter: sf.eq("sentence_id", sentenceId),
      orderby: "id.ASC",
      with: TOKEN_RELATIONS,
      limit: 200,
    })
    return data.filter((t) => t.deleted_at == null).map(toToken)
  } catch {
    return []
  }
}
