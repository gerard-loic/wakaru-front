import { useCallback, useState } from "react"
import { SyloApiError, sylo, syloErrorMessage } from "@/lib/sylo"

export interface UseForgotPassword {
  /** `true` pendant l'appel réseau. */
  pending: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /** Demande l'e-mail de réinitialisation. Renvoie `true` si la demande a abouti. */
  requestReset: (email: string, captchaToken: string) => Promise<boolean>
  /** Affiche une erreur détectée côté client (validation locale). */
  fail: (message: string) => void
}

/**
 * Exécute la demande de réinitialisation du mot de passe : appel réseau, état
 * de chargement et normalisation des erreurs. Ne touche pas à l'affichage.
 */
export function useForgotPassword(): UseForgotPassword {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestReset = useCallback(
    async (email: string, captchaToken: string) => {
      setPending(true)
      setError(null)
      try {
        await sylo.forgotPassword({
          email: email.trim(),
          captcha_token: captchaToken,
        })
        return true
      } catch (err) {
        setError(toMessage(err))
        return false
      } finally {
        setPending(false)
      }
    },
    [],
  )

  const fail = useCallback((message: string) => setError(message), [])

  return { pending, error, requestReset, fail }
}

const FIELD_LABELS: Record<string, string> = {
  email: "Adresse e-mail invalide.",
  captcha_token: "Captcha invalide ou expiré. Réessaie.",
}

function toMessage(err: unknown): string {
  if (
    err instanceof SyloApiError &&
    err.code === "validation_error" &&
    Array.isArray(err.details)
  ) {
    const messages = err.details
      .map((d: { loc?: unknown[] }) => FIELD_LABELS[String(d.loc?.at(-1))])
      .filter(Boolean)
    if (messages.length) return [...new Set(messages)].join(" ")
  }
  return syloErrorMessage(err)
}
