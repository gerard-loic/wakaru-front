/** Bouton « Faire » d'une tâche du programme. */
export default function RunTaskButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mono text-[11px] uppercase tracking-[0.08em] px-3 py-2 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors flex items-center gap-1.5 shrink-0"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      Faire
    </button>
  )
}
