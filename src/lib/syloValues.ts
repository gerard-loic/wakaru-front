/**
 * Aides pour les champs texte « structurés » renvoyés par le backend Sylo, et
 * pour la recherche plein texte via les filtres `LIKE`.
 */

import { sf } from "@/lib/sylo"

/**
 * Décode une liste stockée en texte :
 *  - tableau JSON : `'["parc", "jardin public"]'` ;
 *  - tableau PostgreSQL : `'{montagne,"mont Fuji"}'` ;
 *  - toute autre valeur devient un élément unique.
 */
export function parseList(raw: string | null | undefined): unknown[] {
  const text = raw?.trim()
  if (!text) return []
  try {
    const value: unknown = JSON.parse(text)
    if (Array.isArray(value)) return value
    // `{}` : tableau PostgreSQL vide (et non un objet JSON vide).
    if (isEmptyObject(value)) return []
    return [value]
  } catch {
    if (text.startsWith("{") && text.endsWith("}")) return parsePgArray(text)
    return [text]
  }
}

function isEmptyObject(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).length === 0
  )
}

/** Comme `parseList`, en ne gardant que les chaînes non vides. */
export function parseStringList(raw: string | null | undefined): string[] {
  return parseList(raw)
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
}

/** Décode un objet JSON stocké en texte, ou `null` si ce n'en est pas un. */
export function parseObject(
  raw: string | null | undefined,
): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(raw ?? "")
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/** `{a,"b c","d\"e",NULL}` -> `["a", "b c", 'd"e']` (une dimension). */
function parsePgArray(text: string): string[] {
  const body = text.slice(1, -1)
  const items: string[] = []
  let current = ""
  let quoted = false
  let wasQuoted = false

  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (quoted) {
      if (c === "\\") current += body[++i] ?? ""
      else if (c === '"') quoted = false
      else current += c
    } else if (c === '"') {
      quoted = wasQuoted = true
    } else if (c === ",") {
      push()
    } else {
      current += c
    }
  }
  if (body.length) push()
  return items

  function push() {
    const value = wasQuoted ? current : current.trim()
    if (wasQuoted || value.toUpperCase() !== "NULL") items.push(value)
    current = ""
    wasQuoted = false
  }
}

/**
 * Échappe les caractères non ASCII comme `json.dumps` en Python (`é` ->
 * `é`) : forme sous laquelle le backend stocke certains champs JSON.
 */
export function asciiEscape(text: string): string {
  return text.replace(
    /[^\x00-\x7f]/g,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  )
}

/** Hiragana -> katakana (les deux blocs Unicode sont décalés de 0x60). */
export function toKatakana(text: string): string {
  return text.replace(/[\u3041-\u3096]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) + 0x60),
  )
}

/**
 * Filtre « contient `query` » sur plusieurs champs, combinés en `OR`.
 * `escapedFields` sont stockés en JSON échappé : on y cherche aussi la forme
 * `\uXXXX`, sans quoi accents et kana n'y seraient jamais trouvés.
 * Renvoie `""` si `query` est vide.
 */
export function likeAny(
  query: string,
  fields: string[],
  escapedFields: string[] = [],
): string {
  if (!query) return ""
  const escaped = asciiEscape(query)
  return sf.or(
    ...fields.map((f) => sf.like(f, query)),
    ...(escaped === query
      ? []
      : escapedFields.map((f) => sf.like(f, escaped))),
  )
}
