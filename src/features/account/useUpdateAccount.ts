import { useCallback, useState } from "react"
import { SyloApiError, sylo, syloErrorMessage } from "@/lib/sylo"

export interface UseUpdateAccount {
  /** `true` pendant l'appel réseau. */
  pending: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /** `PUT /users/me` (mise à jour partielle). Renvoie `true` si elle a réussi. */
  update: (payload: Record<string, unknown>) => Promise<boolean>
  /** Affiche une erreur détectée côté client (validation locale). */
  fail: (message: string) => void
}

/**
 * Exécute la mise à jour du compte de l'utilisateur connecté : appel réseau,
 * état de chargement et normalisation des erreurs. Ne touche pas à l'affichage.
 */
export function useUpdateAccount(): UseUpdateAccount {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(async (payload: Record<string, unknown>) => {
    setPending(true)
    setError(null)
    try {
      await sylo.update("users", "me", payload)
      return true
    } catch (err) {
      setError(toMessage(err))
      return false
    } finally {
      setPending(false)
    }
  }, [])

  const fail = useCallback((message: string) => setError(message), [])

  return { pending, error, update, fail }
}

const FIELD_LABELS: Record<string, string> = {
  email: "Adresse e-mail invalide.",
  first_name: "Prénom invalide.",
  last_name: "Nom invalide.",
  password: "Mot de passe invalide.",
  current_password: "Mot de passe actuel invalide.",
}

function toMessage(err: unknown): string {
  if (err instanceof SyloApiError) {
    if (err.status === 409) {
      return "Un compte existe déjà avec cette adresse e-mail."
    }
    if (err.code === "validation_error" && Array.isArray(err.details)) {
      const messages = err.details
        .map((d: { loc?: unknown[] }) => FIELD_LABELS[String(d.loc?.at(-1))])
        .filter(Boolean)
      if (messages.length) return [...new Set(messages)].join(" ")
    }
  }
  return syloErrorMessage(err)
}
