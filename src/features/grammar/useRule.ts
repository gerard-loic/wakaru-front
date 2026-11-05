import { markRead } from "@/lib/knowledge"
import { SyloApiError, sylo } from "@/lib/sylo"
import { useRemote, type Remote } from "@/lib/useRemote"
import {
  RULE_RELATIONS,
  WITH_KNOWLEDGE,
  toRule,
  type RuleEntry,
  type RuleRecord,
} from "@/features/grammar/ruleModel"

export type UseRule = Omit<Remote<RuleEntry | null>, "data"> & {
  /** Règle chargée, ou `null` tant qu'elle ne l'est pas. */
  rule: RuleEntry | null
}

/**
 * Détail d'une règle via Sylo (`GET /grammar_rules/<id>`). Indépendant de la
 * liste : la règle peut être ouverte depuis n'importe quelle interface. Ne
 * touche pas à l'affichage.
 *
 * Une règle n'a pas d'exercice : la charger pour l'afficher vaut lecture, elle
 * n'est plus « nouvelle ». `onRead` est appelé une fois ce marquage enregistré.
 */
export function useRule(id: number, onRead?: () => void): UseRule {
  const { data, ...remote } = useRemote<RuleEntry | null>(
    async () => {
      const record = await sylo
        .get<RuleRecord>("grammar_rules", id, {
          with: RULE_RELATIONS,
          extra: WITH_KNOWLEDGE,
        })
        .catch((err) => {
          if (err instanceof SyloApiError && err.status === 404) {
            throw new SyloApiError(
              "Cette règle n'existe pas ou a été supprimée.",
              { code: err.code, status: 404 },
            )
          }
          throw err
        })
      const knowledge = record.user_knowledge
      if (knowledge?.is_new) {
        // Échec non bloquant : la règle reste « nouvelle » jusqu'à la prochaine ouverture.
        markRead(knowledge.id).then(onRead, () => {})
      }
      return toRule(record)
    },
    null,
    [id],
  )
  return { ...remote, rule: data }
}
