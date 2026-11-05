import { useState } from "react"
import { Modal } from "@/components/Modal"
import { AuthError } from "@/features/auth/AuthLayout"
import { useDeleteAccount } from "@/features/account/useDeleteAccount"

/**
 * Popin de confirmation de la suppression du compte. Une fois le compte
 * supprimé, sa fermeture appelle `onDeleted` : le token n'est plus valide.
 */
export function DeleteAccountModal({
  onDeleted,
  onClose,
}: {
  onDeleted: () => void
  onClose: () => void
}) {
  const { pending, error, remove } = useDeleteAccount()
  const [done, setDone] = useState(false)

  const confirm = async () => {
    if (pending) return
    if (await remove()) setDone(true)
  }

  // Pendant l'appel, on garde la popin ouverte pour afficher le résultat.
  const close = () => {
    if (pending) return
    if (done) onDeleted()
    else onClose()
  }

  return (
    <Modal
      title={<h2 className="display text-xl font-800">Supprimer mon compte</h2>}
      subtitle={
        <span className="mono text-[11px] uppercase tracking-[0.2em] text-ember">
          アカウント削除
        </span>
      }
      onClose={close}
    >
      {done ? (
        <div className="max-w-sm mx-auto text-center">
          <p className="text-chalk">
            Ton compte et tes données personnelles ont bien été supprimés.
          </p>
          <button
            type="button"
            onClick={close}
            className="mono text-sm uppercase tracking-[0.1em] w-full mt-8 py-3.5 bg-ember text-ink font-600 transition-all hover:bg-ember-soft"
          >
            Fermer
          </button>
        </div>
      ) : (
        <div className="max-w-sm mx-auto">
          <p className="text-chalk">
            Tu es sur le point de supprimer ton compte. Toutes tes données
            personnelles seront supprimées.
          </p>
          <p className="text-fog text-sm mt-3">
            Cette action est définitive : tu ne pourras plus te connecter ni
            retrouver ta progression.
          </p>

          <AuthError message={error} />

          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="mono text-sm uppercase tracking-[0.1em] w-full mt-8 py-3.5 border border-red-500 text-red-300 font-600 transition-all hover:bg-red-500/10 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {pending ? "Suppression…" : "Supprimer définitivement"}
          </button>
          <button
            type="button"
            onClick={close}
            disabled={pending}
            className="mono text-sm uppercase tracking-[0.1em] w-full mt-3 py-3.5 border border-line text-fog transition-colors hover:border-ember hover:text-ember disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        </div>
      )}
    </Modal>
  )
}
