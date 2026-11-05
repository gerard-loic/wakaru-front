import { LevelBadge, ThemeTag } from "@/components/Badges"
import { NewTag } from "@/components/NewTag"
import type { RuleEntry } from "@/features/grammar/ruleModel"

export function RuleRow({
  rule: r,
  onOpen,
}: {
  rule: RuleEntry
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="w-full text-left border border-line bg-panel hover:border-ember transition-colors p-4 flex items-center gap-4 group cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3 className="min-w-0 text-base group-hover:text-ember transition-colors">
            {r.title}
          </h3>
          {r.level && <LevelBadge level={r.level} />}
          {r.isNew && <NewTag />}
        </div>
        {r.excerpt && (
          <p className="text-sm text-fog mt-1.5 line-clamp-2">{r.excerpt}</p>
        )}
        {(r.category || r.theme) && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {r.category && (
              <span className="mono text-[10px] uppercase tracking-[0.1em] leading-snug px-2 py-[3px] border border-ember/40 text-ember">
                {r.category.name}
              </span>
            )}
            {r.theme && <ThemeTag name={r.theme.name} />}
          </div>
        )}
      </div>
      <span className="text-ember shrink-0 transition-transform group-hover:translate-x-1">
        →
      </span>
    </button>
  )
}
