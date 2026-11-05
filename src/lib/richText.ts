/**
 * Lecture d'un texte pédagogique « structuré par convention » (descriptions
 * de règles, explications…) en blocs affichables :
 *
 *   Paragraphe libre.                      -> paragraph
 *   Exemples :                             -> heading
 *   Schéma : Lieu + で + Verbe             -> definition (libellé court + texte)
 *   ・item  /  - item  /  • item           -> list (non ordonnée)
 *   1. item  /  1) item                    -> list (ordonnée)
 *
 * Dans une liste, `splitTranslation` et `splitTerm` repèrent les exemples
 * (« original → traduction ») et les définitions (« terme = explication »).
 *
 * Les blocs sont séparés par des lignes vides ou par un changement de type.
 */

export type RichBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "definition"; label: string; text: string }
  | { type: "list"; ordered: boolean; items: string[] }

const HEADING = /^(.{2,40}?)\s*[:：]$/
const DEFINITION = /^([^:：]{2,30}?)\s*[:：]\s+(.+)$/
const BULLET = /^[・•\-–]\s*(.+)$/
const NUMBERED = /^\d+[.)]\s+(.+)$/

export function parseRichText(raw: string | null | undefined): RichBlock[] {
  const blocks: RichBlock[] = []
  const lines = (raw ?? "").replace(/\r\n?/g, "\n").split("\n")

  let paragraph: string[] = []
  const flushParagraph = () => {
    if (!paragraph.length) return
    const text = paragraph.join(" ")
    const def = paragraph.length === 1 ? DEFINITION.exec(text) : null
    blocks.push(
      def
        ? { type: "definition", label: def[1], text: def[2] }
        : { type: "paragraph", text },
    )
    paragraph = []
  }
  const lastList = (ordered: boolean) => {
    const last = blocks[blocks.length - 1]
    if (last?.type === "list" && last.ordered === ordered) return last
    const list: RichBlock & { type: "list" } = { type: "list", ordered, items: [] }
    blocks.push(list)
    return list
  }
  // Une ligne sans puce juste après un élément de liste le prolonge.
  let inList = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      inList = false
      continue
    }

    const bullet = BULLET.exec(line)
    const numbered = bullet ? null : NUMBERED.exec(line)
    if (bullet || numbered) {
      flushParagraph()
      lastList(!!numbered).items.push((bullet ?? numbered)![1])
      inList = true
      continue
    }

    const last = blocks[blocks.length - 1]
    if (inList && last?.type === "list" && !HEADING.test(line)) {
      last.items[last.items.length - 1] += ` ${line}`
      continue
    }
    inList = false

    if (HEADING.test(line)) {
      flushParagraph()
      blocks.push({ type: "heading", text: HEADING.exec(line)![1] })
      continue
    }
    paragraph.push(line)
  }
  flushParagraph()
  return blocks
}

/** Premier paragraphe du texte (aperçu dans une liste), ou `""`. */
export function richTextExcerpt(raw: string | null | undefined): string {
  const first = parseRichText(raw).find((b) => b.type === "paragraph")
  return first?.type === "paragraph" ? first.text : ""
}

/**
 * Sépare un exemple « original → traduction ». Renvoie `null` sans flèche.
 *   "こうえんで みます。 → Je regarde au parc." -> ["こうえんで みます。", "Je regarde au parc."]
 */
export function splitTranslation(text: string): [string, string] | null {
  const i = text.indexOf("→")
  if (i <= 0) return null
  const source = text.slice(0, i).trim()
  const target = text.slice(i + 1).trim()
  return source && target ? [source, target] : null
}

/**
 * Sépare une définition courte « terme = explication ». Renvoie `null` sinon.
 *   "で = lieu où l'action se déroule" -> ["で", "lieu où l'action se déroule"]
 */
export function splitTerm(text: string): [string, string] | null {
  const match = /^(.{1,12}?)\s+=\s+(.+)$/.exec(text)
  return match ? [match[1], match[2]] : null
}
