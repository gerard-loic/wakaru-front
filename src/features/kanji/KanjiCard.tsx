import { MasteryDot } from "@/components/Mastery"
import { LevelBadge } from "@/components/Badges"
import type { KanjiEntry } from "@/features/kanji/kanjiModel"

export function KanjiCard({
  k,
  onOpen,
}: {
  k: KanjiEntry
  onOpen: (id: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(k.id)}
      aria-haspopup="dialog"
      className="group text-left border border-line bg-panel hover:border-ember transition-colors p-4 flex gap-4"
    >
      <div className="relative jp text-6xl leading-none font-500 group-hover:text-ember transition-colors">
        <MasteryDot level={k.mastery} className="absolute -top-1 -left-1" />
        {k.char}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mono text-[10px] text-fog uppercase">On</div>
        <div className="jp text-sm mb-1 truncate">{k.on.join("・") || "—"}</div>
        <div className="mono text-[10px] text-fog uppercase">Kun</div>
        <div className="jp text-sm truncate">{k.kun.join("・") || "—"}</div>
        {k.meaning && (
          <div className="text-xs text-fog mt-1 truncate">{k.meaning}</div>
        )}
      </div>
      {k.level && (
        <div className="shrink-0">
          <LevelBadge level={k.level} />
        </div>
      )}
    </button>
  )
}
