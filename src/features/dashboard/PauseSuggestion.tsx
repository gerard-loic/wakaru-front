import { useUpdateAccount } from "@/features/account/useUpdateAccount"

/**
 * Bloc discret du bas du tableau de bord : propose de passer en mode vacances
 * quand le rythme des thèmes est trop soutenu.
 */
export default function PauseSuggestion({
  onPaused,
}: {
  /** Appelé une fois le mode vacances activé (recharger l'utilisateur…). */
  onPaused: () => void
}) {
  const { pending, error, update } = useUpdateAccount()

  const pause = async () => {
    if (pending) return
    if (await update({ is_onvacation: true })) onPaused()
  }

  return (
    <section className="mt-10 border border-line bg-panel p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <span
        aria-hidden
        className="jp shrink-0 w-12 h-12 grid place-items-center border border-line-bright text-fog text-xl"
      >
        休
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="display text-lg font-800 leading-tight">
          Besoin de souffler ?
        </h2>
        <p className="text-sm text-fog mt-1">
          Si les leçons s'enchaînent trop vite, fais une pause sans culpabiliser.
          En mode vacances, tu ne reçois plus de nouveaux thèmes et tu peux
          réviser à ton rythme. Tu reviendras quand tu seras prêt.
        </p>
        {error && <p className="mono text-xs text-ember mt-2">{error}</p>}
      </div>
      <button
        type="button"
        onClick={pause}
        disabled={pending}
        className="mono text-[11px] uppercase tracking-[0.1em] font-600 px-4 py-2.5 border border-line-bright text-chalk hover:border-fog transition-colors shrink-0 disabled:opacity-60 disabled:cursor-wait"
      >
        {pending ? "Activation…" : "Passer en mode vacances"}
      </button>
    </section>
  )
}
