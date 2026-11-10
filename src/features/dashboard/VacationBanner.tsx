import { useUpdateAccount } from "@/features/account/useUpdateAccount"

/**
 * Bandeau du tableau de bord affiché en mode vacances : rappelle que les
 * nouveaux thèmes ne sont plus attribués et permet de repasser en mode actif.
 */
export default function VacationBanner({
  onResumed,
}: {
  /** Appelé une fois le mode vacances désactivé (recharger l'utilisateur…). */
  onResumed: () => void
}) {
  const { pending, error, update } = useUpdateAccount()

  const resume = async () => {
    if (pending) return
    if (await update({ is_onvacation: false })) onResumed()
  }

  return (
    <section
      role="status"
      className="mb-8 bg-ember text-ink p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
    >
      <span
        aria-hidden
        className="shrink-0 w-14 h-14 grid place-items-center bg-ink/10 border-2 border-ink/80"
      >
        <IconParasol />
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="display text-xl sm:text-2xl font-900 leading-tight">
          Ton japonais t'attend !
        </h2>
        <p className="text-sm mt-1 font-500">
          Tu es en mode vacances : les nouveaux thèmes passent sans toi. Quelques
          minutes par jour suffisent pour garder le rythme et voir tes progrès
          s'envoler. Reprends quand tu veux, d'un seul clic.
        </p>
        {error && <p className="mono text-xs mt-2 font-600">{error}</p>}
      </div>
      <button
        type="button"
        onClick={resume}
        disabled={pending}
        className="mono text-xs uppercase tracking-[0.1em] font-700 px-4 py-3 bg-ink text-ember hover:bg-panel transition-colors shrink-0 disabled:opacity-60 disabled:cursor-wait"
      >
        {pending ? "Activation…" : "Je reprends l'aventure"}
      </button>
    </section>
  )
}

function IconParasol() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Toile */}
      <path d="M3 11a9 9 0 0 1 18 0z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 2c-2.5 2.5-3.5 5.5-3.5 9M12 2c2.5 2.5 3.5 5.5 3.5 9" />
      {/* Mât */}
      <path d="M12 11v9" />
      {/* Sable */}
      <path d="M4 21c2.5-1.3 5.2-2 8-2s5.5.7 8 2" />
    </svg>
  )
}
