import { useMemo } from "react"
import {
  parseRichText,
  splitTerm,
  splitTranslation,
  type RichBlock,
} from "@/lib/richText"

/**
 * Affiche un texte pédagogique structuré par convention (voir
 * `parseRichText`) : intitulés, encadrés « libellé : texte », listes, et
 * exemples « japonais → traduction » mis en forme.
 */
export function RichText({
  text,
  className = "",
}: {
  text: string | null | undefined
  className?: string
}) {
  const blocks = useMemo(() => parseRichText(text), [text])
  return (
    <div className={"space-y-4 " + className}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: RichBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h4 className="mono text-[11px] uppercase tracking-[0.14em] text-ember pt-2">
          {block.text}
        </h4>
      )
    case "definition":
      return (
        <div className="border border-line bg-ink/30 px-4 py-3">
          <div className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-1">
            {block.label}
          </div>
          <div className="jp text-base text-chalk">{block.text}</div>
        </div>
      )
    case "list": {
      const Tag = block.ordered ? "ol" : "ul"
      return (
        <Tag className="space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="num text-[11px] text-fog shrink-0 pt-0.5 w-5 text-right"
                aria-hidden
              >
                {block.ordered ? `${i + 1}.` : "・"}
              </span>
              <ListItem text={item} />
            </li>
          ))}
        </Tag>
      )
    }
    default:
      return (
        <p className="text-sm text-chalk/90 leading-relaxed">{block.text}</p>
      )
  }
}

/**
 * « original → traduction » devient un exemple sur deux lignes ;
 * « terme = explication » met le terme en avant.
 */
function ListItem({ text }: { text: string }) {
  const pair = splitTranslation(text)
  if (!pair) {
    const term = splitTerm(text)
    return (
      <span className="text-sm text-chalk/90 leading-relaxed">
        {term ? (
          <>
            <span className="jp text-base text-ember mr-1.5">{term[0]}</span>
            {term[1]}
          </>
        ) : (
          text
        )}
      </span>
    )
  }
  return (
    <span className="block border-l-2 border-ember/60 pl-3">
      <span className="jp text-base block">{pair[0]}</span>
      <span className="text-sm text-fog block">{pair[1]}</span>
    </span>
  )
}
