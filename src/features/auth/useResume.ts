import { useCallback, useState } from "react"
import { SyloApiError, sylo, syloErrorMessage } from "@/lib/sylo"

export type ResumeResult =
  | { status: "done"; themeId: number }
  | { status: "invalid_token" }
  | { status: "error" }

export interface UseResume {
  /** `true` pendant l'appel réseau. */
  pending: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /** Sort du mode vacances et active le thème annoncé dans l'e-mail. */
  resume: (token: string) => Promise<ResumeResult>
}

/**
 * Exécute la sortie du mode vacances : appel réseau, état de chargement et
 * normalisation des erreurs. Ne touche pas à l'affichage.
 */
export function useResume(): UseResume {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resume = useCallback(async (token: string): Promise<ResumeResult> => {
    setPending(true)
    setError(null)
    try {
      const { theme_id } = await sylo.resumeFromVacation({ token })
      return { status: "done", themeId: theme_id }
    } catch (err) {
      // `validation_error` : jeton trop long, donc lien altéré.
      if (
        err instanceof SyloApiError &&
        (err.code === "invalid_resume_token" ||
          err.code === "validation_error")
      ) {
        return { status: "invalid_token" }
      }
      setError(syloErrorMessage(err))
      return { status: "error" }
    } finally {
      setPending(false)
    }
  }, [])

  return { pending, error, resume }
}
