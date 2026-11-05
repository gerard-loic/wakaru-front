import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react"
import { loadTurnstile, turnstileSiteKey } from "@/lib/turnstile"

export interface TurnstileHandle {
  /** Relance le widget : un jeton n'est valable qu'une fois (et 5 minutes). */
  reset: () => void
}

/**
 * Widget captcha Cloudflare Turnstile. Remonte le jeton via `onToken`
 * (`null` quand il expire ou en cas d'erreur). Le parent appelle
 * `ref.current.reset()` après chaque envoi échoué.
 */
export function Turnstile({
  onToken,
  ref,
}: {
  onToken: (token: string | null) => void
  ref?: Ref<TurnstileHandle>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const [error, setError] = useState<string | null>(
    turnstileSiteKey ? null : "Captcha non configuré (clé publique absente).",
  )

  // Callback toujours à jour sans re-rendre le widget.
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current(null)
      if (widgetId.current) window.turnstile?.reset(widgetId.current)
    },
  }))

  useEffect(() => {
    if (!turnstileSiteKey) return
    let cancelled = false

    loadTurnstile()
      .then((api) => {
        if (cancelled || !containerRef.current) return
        widgetId.current = api.render(containerRef.current, {
          sitekey: turnstileSiteKey,
          theme: "dark",
          language: "fr",
          // Le widget standard fait 300 px : il déborderait sur petit écran.
          size: containerRef.current.clientWidth < 300 ? "compact" : "normal",
          callback: (token) => {
            setError(null)
            onTokenRef.current(token)
          },
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => {
            onTokenRef.current(null)
            setError("Le captcha a échoué. Recharge la page pour réessayer.")
          },
        })
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
      if (widgetId.current) window.turnstile?.remove(widgetId.current)
      widgetId.current = null
    }
  }, [])

  return (
    <div>
      <div ref={containerRef} className="min-h-[65px]" />
      {error && <p className="mono text-xs text-ember mt-2">{error}</p>}
    </div>
  )
}
