import { evolution } from "@/data"

export function EvolutionChart() {
  const max = Math.max(...evolution.map((e) => e.mastered))
  const min = Math.min(...evolution.map((e) => e.mastered))
  const first = evolution[0].mastered
  const last = evolution[evolution.length - 1].mastered
  const growth = last - first

  return (
    <div className="border border-line bg-panel p-6">
      <div className="flex items-end gap-6 mb-6">
        <div>
          <div className="display font-900 text-4xl leading-none">
            {last.toLocaleString("fr-FR")}
          </div>
          <div className="mono text-[11px] text-fog uppercase mt-1">
            mots maîtrisés
          </div>
        </div>
        <div className="mb-1 mono text-xs text-emerald-300">
          +{growth.toLocaleString("fr-FR")}{" "}
          <span className="text-fog">sur 8 semaines</span>
        </div>
      </div>

      {/* single-series bars — sequential single hue, 4px rounded data-ends on baseline */}
      <div className="flex items-end gap-2 sm:gap-3 h-40">
        {evolution.map((e, i) => {
          const h = ((e.mastered - min * 0.85) / (max - min * 0.85)) * 100
          const isLast = i === evolution.length - 1
          return (
            <div
              key={e.week}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
            >
              <span className="mono text-[10px] text-fog opacity-0 group-hover:opacity-100 transition-opacity">
                {e.mastered}
              </span>
              <div
                className="w-full rounded-t-[4px] transition-all"
                style={{
                  height: `${Math.max(6, h)}%`,
                  background: isLast
                    ? "var(--color-ember)"
                    : "var(--color-ember-dim)",
                }}
                title={`${e.week} · ${e.mastered} mots`}
              />
              <span
                className={
                  "mono text-[9px] " + (isLast ? "text-ember" : "text-fog")
                }
              >
                {e.week}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
