/**
 * SyloConnector — client d'accès aux API générées par Sylo.
 * https://github.com/gerard-loic/sylo
 *
 * Spécificités Sylo prises en charge :
 *  - Auth par `POST /users/login` -> `{ token, expires_at }`, Bearer token sur toutes
 *    les autres routes. Sylo n'expose aucune route de logout : la déconnexion consiste
 *    donc uniquement à oublier le token côté client (table `user_tokens` sans route HTTP).
 *  - Enveloppe de réponse uniforme :
 *      succès  -> `{ "success": true, "data": ..., "meta"?: {...} }`
 *      erreur  -> `{ "success": false, "error": { "code", "message", "details"? } }`
 *  - Liste : `GET /<entite>` avec `limit`, `offset`, `page` (1-indexée, prioritaire sur
 *    `offset`), `orderby` (`champ.ASC,autre.DESC`), `with` (relations, séparées par des virgules).
 *  - Liste filtrée : méthode HTTP `QUERY /<entite>` ou repli `POST /<entite>/query`,
 *    avec un corps `{ filter, limit, offset, page, orderby, with }`. `filter` est une
 *    expression texte : `status == 'active' AND (age >= 18 OR role IN ('admin','owner'))`.
 *    Opérateurs : `== != < > <= >= IN "NOT IN" LIKE`.
 *  - Détail : `GET /<entite>/<id>` (option `with`).
 *  - Création : `POST /<entite>` (201).
 *  - Modification : `PUT /<entite>/<id>` (partielle, seuls les champs fournis sont écrits).
 *  - Suppression : `DELETE /<entite>/<id>` (soft delete, renvoie `data: null`).
 */

export interface SyloTokenBundle {
  token: string
  /** ISO 8601, tel que renvoyé par Sylo (`expires_at`). */
  expiresAt: string | null
  /** Utilisateur connecté (`user_id`), `null` pour une session ouverte avant son ajout. */
  userId: number | null
}

export interface SyloListMeta {
  total: number
  limit: number
  offset: number
  page: number
}

export interface SyloListResult<T = unknown> {
  data: T[]
  meta: SyloListMeta
}

export interface SyloStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface SyloListParams {
  limit?: number
  offset?: number
  /** Page 1-indexée ; prioritaire sur `offset` côté Sylo. */
  page?: number
  /** `"email.ASC"` ou `["email.ASC", "created_at.DESC"]`. */
  orderby?: string | string[]
  /** Relations à charger : `"role"` ou `["role", "permissions"]`. */
  with?: string | string[]
  /**
   * Paramètres propres au backend, hors conventions Sylo (ex :
   * `{ with_knowledge: true }`) : en querystring pour `list()` et `get()`,
   * dans le corps de la requête pour `query()`.
   */
  extra?: Record<string, string | number | boolean>
}

export interface SyloQueryParams
  extends Omit<SyloListParams, "extra"> {
  /** Expression de filtre Sylo. Voir l'aide `sf` plus bas pour la construire. */
  filter?: string
  /** Comme `SyloListParams.extra`, mais envoyé en JSON : tableaux et objets acceptés. */
  extra?: Record<string, unknown>
}

export interface SyloConnectorOptions {
  /** URL racine de l'API, ex: `"https://api.exemple.fr"` (sans slash final). */
  baseUrl: string
  /**
   * Où conserver le token :
   *  - `"session"` (défaut) : `sessionStorage`, effacé à la fermeture de l'onglet ;
   *  - `"local"` : `localStorage`, persistant ;
   *  - `"memory"` : mémoire du process uniquement ;
   *  - un objet `SyloStorage` personnalisé.
   */
  storage?: "session" | "local" | "memory" | SyloStorage
  /** Clé de stockage du token. Défaut : `"sylo.auth"`. */
  storageKey?: string
  /**
   * Transport des listes filtrées :
   *  - `"post"` (défaut) : `POST /<entite>/query` — compatible avec tous les proxys ;
   *  - `"query"` : méthode HTTP `QUERY /<entite>` (brouillon IETF, nécessite que
   *    l'infra et le CORS l'autorisent).
   */
  queryTransport?: "post" | "query"
  /** Préfixe de route de l'entité de login. Défaut : `"/users"`. */
  authPrefix?: string
  /** Implémentation de `fetch` à utiliser (tests, SSR…). Défaut : `globalThis.fetch`. */
  fetch?: typeof fetch
  /** En-têtes ajoutés à chaque requête. */
  defaultHeaders?: Record<string, string>
  /** Appelé quand l'API renvoie 401 (le token est alors effacé automatiquement). */
  onUnauthorized?: (error: SyloApiError) => void
}

/** Erreur normalisée : reprend `error.code` / `error.message` de l'enveloppe Sylo. */
export class SyloApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details: unknown

  constructor(
    message: string,
    opts: { code?: string; status?: number; details?: unknown } = {},
  ) {
    super(message)
    this.name = "SyloApiError"
    this.code = opts.code ?? "error"
    this.status = opts.status ?? 0
    this.details = opts.details ?? null
  }
}

class MemoryStorage implements SyloStorage {
  private store = new Map<string, string>()
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key) as string : null
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
}

function resolveStorage(choice: SyloConnectorOptions["storage"]): SyloStorage {
  if (choice && typeof choice === "object") return choice
  if (choice === "memory") return new MemoryStorage()
  try {
    const web =
      choice === "local" ? globalThis.localStorage : globalThis.sessionStorage
    if (web) {
      // Sonde d'accès : en navigation privée / cookies bloqués, l'accès peut lever.
      const probe = "__sylo_probe__"
      web.setItem(probe, "1")
      web.removeItem(probe)
      return web
    }
  } catch {
    /* indisponible : repli mémoire */
  }
  return new MemoryStorage()
}

function toCsv(value?: string | string[]): string | undefined {
  if (value == null) return undefined
  const parts = (Array.isArray(value) ? value : [value])
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length ? parts.join(",") : undefined
}

export class SyloConnector {
  private readonly baseUrl: string
  private readonly storage: SyloStorage
  private readonly storageKey: string
  private readonly queryTransport: "post" | "query"
  private readonly authPrefix: string
  private readonly fetchImpl: typeof fetch
  private readonly defaultHeaders: Record<string, string>
  private readonly onUnauthorized?: (error: SyloApiError) => void

  private bundle: SyloTokenBundle | null = null
  private readonly authListeners = new Set<(authed: boolean) => void>()

  constructor(options: SyloConnectorOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "")
    this.storage = resolveStorage(options.storage ?? "session")
    this.storageKey = options.storageKey ?? "sylo.auth"
    this.queryTransport = options.queryTransport ?? "post"
    this.authPrefix = normalizePrefix(options.authPrefix ?? "/users")
    this.fetchImpl = options.fetch ?? globalThis.fetch?.bind(globalThis)
    this.defaultHeaders = options.defaultHeaders ?? {}
    this.onUnauthorized = options.onUnauthorized

    if (!this.fetchImpl) {
      throw new Error(
        "SyloConnector: aucune implémentation de `fetch` disponible.",
      )
    }
    this.bundle = this.readBundle()
  }

  // --------------------------------------------------------------------------
  // Session
  // --------------------------------------------------------------------------

  /** Token courant, ou `null` s'il est absent / expiré. */
  get token(): string | null {
    if (!this.bundle) return null
    if (this.isExpired) {
      this.clearSession()
      return null
    }
    return this.bundle.token
  }

  get expiresAt(): Date | null {
    return this.bundle?.expiresAt ? new Date(this.bundle.expiresAt) : null
  }

  get isExpired(): boolean {
    const at = this.bundle?.expiresAt
    return at != null && Date.parse(at) <= Date.now()
  }

  /** Id de l'utilisateur connecté, ou `null` s'il est inconnu. */
  get userId(): number | null {
    return this.token != null ? this.bundle!.userId ?? null : null
  }

  get isAuthenticated(): boolean {
    return this.token != null
  }

  /**
   * S'abonne aux changements d'état d'authentification (login, logout, session
   * effacée après un 401). Renvoie une fonction de désabonnement.
   */
  onAuthChange(listener: (authed: boolean) => void): () => void {
    this.authListeners.add(listener)
    return () => this.authListeners.delete(listener)
  }

  private notifyAuthChange(): void {
    const authed = this.isAuthenticated
    for (const listener of this.authListeners) listener(authed)
  }

  /** `POST /users/login` : authentifie et conserve le token en session. */
  async login(email: string, password: string): Promise<SyloTokenBundle> {
    const { data } = await this.request<{
      token: string
      expires_at?: string | null
      user_id?: number | null
    }>("POST", `${this.authPrefix}/login`, {
      body: { email, password },
      auth: false,
    })
    const bundle: SyloTokenBundle = {
      token: data.token,
      expiresAt: data.expires_at ?? null,
      userId: data.user_id ?? null,
    }
    this.writeBundle(bundle)
    return bundle
  }

  /**
   * `POST /users/register` : crée un compte (route publique, protégée par un
   * captcha). N'authentifie pas : enchaîner avec `login()` si besoin.
   */
  async register<T = unknown,>(payload: {
    email: string
    first_name: string
    last_name: string
    password: string
    is_mailing_allowed: boolean
    captcha_token: string
  }): Promise<T> {
    const { data } = await this.request<T>(
      "POST",
      `${this.authPrefix}/register`,
      { body: payload, auth: false },
    )
    return data
  }

  /**
   * `POST /users/forgot-password` : demande l'e-mail de réinitialisation (route
   * publique, protégée par un captcha). Répond 200 que le compte existe ou non.
   */
  async forgotPassword(payload: {
    email: string
    captcha_token: string
  }): Promise<void> {
    await this.request("POST", `${this.authPrefix}/forgot-password`, {
      body: payload,
      auth: false,
    })
  }

  /**
   * `POST /users/reset-password` : définit un nouveau mot de passe à partir du
   * jeton reçu par e-mail (400 `invalid_reset_token` s'il est invalide ou expiré).
   * N'authentifie pas : l'utilisateur se connecte ensuite normalement.
   */
  async resetPassword(payload: {
    token: string
    password: string
  }): Promise<void> {
    await this.request("POST", `${this.authPrefix}/reset-password`, {
      body: payload,
      auth: false,
    })
  }

  /**
   * `POST /users/unsubscribe` : coupe les e-mails d'information à partir du jeton
   * du lien reçu par e-mail (400 `invalid_unsubscribe_token` s'il est invalide).
   * Route publique : le jeton fait office d'authentification.
   */
  async unsubscribe(payload: { token: string }): Promise<void> {
    await this.request("POST", `${this.authPrefix}/unsubscribe`, {
      body: payload,
      auth: false,
    })
  }

  /**
   * `POST /users/resume` : sort du mode vacances et active le thème annoncé, à
   * partir du jeton du lien reçu par e-mail (400 `invalid_resume_token` s'il est
   * invalide). Route publique : le jeton fait office d'authentification.
   */
  async resumeFromVacation(payload: {
    token: string
  }): Promise<{ theme_id: number }> {
    const { data } = await this.request<{ theme_id: number }>(
      "POST",
      `${this.authPrefix}/resume`,
      { body: payload, auth: false },
    )
    return data
  }

  /**
   * Déconnexion. Sylo n'exposant pas de route dédiée, on se contente d'effacer le
   * token de la session locale.
   */
  logout(): void {
    this.clearSession()
  }

  private clearSession(): void {
    this.bundle = null
    try {
      this.storage.removeItem(this.storageKey)
    } catch {
      /* ignore */
    }
    this.notifyAuthChange()
  }

  private writeBundle(bundle: SyloTokenBundle): void {
    this.bundle = bundle
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(bundle))
    } catch {
      /* stockage indisponible : le token reste au moins en mémoire */
    }
    this.notifyAuthChange()
  }

  private readBundle(): SyloTokenBundle | null {
    try {
      const raw = this.storage.getItem(this.storageKey)
      if (!raw) return null
      const parsed = JSON.parse(raw) as SyloTokenBundle
      return parsed && typeof parsed.token === "string" ? parsed : null
    } catch {
      return null
    }
  }

  // --------------------------------------------------------------------------
  // CRUD
  // --------------------------------------------------------------------------

  /** `GET /<entite>` : liste paginée simple (sans filtre). */
  async list<T = unknown,>(
    entity: string,
    params: SyloListParams = {},
  ): Promise<SyloListResult<T>> {
    const res = await this.request<T[]>("GET", entityPath(entity), {
      query: {
        ...params.extra,
        limit: params.limit,
        offset: params.offset,
        page: params.page,
        orderby: toCsv(params.orderby),
        with: toCsv(params.with),
      },
    })
    return { data: res.data, meta: res.meta as SyloListMeta }
  }

  /**
   * `GET /<entite>` page après page (`limit` = taille de page, 200 max côté Sylo)
   * jusqu'à avoir récupéré `meta.total` éléments.
   */
  async listAll<T = unknown,>(
    entity: string,
    params: Omit<SyloListParams, "page" | "offset"> = {},
  ): Promise<T[]> {
    const limit = params.limit ?? 200
    const items: T[] = []
    for (let page = 1; ; page++) {
      const { data, meta } = await this.list<T>(entity, {
        ...params,
        limit,
        page,
      })
      items.push(...data)
      if (data.length < limit || items.length >= meta.total) return items
    }
  }

  /**
   * `QUERY /<entite>` (ou `POST /<entite>/query` selon `queryTransport`) : liste avec
   * expression de filtre dans le corps de la requête.
   */
  async query<T = unknown,>(
    entity: string,
    params: SyloQueryParams = {},
  ): Promise<SyloListResult<T>> {
    const body: Record<string, unknown> = { ...params.extra }
    if (params.filter) body.filter = params.filter
    if (params.limit != null) body.limit = params.limit
    if (params.offset != null) body.offset = params.offset
    if (params.page != null) body.page = params.page
    const orderby = toCsv(params.orderby)
    if (orderby) body.orderby = orderby
    const withRel = Array.isArray(params.with)
      ? params.with
      : params.with
        ? [params.with]
        : undefined
    if (withRel?.length) body.with = withRel

    const res =
      this.queryTransport === "query"
        ? await this.request<T[]>("QUERY", entityPath(entity), { body })
        : await this.request<T[]>("POST", `${entityPath(entity)}/query`, {
            body,
          })

    return { data: res.data, meta: res.meta as SyloListMeta }
  }

  /** Comme `listAll`, avec filtre : `query` page après page. */
  async queryAll<T = unknown,>(
    entity: string,
    params: Omit<SyloQueryParams, "page" | "offset"> = {},
  ): Promise<T[]> {
    const limit = params.limit ?? 200
    const items: T[] = []
    for (let page = 1; ; page++) {
      const { data, meta } = await this.query<T>(entity, {
        ...params,
        limit,
        page,
      })
      items.push(...data)
      if (data.length < limit || items.length >= meta.total) return items
    }
  }

  /** `GET /<entite>/<id>` : détail d'un élément. */
  async get<T = unknown,>(
    entity: string,
    id: string | number,
    params: Pick<SyloListParams, "with" | "extra"> = {},
  ): Promise<T> {
    const { data } = await this.request<T>(
      "GET",
      `${entityPath(entity)}/${encodeURIComponent(id)}`,
      {
        query: { ...params.extra, with: toCsv(params.with) },
      },
    )
    return data
  }

  /** `POST /<entite>` : création d'un élément. */
  async create<T = unknown,>(
    entity: string,
    payload: Record<string, unknown>,
    params: { with?: string | string[] } = {},
  ): Promise<T> {
    const { data } = await this.request<T>("POST", entityPath(entity), {
      body: payload,
      query: { with: toCsv(params.with) },
    })
    return data
  }

  /** `PUT /<entite>/<id>` : modification partielle (seuls les champs fournis sont écrits). */
  async update<T = unknown,>(
    entity: string,
    id: string | number,
    payload: Record<string, unknown>,
    params: { with?: string | string[] } = {},
  ): Promise<T> {
    const { data } = await this.request<T>(
      "PUT",
      `${entityPath(entity)}/${encodeURIComponent(id)}`,
      { body: payload, query: { with: toCsv(params.with) } },
    )
    return data
  }

  /** `DELETE /<entite>/<id>` : suppression (soft delete côté Sylo). */
  async remove(entity: string, id: string | number): Promise<void> {
    await this.request<null>(
      "DELETE",
      `${entityPath(entity)}/${encodeURIComponent(id)}`,
    )
  }

  // --------------------------------------------------------------------------
  // Bas niveau
  // --------------------------------------------------------------------------

  /** Échappatoire : requête brute, avec gestion du Bearer et de l'enveloppe Sylo. */
  async call<T = unknown,>(
    method: string,
    path: string,
    opts: {
      query?: Record<string, unknown>
      body?: unknown
      auth?: boolean
    } = {},
  ): Promise<{ data: T; meta?: unknown }> {
    return this.request<T>(method, path, opts)
  }

  private async request<T,>(
    method: string,
    path: string,
    opts: {
      query?: Record<string, unknown>
      body?: unknown
      auth?: boolean
    } = {},
  ): Promise<{ data: T; meta?: unknown }> {
    const url =
      this.baseUrl +
      (path.startsWith("/") ? path : `/${path}`) +
      buildQueryString(opts.query)

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...this.defaultHeaders,
    }
    const hasBody = opts.body !== undefined
    if (hasBody) headers["Content-Type"] = "application/json"

    if (opts.auth !== false) {
      const token = this.token
      if (token) headers.Authorization = `Bearer ${token}`
    }

    let response: Response
    try {
      response = await this.fetchImpl(url, {
        method,
        headers,
        body: hasBody ? JSON.stringify(opts.body) : undefined,
      })
    } catch (cause) {
      throw new SyloApiError(
        `Requête ${method} ${path} impossible : ${(cause as Error).message}`,
        {
          code: "network_error",
        },
      )
    }

    const envelope = await parseJson(response)

    if (!response.ok || (envelope && envelope.success === false)) {
      const err = (envelope && envelope.error) || {}
      const apiError = new SyloApiError(
        err.message || response.statusText || "Erreur API Sylo",
        {
          code: err.code || `http_${response.status}`,
          status: response.status,
          details: err.details ?? null,
        },
      )
      if (response.status === 401) {
        this.clearSession()
        this.onUnauthorized?.(apiError)
      }
      throw apiError
    }

    // Les routes custom (ex. `/training/configuration`) renvoient l'objet brut,
    // sans enveloppe `{ success, data }` : on le prend tel quel.
    const enveloped =
      envelope != null && typeof envelope === "object" && "data" in envelope
    return {
      data: (enveloped ? envelope.data : envelope) as T,
      meta: envelope ? envelope.meta : undefined,
    }
  }
}

// ----------------------------------------------------------------------------
// Helpers de chemin / querystring
// ----------------------------------------------------------------------------

function normalizePrefix(prefix: string): string {
  const trimmed = prefix.trim().replace(/\/+$/, "")
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

/** Accepte `"users"` comme `"/users"`. */
function entityPath(entity: string): string {
  return normalizePrefix(entity)
}

function buildQueryString(query?: Record<string, unknown>): string {
  if (!query) return ""
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    search.append(key, String(value))
  }
  const s = search.toString()
  return s ? `?${s}` : ""
}

async function parseJson(response: Response): Promise<any> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return {
      success: false,
      error: { code: "invalid_response", message: text.slice(0, 500) },
    }
  }
}

// ----------------------------------------------------------------------------
// `sf` — construction sûre d'expressions de filtre Sylo
// ----------------------------------------------------------------------------

type SyloScalar = string | number | boolean | null

function literal(value: SyloScalar): string {
  if (value === null) return "null"
  if (typeof value === "boolean") return value ? "true" : "false"
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      throw new Error("sf: nombre non fini dans un filtre.")
    return String(value)
  }
  // Sylo dé-échappe `\<c>` -> `<c>` : on protège `\` et `'`.
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`
}

function needsParens(expr: string): boolean {
  return / AND | OR /.test(expr)
}

function group(expr: string): string {
  return needsParens(expr) ? `(${expr})` : expr
}

/**
 * Fabrique d'expressions de filtre. Exemple :
 *
 *   sf.and(
 *     sf.eq("status", "active"),
 *     sf.or(sf.gte("age", 18), sf.in("role", ["admin", "owner"])),
 *     sf.like("name", "ali"),
 *   )
 *   // status == 'active' AND (age >= 18 OR role IN ('admin', 'owner')) AND name LIKE 'ali'
 */
export const sf = {
  raw: (expression: string): string => expression,
  eq: (field: string, value: SyloScalar): string =>
    `${field} == ${literal(value)}`,
  ne: (field: string, value: SyloScalar): string =>
    `${field} != ${literal(value)}`,
  lt: (field: string, value: SyloScalar): string =>
    `${field} < ${literal(value)}`,
  gt: (field: string, value: SyloScalar): string =>
    `${field} > ${literal(value)}`,
  lte: (field: string, value: SyloScalar): string =>
    `${field} <= ${literal(value)}`,
  gte: (field: string, value: SyloScalar): string =>
    `${field} >= ${literal(value)}`,
  /** Recherche « contient », insensible à la casse, sur un champ texte. */
  like: (field: string, value: string): string =>
    `${field} LIKE ${literal(value)}`,
  in: (field: string, values: readonly SyloScalar[]): string =>
    `${field} IN (${values.map(literal).join(", ")})`,
  notIn: (field: string, values: readonly SyloScalar[]): string =>
    `${field} NOT IN (${values.map(literal).join(", ")})`,
  and: (...parts: Array<string | false | null | undefined>): string =>
    parts
      .filter(Boolean)
      .map((p) => group(p as string))
      .join(" AND "),
  or: (...parts: Array<string | false | null | undefined>): string =>
    parts
      .filter(Boolean)
      .map((p) => group(p as string))
      .join(" OR "),
}

export default SyloConnector
