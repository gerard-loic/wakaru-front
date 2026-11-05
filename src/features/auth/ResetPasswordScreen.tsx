import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useResetPassword } from "@/features/auth/useResetPassword"
import {
  ActionLink,
  AuthError,
  AuthLayout,
  Field,
  SubmitButton,
} from "@/features/auth/AuthLayout"

const MIN_PASSWORD = 8

/** Page d'arrivée du lien reçu par e-mail : `/reset-password?token=…`. */
export default function ResetPasswordScreen() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const { pending, error, resetPassword, fail } = useResetPassword()
  const [outcome, setOutcome] = useState<"done" | "invalid_token" | null>(null)

  // Glue affichage -> exécution : valide localement puis délègue au hook.
  const submit = async (data: FormData) => {
    if (pending || outcome) return
    const password = String(data.get("password") ?? "")

    if (password.length < MIN_PASSWORD) {
      return fail(
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`,
      )
    }
    if (password !== String(data.get("password_confirm") ?? "")) {
      return fail("Les deux mots de passe ne correspondent pas.")
    }

    const result = await resetPassword(token, password)
    if (result !== "error") setOutcome(result)
  }

  const kicker = "パスワード / Nouveau mot de passe"

  if (outcome === "done") {
    return (
      <AuthLayout kicker={kicker} title="C'est fait." onSubmit={submit}>
        <p className="text-chalk">Ton mot de passe a bien été modifié.</p>
        <ActionLink to="/login">Se connecter →</ActionLink>
      </AuthLayout>
    )
  }

  if (!token || outcome === "invalid_token") {
    return (
      <AuthLayout kicker={kicker} title="Lien invalide." onSubmit={submit}>
        <p className="text-chalk">
          Ce lien de réinitialisation est invalide ou a expiré. Demande-en un
          nouveau pour redéfinir ton mot de passe.
        </p>
        <ActionLink to="/forgot-password">Demander un nouveau lien →</ActionLink>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout kicker={kicker} title="Choisis ton mot de passe." onSubmit={submit}>
      <div className="space-y-4">
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
        {pending ? "Enregistrement…" : "Enregistrer →"}
      </SubmitButton>
    </AuthLayout>
  )
}
