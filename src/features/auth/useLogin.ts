import { useCallback, useState } from "react"
import { SyloApiError, sylo } from "@/lib/sylo"

export type LoginStatus = "idle" | "pending" | "error"

export interface UseLogin {
  /** État courant de la tentative de connexion. */
  status: LoginStatus
  /** `true` pendant l'appel réseau. */
  pending: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /**
   * Authentifie via `sylo.login`. Le token est persisté par le connecteur.
   * Renvoie `true` en cas de succès, `false` si l'authentification a échoué.
   */
  login: (email: string, password: string) => Promise<boolean>
  /** Réinitialise l'état (utile en changeant de formulaire). */
  reset: () => void
}

/**
 * Encapsule l'exécution de l'authentification Sylo : appel réseau, état de
 * chargement et normalisation des erreurs. Ne touche pas à l'affichage.
 */
export function useLogin(): UseLogin {
  const [status, setStatus] = useState<LoginStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    setStatus("pending")
    setError(null)
    try {
      await sylo.login(email.trim(), password)
      setStatus("idle")
      return true
    } catch (err) {
      setStatus("error")
      setError(toMessage(err))
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setStatus("idle")
    setError(null)
  }, [])

  return { status, pending: status === "pending", error, login, reset }
}

function toMessage(err: unknown): string {
  if (err instanceof SyloApiError) {
    if (err.code === "network_error") {
      return "Impossible de joindre le serveur. Vérifie ta connexion."
    }
    if (err.status === 401) {
      return "E-mail ou mot de passe incorrect."
    }
    return err.message
  }
  return "Une erreur inattendue est survenue."
}
