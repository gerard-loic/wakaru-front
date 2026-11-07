/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * URL racine de l'API Sylo, sans slash final. Ex: `https://api.exemple.fr`.
   * Absent -> repli sur l'API de prod (voir `src/lib/sylo.ts`).
   */
  readonly VITE_SYLO_BASE_URL?: string
  /** Préfixe de la route de login. Défaut : `/users`. */
  readonly VITE_SYLO_AUTH_PREFIX?: string
  /** Conservation du token : `session` (défaut) | `local` | `memory`. */
  readonly VITE_SYLO_STORAGE?: "session" | "local" | "memory"
  /** Clé de stockage du token. Défaut : `sylo.auth`. */
  readonly VITE_SYLO_STORAGE_KEY?: string
  /** Transport des listes filtrées : `post` (défaut) | `query`. */
  readonly VITE_SYLO_QUERY_TRANSPORT?: "post" | "query"
  /**
   * Clé publique (site key) Cloudflare Turnstile pour le captcha d'inscription.
   * Absent -> clé de test en dev (voir `src/lib/turnstile.ts`).
   */
  readonly VITE_TURNSTILE_SITE_KEY?: string
  /**
   * Jour de la semaine correspondant au jour 1 du programme d'un thème :
   * `1` (lundi) à `7` (dimanche), `2` (mardi) par défaut.
   */
  readonly VITE_PROGRAM_FIRST_DAY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
