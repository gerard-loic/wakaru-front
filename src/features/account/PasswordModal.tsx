import { useState, type FormEvent } from "react"
import { Modal } from "@/components/Modal"
import { AuthError, Field, SubmitButton } from "@/features/auth/AuthLayout"
import { useUpdateAccount } from "@/features/account/useUpdateAccount"

const MIN_PASSWORD = 8

/** Popin de modification du mot de passe. */
export function PasswordModal({ onClose }: { onClose: () => void }) {
  const { pending, error, update, fail } = useUpdateAccount()
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (pending) return
    const data = new FormData(e.currentTarget)
    const field = (name: string) => String(data.get(name) ?? "")
    const password = field("password")

    if (password.length < MIN_PASSWORD) {
      return fail(
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`,
      )
    }
    if (password !== field("password_confirm")) {
      return fail("Les deux mots de passe ne correspondent pas.")
    }

    const ok = await update({
      password,
      current_password: field("current_password"),
    })
    if (ok) setDone(true)
  }

  return (
    <Modal
      title={<h2 className="display text-xl font-800">Mot de passe</h2>}
      subtitle={
        <span className="mono text-[11px] uppercase tracking-[0.2em] text-ember">
          パスワード
        </span>
      }
      onClose={onClose}
    >
      {done ? (
        <div className="max-w-sm mx-auto text-center">
          <p className="text-chalk">Ton mot de passe a bien été modifié.</p>
          <button
            type="button"
            onClick={onClose}
            className="mono text-sm uppercase tracking-[0.1em] w-full mt-8 py-3.5 bg-ember text-ink font-600 transition-all hover:bg-ember-soft"
          >
            Fermer
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="max-w-sm mx-auto">
          <div className="space-y-4">
            <Field
              name="current_password"
              label="Mot de passe actuel"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              required
            />
            <Field
              name="password"
              label="Nouveau mot de passe"
              placeholder="8 caractères minimum"
              type="password"
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
              required
            />
            <Field
              name="password_confirm"
              label="Confirmation du mot de passe"
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <AuthError message={error} />

          <SubmitButton pending={pending}>
            {pending ? "Enregistrement…" : "Modifier le mot de passe"}
          </SubmitButton>
        </form>
      )}
    </Modal>
  )
}
