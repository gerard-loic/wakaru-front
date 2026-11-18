/** Étiquette signalant une fonctionnalité expérimentale. */
export default function ExperimentalTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={
        "mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-[2px] border border-ember/60 text-ember font-700 leading-none whitespace-nowrap " +
        className
      }
    >
      Expérimental
    </span>
  )
}
