import { useCallback, useEffect, useState, type DependencyList } from "react"
import { syloErrorMessage } from "@/lib/sylo"

export type RemoteStatus = "loading" | "ready" | "error"

export interface Remote<T> {
  /** État courant du chargement. */
  status: RemoteStatus
  /** `true` pendant l'appel réseau. */
  loading: boolean
  /** Message d'erreur prêt à afficher, ou `null`. */
  error: string | null
  /** Dernière donnée chargée avec succès, ou `initial`. */
  data: T
  /** Relance le chargement (bouton « Réessayer »). */
  reload: () => void
}

/**
 * Exécute `load` au montage et à chaque changement de `deps`, et expose l'état
 * de chargement. Une réponse arrivée après démontage ou relance est ignorée.
 */
export function useRemote<T>(
  load: () => Promise<T>,
  initial: T,
  deps: DependencyList,
): Remote<T> {
  const [status, setStatus] = useState<RemoteStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T>(initial)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    setError(null)

    load()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setStatus("ready")
      })
      .catch((err) => {
        if (cancelled) return
        setStatus("error")
        setError(syloErrorMessage(err))
      })

    return () => {
      cancelled = true
    }
    // `load` est recréée à chaque rendu : seules `deps` pilotent le rechargement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { status, loading: status === "loading", error, data, reload }
}
