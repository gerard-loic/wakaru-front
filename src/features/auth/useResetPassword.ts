import { useCallback, useState } from "react"
import { SyloApiError, sylo, syloErrorMessage } from "@/lib/sylo"

export type ResetPasswordResult = "done" | "invalid_token" | "error"

export interface UseResetPassword {
  /** `true` pendant l'appel réseau. */
  pending: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /** Définit le nouveau mot de passe à partir du jeton reçu par e-mail. */
  resetPassword: (
    token: string,
    password: string,
  ) => Promise<ResetPasswordResult>
  /** Affiche une erreur détectée côté client (validation locale). */
  fail: (message: string) => void
}

/**
 * Exécute la redéfinition du mot de passe : appel réseau, état de chargement
 * et normalisation des erreurs. Ne touche pas à l'affichage.
 */
export function useResetPassword(): UseResetPassword {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetPassword = useCallback(async (token: string, password: string) => {
    setPending(true)
    setError(null)
    try {
      await sylo.resetPassword({ token, password })
      return "done"
    } catch (err) {
      if (err instanceof SyloApiError && err.code === "invalid_reset_token") {
        return "invalid_token"
      }
      setError(toMessage(err))
      return "error"
    } finally {
      setPending(false)
    }
  }, [])

  const fail = useCallback((message: string) => setError(message), [])

  return { pending, error, resetPassword, fail }
}

function toMessage(err: unknown): string {
  if (
    err instanceof SyloApiError &&
    err.code === "validation_error" &&
    Array.isArray(err.details) &&
    err.details.some((d: { loc?: unknown[] }) => d.loc?.at(-1) === "password")
  ) {
    return "Le mot de passe doit contenir au moins 8 caractères."
  }
  return syloErrorMessage(err)
}
