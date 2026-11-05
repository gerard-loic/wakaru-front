import { useCallback, useState } from "react"
import { SyloApiError, sylo, syloErrorMessage } from "@/lib/sylo"

export type UnsubscribeResult = "done" | "invalid_token" | "error"

export interface UseUnsubscribe {
  /** `true` pendant l'appel réseau. */
  pending: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /** Coupe les e-mails d'information à partir du jeton reçu par e-mail. */
  unsubscribe: (token: string) => Promise<UnsubscribeResult>
}

/**
 * Exécute la désinscription : appel réseau, état de chargement et normalisation
 * des erreurs. Ne touche pas à l'affichage.
 */
export function useUnsubscribe(): UseUnsubscribe {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unsubscribe = useCallback(async (token: string) => {
    setPending(true)
    setError(null)
    try {
      await sylo.unsubscribe({ token })
      return "done"
    } catch (err) {
      // `validation_error` : jeton trop long, donc lien altéré.
      if (
        err instanceof SyloApiError &&
        (err.code === "invalid_unsubscribe_token" ||
          err.code === "validation_error")
      ) {
        return "invalid_token"
      }
      setError(syloErrorMessage(err))
      return "error"
    } finally {
      setPending(false)
    }
  }, [])

  return { pending, error, unsubscribe }
}
