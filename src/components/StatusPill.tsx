const STYLES = {
  done: {
    label: "Effectué",
    className: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10",
    dot: "#3fbf7f",
  },
  todo: {
    label: "À faire",
    className: "border-ember/50 text-ember bg-ember/10",
    dot: "#ff6a1a",
  },
  upcoming: {
    label: "À venir",
    className: "border-line text-fog bg-panel-2",
    dot: "var(--color-fog)",
  },
  missed: {
    label: "Non réalisé",
    className: "border-line text-fog bg-panel-2",
    dot: "var(--color-fog)",
  },
}

export function StatusPill({
  done,
  missed = false,
  upcoming = false,
}: {
  done: boolean
  /** Pas fait et plus faisable : remplace « À faire ». */
  missed?: boolean
  /** Pas encore faisable, son jour n'est pas arrivé : remplace « À faire ». */
  upcoming?: boolean
}) {
  const style =
    STYLES[done ? "done" : missed ? "missed" : upcoming ? "upcoming" : "todo"]
  return (
    <span
      className={
        "mono text-[10px] uppercase tracking-[0.08em] px-2.5 py-1 border flex items-center gap-1.5 shrink-0 " +
        style.className
      }
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: style.dot }}
      />
      {style.label}
    </span>
  )
}
