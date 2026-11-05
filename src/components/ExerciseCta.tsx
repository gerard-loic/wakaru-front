export function ExerciseCta({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mono text-[11px] uppercase tracking-[0.08em] px-3 py-2.5 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
    >
      <span className="jp text-sm leading-none">練</span>
      M'exercer
    </button>
  )
}
