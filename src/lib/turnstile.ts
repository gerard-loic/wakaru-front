/**
 * Chargement du widget Cloudflare Turnstile (captcha de l'inscription).
 *
 * Le script est injecté à la demande, une seule fois, en mode `explicit` : le
 * composant `<Turnstile>` appelle ensuite `turnstile.render()` lui-même plutôt
 * que de laisser le script scanner le DOM.
 */

/** Clé de test Cloudflare : affiche un widget qui passe toujours. */
const TEST_SITE_KEY = "1x00000000000000000000AA"

/**
 * Clé publique (site key) du widget. `VITE_TURNSTILE_SITE_KEY` prime ; à
 * défaut, la clé de test en dev. En prod, `.env*` n'entre pas dans l'image
 * Docker (voir `.dockerignore`) : renseigner la vraie clé ici.
 */
const PROD_SITE_KEY = ""

export const turnstileSiteKey: string =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ??
  (import.meta.env.DEV ? TEST_SITE_KEY : PROD_SITE_KEY)

const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

export interface TurnstileRenderOptions {
  sitekey: string
  theme?: "light" | "dark" | "auto"
  language?: string
  size?: "normal" | "compact"
  callback?: (token: string) => void
  "expired-callback"?: () => void
  "error-callback"?: () => void
}

export interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let loading: Promise<TurnstileApi> | null = null

/** Charge le script Turnstile (une seule fois) et renvoie son API. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (loading) return loading

  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error("Turnstile indisponible."))
    script.onerror = () => reject(new Error("Chargement du captcha impossible."))
    document.head.appendChild(script)
  }).catch((err) => {
    // Permet un nouvel essai au prochain montage.
    loading = null
    throw err
  })
  return loading
}
