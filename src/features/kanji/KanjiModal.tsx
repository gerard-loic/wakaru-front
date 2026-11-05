import type { ReactNode } from "react"
import { MASTERY_META } from "@/lib/mastery"
import { readingKind } from "@/lib/readingKinds"
import { Modal } from "@/components/Modal"
import { AiNotice } from "@/components/AiNotice"
import { MasteryDot } from "@/components/Mastery"
import { LevelBadge, ThemeTag } from "@/components/Badges"
import type { KanjiDetail, KanjiExample } from "@/features/kanji/useKanji"

/** Popin de détail d'un kanji. Purement présentationnelle (voir `useKanji`). */
export function KanjiModal({
  detail,
  loading = false,
  error = null,
  onRetry,
  onOpenWord,
  onClose,
}: {
  /** Kanji à afficher, ou `null` pendant le chargement / en cas d'erreur. */
  detail: KanjiDetail | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  /** Ouvre le détail d'un mot-exemple. */
  onOpenWord: (wordId: number) => void
  onClose: () => void
}) {
  if (!detail) {
    return (
      <Modal
        size="lg"
        title={
          <span className="display font-800 text-lg">
            {error ? "Kanji indisponible" : "Chargement…"}
          </span>
        }
        onClose={onClose}
      >
        {error ? (
          <div
            role="alert"
            className="border border-ember/40 bg-ember/5 px-4 py-6 flex flex-col items-center gap-3 text-center"
          >
            <p className="mono text-xs text-ember">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mono text-xs uppercase tracking-[0.1em] text-ember hover:text-ember-soft underline underline-offset-4"
              >
                Réessayer
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-[10rem_1fr] gap-6" aria-busy={loading}>
            <div className="size-40 bg-ink/40 animate-pulse" />
            <div className="space-y-3">
              <div className="h-8 w-1/2 bg-ink/40 animate-pulse" />
              <div className="h-4 w-full bg-ink/40 animate-pulse" />
              <div className="h-4 w-5/6 bg-ink/40 animate-pulse" />
            </div>
          </div>
        )}
      </Modal>
    )
  }

  const { kanji: k, examples } = detail
  const facts = [
    k.strokes != null && `${k.strokes} trait${k.strokes > 1 ? "s" : ""}`,
    k.grade && `Grade ${k.grade}`,
    k.unicode,
  ].filter(Boolean)

  return (
    <Modal
      size="lg"
      title={
        <span className="display text-2xl font-900 tracking-tight capitalize">
          {k.meaning || k.char}
        </span>
      }
      subtitle={
        <span className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1.5">
            <MasteryDot level={k.mastery} />
            <span className="mono text-[10px] uppercase tracking-[0.1em] text-fog">
              {MASTERY_META[k.mastery].label}
            </span>
          </span>
          {k.level && <LevelBadge level={k.level} />}
        </span>
      }
      footer={<AiNotice />}
      onClose={onClose}
    >
      <div className="grid sm:grid-cols-[minmax(0,13rem)_1fr] gap-6">
        <div className="border border-line bg-ink/30 p-6 flex flex-col items-center justify-center gap-4 self-start">
          <div className="jp text-[8rem] leading-none font-500 text-chalk">
            {k.char}
          </div>
          {facts.length > 0 && (
            <div className="mono text-[10px] text-fog text-center">
              {facts.join(" · ")}
            </div>
          )}
          {k.radical && (
            <div className="flex items-center gap-2 mono text-[10px] text-fog">
              <span className="uppercase tracking-[0.12em]">Radical</span>
              <span className="jp text-base text-chalk">{k.radical}</span>
            </div>
          )}
        </div>

        <div className="space-y-6 min-w-0">
          <div className="grid grid-cols-2 gap-3">
            <ReadingBlock label="Lecture ON (音読み)" values={k.on} />
            <ReadingBlock label="Lecture KUN (訓読み)" values={k.kun} />
          </div>

          {k.otherMeanings.length > 0 && (
            <Section label="Autres significations">
              <div className="flex flex-wrap gap-2">
                {k.otherMeanings.map((m) => (
                  <span key={m} className="border border-line px-3 py-1.5 text-sm">
                    {m}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {k.description && (
            <Section label="Explication">
              <p className="text-sm text-chalk/90 leading-relaxed">
                {k.description}
              </p>
            </Section>
          )}
        </div>
      </div>

      {examples.length > 0 && (
        <div className="mt-8">
          <Section label="Mots-exemples par lecture">
            <ul className="space-y-2">
              {examples.map((ex) => (
                <ExampleRow
                  key={`${ex.wordId}-${ex.kind}-${ex.reading}`}
                  ex={ex}
                  onOpen={() => onOpenWord(ex.wordId)}
                />
              ))}
            </ul>
          </Section>
        </div>
      )}

      {k.themes.length > 0 && (
        <div className="mt-6">
          <Section label={k.themes.length > 1 ? "Thèmes" : "Thème"}>
            <div className="flex flex-wrap gap-1.5">
              {k.themes.map((t) => (
                <ThemeTag key={t.id} id={t.id} name={t.name} />
              ))}
            </div>
          </Section>
        </div>
      )}
    </Modal>
  )
}

function ReadingBlock({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="border border-line bg-ink/30 p-4">
      <div className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">
        {label}
      </div>
      <div className="jp text-2xl">{values.length ? values.join("　") : "—"}</div>
    </div>
  )
}

function ExampleRow({ ex, onOpen }: { ex: KanjiExample; onOpen: () => void }) {
  const kind = readingKind(ex.kind)
  return (
    <li className="border border-line bg-ink/30 hover:border-line-bright transition-colors">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        title="Voir le mot"
        className="group w-full min-w-0 flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer"
      >
        <span
          title={ex.kindName || kind.help}
          style={{ color: kind.color, borderColor: `${kind.color}80` }}
          className="mono text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 border shrink-0"
        >
          {kind.label}
        </span>
        <span className="jp text-sm shrink-0" style={{ color: kind.color }}>
          {ex.reading}
          {ex.rendaku && (
            <span
              className="mono text-[9px] text-fog ml-1"
              title="Rendaku : la consonne initiale est adoucie dans ce mot"
            >
              (rendaku)
            </span>
          )}
        </span>
        <span className="flex items-baseline gap-2 min-w-0">
          <span className="jp text-xl group-hover:text-ember transition-colors">
            {ex.word}
          </span>
          {ex.wordReading && ex.wordReading !== ex.word && (
            <span className="jp text-sm text-fog">{ex.wordReading}</span>
          )}
        </span>
        <span className="text-sm text-fog truncate ml-auto">{ex.meaning}</span>
      </button>
    </li>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">
        {label}
      </h3>
      {children}
    </section>
  )
}
