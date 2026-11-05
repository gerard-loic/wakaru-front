import { Fragment, type CSSProperties } from "react"
import { readingKind } from "@/lib/readingKinds"
import type { WordSegment } from "@/features/vocab/wordModel"

/**
 * Composition d'un mot : schéma (segments, leurs lectures et le mot obtenu),
 * puis explication segment par segment. Purement présentationnel.
 */
export function WordComposition({
  segments,
  writing,
  reading,
  onOpenKanji,
}: {
  /** Segments dans l'ordre d'écriture. */
  segments: WordSegment[]
  /** Mot complet et sa lecture, affichés en résultat du schéma. */
  writing: string
  reading: string
  /** Ouvre le détail d'un kanji présent dans la base. */
  onOpenKanji: (id: number) => void
}) {
  return (
    <div className="space-y-5">
      <Diagram
        segments={segments}
        writing={writing}
        reading={reading}
        onOpenKanji={onOpenKanji}
      />
      <ol className="space-y-2">
        {segments.map((s, i) => (
          <SegmentDetail
            key={s.id}
            index={i + 1}
            segment={s}
            previous={segments[i - 1]}
            onOpenKanji={onOpenKanji}
          />
        ))}
      </ol>
    </div>
  )
}

/** Segments joints par « + », puis « = » le mot complet. */
function Diagram({
  segments,
  writing,
  reading,
  onOpenKanji,
}: {
  segments: WordSegment[]
  writing: string
  reading: string
  onOpenKanji: (id: number) => void
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label={`${writing} se décompose en ${segments.map((s) => `${s.text} (${s.reading})`).join(" + ")}`}
    >
      {segments.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && <Operator>+</Operator>}
          <SegmentBlock segment={s} onOpenKanji={onOpenKanji} />
        </Fragment>
      ))}
      <Operator>=</Operator>
      <div className="border border-ember/60 bg-ember/5 px-3 py-2 text-center min-w-14">
        <div className="jp text-xs text-fog leading-tight">{reading}</div>
        <div className="jp text-3xl leading-tight text-chalk">{writing}</div>
        <div className="mono text-[9px] uppercase tracking-[0.1em] text-ember mt-1">
          Mot
        </div>
      </div>
    </div>
  )
}

function SegmentBlock({
  segment: s,
  onOpenKanji,
}: {
  segment: WordSegment
  onOpenKanji: (id: number) => void
}) {
  const kind = readingKind(s.kind)
  const accent = { "--accent": kind.color } as CSSProperties
  // Un segment d'un seul kanji connu s'ouvre directement ; sinon, le détail
  // ci-dessous propose un lien par kanji.
  const kanji = s.kanjis.length === 1 ? s.kanjis[0] : null

  const content = (
    <>
      <div
        className="jp text-xs leading-tight text-(--accent)"
        title="Lecture dans ce mot"
      >
        {s.reading || "—"}
      </div>
      <div className="jp text-3xl leading-tight text-chalk">{s.text}</div>
      <div className="mono text-[9px] uppercase tracking-[0.1em] mt-1 text-(--accent)">
        {kind.label}
        {s.rendaku && " · rendaku"}
      </div>
    </>
  )

  const className =
    "border border-(--accent)/50 bg-ink/30 px-3 py-2 text-center min-w-14"

  return kanji ? (
    <button
      type="button"
      onClick={() => onOpenKanji(kanji.id)}
      aria-haspopup="dialog"
      title={`Voir le kanji ${kanji.char}`}
      style={accent}
      className={`${className} cursor-pointer hover:bg-panel-2 hover:border-(--accent) transition-colors`}
    >
      {content}
    </button>
  ) : (
    <div style={accent} className={className}>
      {content}
    </div>
  )
}

function Operator({ children }: { children: string }) {
  return (
    <span className="mono text-lg text-fog select-none" aria-hidden>
      {children}
    </span>
  )
}

/** Explication d'un segment : type de lecture, particularités, kanji liés. */
function SegmentDetail({
  index,
  segment: s,
  previous,
  onOpenKanji,
}: {
  index: number
  segment: WordSegment
  previous?: WordSegment
  onOpenKanji: (id: number) => void
}) {
  const kind = readingKind(s.kind)
  const notes: string[] = []

  if (s.kind === "jukujikun" && [...s.text].length > 1) {
    notes.push(
      `Les kanji ${[...s.text].join("・")} se lisent ensemble « ${s.reading} » ; aucun ne se lit ainsi seul.`,
    )
  }
  if (s.kind === "iteration" && previous) {
    notes.push(
      `Reprend « ${previous.text} » : se lit « ${s.reading} »${s.rendaku ? ", avec rendaku" : ""}.`,
    )
  }
  if (s.rendaku && s.kind !== "iteration") {
    notes.push(
      `Rendaku : dans ce mot, la première consonne s'adoucit (voisement), d'où la lecture « ${s.reading} ».`,
    )
  }

  return (
    <li
      style={{ "--accent": kind.color } as CSSProperties}
      className="grid grid-cols-[1.75rem_4.5rem_minmax(0,1fr)] gap-3 items-start border border-line bg-ink/30 px-3 py-3"
    >
      <span className="num text-[11px] text-fog pt-1">
        {String(index).padStart(2, "0")}
      </span>
      <div>
        <div className="jp text-2xl leading-none">{s.text}</div>
        <div className="jp text-sm text-(--accent) mt-1">{s.reading}</div>
      </div>
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="mono text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-(--accent)/50 text-(--accent)">
            {kind.label}
          </span>
          {kind.jp && <span className="jp text-xs text-fog">{kind.jp}</span>}
        </div>
        <p className="text-sm text-chalk/90">{s.kindName || kind.help}</p>
        {notes.map((n) => (
          <p key={n} className="text-sm text-fog">
            {n}
          </p>
        ))}
        {s.kanjis.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {s.kanjis.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => onOpenKanji(k.id)}
                aria-haspopup="dialog"
                className="mono text-[10px] uppercase tracking-[0.1em] px-2 py-1 border border-line text-fog hover:border-ember hover:text-ember transition-colors cursor-pointer"
              >
                <span className="jp text-sm normal-case tracking-normal mr-1.5">
                  {k.char}
                </span>
                Voir le kanji →
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  )
}
