export function BackBar({
  onBack,
  label,
}: {
  onBack: () => void
  label: string
}) {
  return (
    <button
      onClick={onBack}
      className="mono text-[11px] uppercase tracking-[0.12em] text-fog hover:text-ember transition-colors mb-6 flex items-center gap-2"
    >
      ← Retour · {label}
    </button>
  )
}
