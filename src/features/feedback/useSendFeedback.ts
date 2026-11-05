import { useCallback, useState } from "react"
import { sylo, syloErrorMessage } from "@/lib/sylo"

export type FeedbackType = "bug" | "remark" | "comment"

export interface UseSendFeedback {
  /** `true` pendant l'appel réseau. */
  pending: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /** `POST /feedback`. Renvoie `true` si l'envoi a réussi. */
  send: (type: FeedbackType, message: string) => Promise<boolean>
}

/** Envoie un retour utilisateur : appel réseau, état de chargement et erreurs. */
export function useSendFeedback(): UseSendFeedback {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(async (type: FeedbackType, message: string) => {
    setPending(true)
    setError(null)
    try {
      await sylo.create("feedback", { type, message })
      return true
    } catch (err) {
      setError(syloErrorMessage(err))
      return false
    } finally {
      setPending(false)
    }
  }, [])

  return { pending, error, send }
}
