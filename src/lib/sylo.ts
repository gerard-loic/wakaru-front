/**
 * Point d'entrée applicatif du connecteur Sylo.
 *
 * `SyloConnector` (voir `./SyloConnector.ts`) est volontairement agnostique du
 * framework : ce module lit la configuration dans les variables d'environnement
 * Vite (`.env`, préfixe `VITE_SYLO_`) et expose une instance partagée `sylo`
 * prête à l'emploi pour toute l'application.
 */

import {
  SyloApiError,
  SyloConnector,
  type SyloConnectorOptions,
} from "@/lib/SyloConnector"

/**
 * Repli utilisé quand `VITE_SYLO_BASE_URL` n'est pas défini (pas de `.env` :
 * `.env*` est ignoré par git, donc absent d'un checkout propre).
 * On cible l'API de prod plutôt que de casser tout le rendu.
 */
const DEFAULT_BASE_URL = "https://api.wakaru.fr"

function optionsFromEnv(): SyloConnectorOptions {
  const baseUrl = import.meta.env.VITE_SYLO_BASE_URL ?? DEFAULT_BASE_URL
  if (!import.meta.env.VITE_SYLO_BASE_URL) {
    console.warn(
      `[sylo] VITE_SYLO_BASE_URL absent : repli sur "${DEFAULT_BASE_URL}". ` +
        "Définis-le dans un .env (voir .env.example) pour cibler un autre backend.",
    )
  }

  return {
    baseUrl,
    authPrefix: import.meta.env.VITE_SYLO_AUTH_PREFIX,
    storage: import.meta.env.VITE_SYLO_STORAGE ?? "session",
    storageKey: import.meta.env.VITE_SYLO_STORAGE_KEY,
    queryTransport: import.meta.env.VITE_SYLO_QUERY_TRANSPORT,
  }
}

/**
 * Crée un connecteur Sylo à partir du `.env`. Les `overrides` priment sur les
 * valeurs d'environnement (utile pour les tests ou un second backend).
 */
export function createSyloConnector(
  overrides: Partial<SyloConnectorOptions> = {},
): SyloConnector {
  return new SyloConnector({ ...optionsFromEnv(), ...overrides })
}

/** Instance partagée, configurée depuis le `.env`. */
export const sylo = createSyloConnector()

/** Message d'erreur prêt à afficher pour un échec d'appel Sylo. */
export function syloErrorMessage(err: unknown): string {
  if (err instanceof SyloApiError) {
    if (err.code === "network_error") {
      return "Impossible de joindre le serveur. Vérifie ta connexion."
    }
    return err.message
  }
  return "Une erreur inattendue est survenue."
}

export {
  SyloConnector,
  SyloApiError,
  sf,
} from "@/lib/SyloConnector"
export type {
  SyloConnectorOptions,
  SyloTokenBundle,
  SyloListMeta,
  SyloListResult,
  SyloListParams,
  SyloQueryParams,
  SyloStorage,
} from "@/lib/SyloConnector"
