export function NewTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={
        "mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-[2px] bg-ember text-ink font-700 leading-none whitespace-nowrap " +
        className
      }
    >
      Nouveau
    </span>
  )
}
