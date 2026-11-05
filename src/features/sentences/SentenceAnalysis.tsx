import { useMemo, type CSSProperties } from "react"
import { sentenceRole } from "@/lib/sentenceRoles"
import {
  chunkTokens,
  type SentenceChunk,
  type SentenceToken,
} from "@/features/sentences/sentenceModel"

/**
 * Analyse d'une phrase : la phrase découpée en groupes colorés par rôle
 * (mot + particule qui le marque), puis le détail de chaque élément.
 * Purement présentationnel.
 */
export function SentenceAnalysis({
  tokens,
  onOpenWord,
}: {
  /** Éléments de la phrase, dans l'ordre. */
  tokens: SentenceToken[]
  /** Ouvre le détail d'un mot relié. */
  onOpenWord: (id: number) => void
}) {
  const chunks = useMemo(() => chunkTokens(tokens), [tokens])

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap items-start gap-x-2 gap-y-3"
        aria-label="Phrase découpée par rôle grammatical"
      >
        {chunks.map((c) => (
          <ChunkBlock key={c.key} chunk={c} />
        ))}
      </div>

      <ol className="space-y-2">
        {chunks.flatMap((c) =>
          c.tokens
            .filter((t) => !t.punctuation)
            .map((t) => (
              <TokenDetail key={t.id} token={t} chunk={c} onOpenWord={onOpenWord} />
            )),
        )}
      </ol>
    </div>
  )
}

/** Groupe : éléments du groupe, la particule dans la couleur du rôle, libellé dessous. */
function ChunkBlock({ chunk }: { chunk: SentenceChunk }) {
  if (chunk.tokens[0].punctuation) {
    return (
      <span className="jp text-2xl leading-none text-fog pt-2">
        {chunk.tokens.map((t) => t.text).join("")}
      </span>
    )
  }

  const role = sentenceRole(chunk.role)
  const accent = { "--accent": role.color } as CSSProperties

  return (
    <div style={accent} className="flex flex-col items-center gap-1.5">
      <div
        className={
          "jp text-2xl leading-none px-2.5 py-2 border " +
          (chunk.role ? "border-(--accent)/60 bg-(--accent)/10" : "border-line")
        }
        title={chunk.roleName ?? undefined}
      >
        {chunk.tokens.map((t, i) => (
          <span
            key={t.id}
            className={i > 0 && !t.role ? "text-(--accent)" : "text-chalk"}
          >
            {t.text}
          </span>
        ))}
      </div>
      <span className="mono text-[9px] uppercase tracking-[0.1em] text-(--accent) min-h-3">
        {role.label}
      </span>
    </div>
  )
}

/** Détail d'un élément : lecture, forme du dictionnaire, rôle et mot relié. */
function TokenDetail({
  token: t,
  chunk,
  onOpenWord,
}: {
  token: SentenceToken
  chunk: SentenceChunk
  onOpenWord: (id: number) => void
}) {
  // Un élément sans rôle propre hérite de la couleur du groupe qu'il marque.
  const marks = !t.role && chunk.role ? chunk : null
  const role = sentenceRole(t.role ?? marks?.role)
  const head = marks?.tokens.filter((x) => x !== t && x.role).map((x) => x.text).join("")

  return (
    <li
      style={{ "--accent": role.color } as CSSProperties}
      className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 items-start border border-line bg-ink/30 px-4 py-3"
    >
      <div className="min-w-0">
        <div className="jp text-xl leading-tight break-words">{t.text}</div>
        {t.reading && t.reading !== t.text && (
          <div className="jp text-sm text-fog mt-0.5">{t.reading}</div>
        )}
      </div>

      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {t.role ? (
            <span className="mono text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-(--accent)/50 text-(--accent)">
              {role.label}
            </span>
          ) : marks ? (
            <span className="mono text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-line text-(--accent)">
              {marks.role === "predicate" ? "Complète" : "Marque"} · {role.label}
            </span>
          ) : null}
          {t.lemma && (
            <span className="text-xs text-fog">
              Forme du dictionnaire : <span className="jp text-sm text-chalk">{t.lemma}</span>
            </span>
          )}
        </div>

        {t.role && t.roleName && (
          <p className="text-sm text-chalk/90">{t.roleName}</p>
        )}
        {marks &&
          (marks.role === "predicate" ? (
            // Ex. です après きれい : complète le prédicat plutôt qu'il ne le marque.
            <p className="text-sm text-chalk/90">
              Complète le prédicat
              {head ? <> « <span className="jp">{head}</span> »</> : ""}.
            </p>
          ) : (
            <p className="text-sm text-chalk/90">
              Particule qui marque{head ? <> « <span className="jp">{head}</span> »</> : ""} comme{" "}
              {role.label.toLowerCase()}
              {marks.roleName ? ` : ${lowerFirst(marks.roleName)}.` : "."}
            </p>
          ))}

        {t.word && (
          <button
            type="button"
            onClick={() => onOpenWord(t.word!.id)}
            aria-haspopup="dialog"
            className="mono text-[10px] uppercase tracking-[0.1em] px-2 py-1 border border-line text-fog hover:border-ember hover:text-ember transition-colors cursor-pointer"
          >
            <span className="jp text-sm normal-case tracking-normal mr-1.5">
              {t.word.writing}
            </span>
            Voir le mot →
          </button>
        )}
      </div>
    </li>
  )
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1)
}
