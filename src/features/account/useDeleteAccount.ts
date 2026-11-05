import { useCallback, useState } from "react"
import { sylo, syloErrorMessage } from "@/lib/sylo"

export interface UseDeleteAccount {
  /** `true` pendant l'appel réseau. */
  pending: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /** `DELETE /users/me`. Renvoie `true` si la suppression a réussi. */
  remove: () => Promise<boolean>
}

/**
 * Supprime le compte de l'utilisateur connecté : appel réseau, état de
 * chargement et normalisation des erreurs. Ne touche ni à l'affichage ni à la
 * session, que l'appelant ferme une fois la suppression confirmée.
 */
export function useDeleteAccount(): UseDeleteAccount {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = useCallback(async () => {
    setPending(true)
    setError(null)
    try {
      await sylo.remove("users", "me")
      return true
    } catch (err) {
      setError(syloErrorMessage(err))
      return false
    } finally {
      setPending(false)
    }
  }, [])

  return { pending, error, remove }
}
