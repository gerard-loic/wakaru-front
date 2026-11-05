import { STATUS } from "./status"
import type { StatPanel } from "./statPanels"

export function StatCard({ s }: { s: StatPanel }) {
  const rest = Math.max(0, s.total - s.known - s.learning - s.hard)
  const segs = [
    { k: "known" as const, v: s.known },
    { k: "learning" as const, v: s.learning },
    { k: "hard" as const, v: s.hard },
    { k: "rest" as const, v: rest },
  ]
  const pct = s.total ? Math.round((s.known / s.total) * 100) : 0
  return (
    <div className="border border-line bg-panel p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="jp text-2xl text-fog">{s.jp}</span>
          <div>
            <div className="text-base leading-tight">{s.label}</div>
            <div className="mono text-[11px] text-fog">{s.total} au total</div>
          </div>
        </div>
        <div className="text-right">
          <div className="display font-900 text-3xl leading-none text-ember">
            {pct}%
          </div>
          <div className="mono text-[10px] text-fog uppercase">maîtrisé</div>
        </div>
      </div>

      {/* proportion bar — 2px surface gap between segments */}
      <div className="flex gap-[2px] h-3 mb-3">
        {segs.map(
          (seg) =>
            seg.v > 0 && (
              <div
                key={seg.k}
                title={`${STATUS[seg.k].label} · ${seg.v}`}
                style={{
                  width: `${(seg.v / s.total) * 100}%`,
                  background: STATUS[seg.k].color,
                }}
              />
            ),
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {segs.map((seg) => (
          <div key={seg.k}>
            <div
              className="mono text-sm"
              style={{ color: STATUS[seg.k].color }}
            >
              {seg.v}
            </div>
            <div className="mono text-[9px] uppercase tracking-[0.06em] text-fog leading-tight">
              {STATUS[seg.k].label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
