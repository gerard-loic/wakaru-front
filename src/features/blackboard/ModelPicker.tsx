import { useState } from "react"
import { Empty } from "@/components/Empty"
import { FilterChip } from "@/components/FilterChip"
import { Modal } from "@/components/Modal"
import { Pagination } from "@/components/Pagination"
import { Search } from "@/components/Search"
import { useKanas, type KanaScript } from "@/features/kana/useKanas"
import { useKanjis } from "@/features/kanji/useKanjis"

type Script = KanaScript | "kanji"

const SCRIPTS: { key: Script; label: string }[] = [
  { key: "hiragana", label: "Hiragana" },
  { key: "katakana", label: "Katakana" },
  { key: "kanji", label: "Kanji" },
]

const GRID_CLASS = "grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2"

function CharButton({
  char,
  hint,
  onPick,
}: {
  char: string
  hint: string
  onPick: (char: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(char)}
      className="min-w-0 border border-line px-1 py-2 text-center transition-colors hover:border-ember"
    >
      <span className="jp block text-2xl leading-tight">{char}</span>
      <span className="mono block text-[10px] text-fog truncate">{hint}</span>
    </button>
  )
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="border border-ember/40 bg-ember/5 px-4 py-6 flex flex-col items-center gap-3 text-center"
    >
      <p className="mono text-xs text-ember">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mono text-xs uppercase tracking-[0.1em] text-ember hover:text-ember-soft underline underline-offset-4"
      >
        Réessayer
      </button>
    </div>
  )
}

function Loading() {
  return (
    <div className={GRID_CLASS} aria-busy="true">
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="h-16 bg-panel-2 animate-pulse" />
      ))}
    </div>
  )
}

function KanaChoices({
  script,
  onPick,
}: {
  script: KanaScript
  onPick: (char: string) => void
}) {
  const { sections, loading, error, reload } = useKanas(script)
  if (error) return <LoadError message={error} onRetry={reload} />
  if (loading && sections.length === 0) return <Loading />
  if (sections.length === 0) return <Empty />
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.key}>
          {section.title && (
            <h3 className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">
              {section.title}
            </h3>
          )}
          <div className={GRID_CLASS}>
            {section.items.map((item) => (
              <CharButton
                key={item.id}
                char={item.kana}
                hint={item.romaji}
                onPick={onPick}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function KanjiChoices({ onPick }: { onPick: (char: string) => void }) {
  const { kanjis, loading, error, reload, pagination, query, setQuery } = useKanjis()
  return (
    <div className="space-y-4">
      <Search
        value={query}
        onChange={setQuery}
        placeholder="Kanji, sens ou lecture…"
      />
      {error ? (
        <LoadError message={error} onRetry={reload} />
      ) : loading && kanjis.length === 0 ? (
        <Loading />
      ) : kanjis.length === 0 ? (
        <Empty />
      ) : (
        <>
          <div
            aria-busy={loading}
            className={GRID_CLASS + " transition-opacity " + (loading ? "opacity-50" : "")}
          >
            {kanjis.map((kanji) => (
              <CharButton
                key={kanji.id}
                char={kanji.char}
                hint={kanji.meaning}
                onPick={onPick}
              />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={pagination.setPage}
            start={pagination.start}
            end={pagination.end}
            total={pagination.total}
            unit="kanji"
          />
        </>
      )}
    </div>
  )
}

/** Popin de choix du caractère affiché en fond du tableau noir. */
export default function ModelPicker({
  onPick,
  onClose,
}: {
  onPick: (char: string) => void
  onClose: () => void
}) {
  const [script, setScript] = useState<Script>("hiragana")
  return (
    <Modal title="Charger un modèle" onClose={onClose} size="lg">
      <div className="flex flex-wrap gap-2 mb-5">
        {SCRIPTS.map((s) => (
          <FilterChip
            key={s.key}
            label={s.label}
            active={script === s.key}
            onClick={() => setScript(s.key)}
          />
        ))}
      </div>
      {script === "kanji" ? (
        <KanjiChoices onPick={onPick} />
      ) : (
        <KanaChoices key={script} script={script} onPick={onPick} />
      )}
    </Modal>
  )
}
