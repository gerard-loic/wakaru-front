import { useCallback, useState } from "react"
import { SyloApiError, sylo } from "@/lib/sylo"

export interface RegisterValues {
  email: string
  firstName: string
  lastName: string
  password: string
  captchaToken: string
}

export interface UseRegister {
  /** `true` pendant l'appel réseau (inscription puis connexion). */
  pending: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /**
   * Crée le compte via `sylo.register`, puis connecte l'utilisateur.
   * Renvoie `true` si l'utilisateur est inscrit et connecté.
   */
  register: (values: RegisterValues) => Promise<boolean>
  /** Affiche une erreur détectée côté client (validation locale). */
  fail: (message: string) => void
}

/**
 * Encapsule l'exécution de l'inscription Sylo : appel réseau, état de
 * chargement et normalisation des erreurs. Ne touche pas à l'affichage.
 */
export function useRegister(): UseRegister {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = useCallback(async (values: RegisterValues) => {
    setPending(true)
    setError(null)
    const email = values.email.trim()
    try {
      await sylo.register({
        email,
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        password: values.password,
        captcha_token: values.captchaToken,
      })
    } catch (err) {
      setError(toMessage(err))
      setPending(false)
      return false
    }

    try {
      await sylo.login(email, values.password)
      return true
    } catch {
      setError("Compte créé, mais la connexion a échoué. Connecte-toi.")
      return false
    } finally {
      setPending(false)
    }
  }, [])

  const fail = useCallback((message: string) => setError(message), [])

  return { pending, error, register, fail }
}

const FIELD_LABELS: Record<string, string> = {
  email: "Adresse e-mail invalide.",
  first_name: "Prénom invalide.",
  last_name: "Nom invalide.",
  password: "Le mot de passe doit contenir au moins 8 caractères.",
  captcha_token: "Captcha invalide ou expiré. Réessaie.",
}

function toMessage(err: unknown): string {
  if (err instanceof SyloApiError) {
    if (err.code === "network_error") {
      return "Impossible de joindre le serveur. Vérifie ta connexion."
    }
    if (err.status === 409) {
      return "Un compte existe déjà avec cette adresse e-mail."
    }
    if (err.code === "validation_error" && Array.isArray(err.details)) {
      const messages = err.details
        .map((d: { loc?: unknown[] }) => FIELD_LABELS[String(d.loc?.at(-1))])
        .filter(Boolean)
      if (messages.length) return [...new Set(messages)].join(" ")
    }
    return err.message
  }
  return "Une erreur inattendue est survenue."
}
