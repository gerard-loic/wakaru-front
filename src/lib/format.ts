export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function today() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
}

/**
 * Extrait d'au plus `max` caractères (hors « … ») sur une seule ligne, coupé
 * à la fin d'un mot quand c'est possible : le japonais n'a pas d'espaces.
 */
export function excerpt(text: string, max: number) {
  const flat = text.replace(/\s+/g, " ").trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max)
  const space = cut.lastIndexOf(" ")
  const end = space > max * 0.7 ? cut.slice(0, space) : cut
  return `${end.replace(/[\s,;:.—–-]+$/, "")}…`
}
