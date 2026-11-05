import type { FormEvent } from "react"
import { Modal } from "@/components/Modal"
import { AuthError, Field, SubmitButton } from "@/features/auth/AuthLayout"
import { useUpdateAccount } from "@/features/account/useUpdateAccount"
import type { CurrentUser } from "@/layout/useCurrentUser"

/** Popin de modification des informations personnelles (prénom, nom, e-mail). */
export function ProfileModal({
  user,
  onSaved,
  onDeleteAccount,
  onClose,
}: {
  user: CurrentUser
  onSaved: () => void
  /** Ouvre la confirmation de suppression du compte. */
  onDeleteAccount: () => void
  onClose: () => void
}) {
  const { pending, error, update } = useUpdateAccount()

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (pending) return
    const data = new FormData(e.currentTarget)
    const field = (name: string) => String(data.get(name) ?? "").trim()
    const ok = await update({
      first_name: field("first_name"),
      last_name: field("last_name"),
      email: field("email"),
    })
    if (ok) {
      onSaved()
      onClose()
    }
  }

  return (
    <Modal
      title={
        <h2 className="display text-xl font-800">Informations personnelles</h2>
      }
      subtitle={
        <span className="mono text-[11px] uppercase tracking-[0.2em] text-ember">
          個人情報
        </span>
      }
      onClose={onClose}
    >
      <form onSubmit={submit} className="max-w-sm mx-auto">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              name="first_name"
              label="Prénom"
              placeholder="Haruki"
              autoComplete="given-name"
              defaultValue={user.firstName}
              required
            />
            <Field
              name="last_name"
              label="Nom"
              placeholder="Murakami"
              autoComplete="family-name"
              defaultValue={user.lastName}
              required
            />
          </div>
          <Field
            name="email"
            label="Adresse e-mail"
            placeholder="toi@exemple.jp"
            type="email"
            autoComplete="email"
            defaultValue={user.email}
            required
          />
        </div>

        <AuthError message={error} />

        <SubmitButton pending={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </SubmitButton>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onDeleteAccount}
            className="text-sm text-fog underline underline-offset-4 transition-colors hover:text-red-300"
          >
            Supprimer mon compte
          </button>
        </div>
      </form>
    </Modal>
  )
}
