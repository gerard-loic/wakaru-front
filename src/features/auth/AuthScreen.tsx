import { Link } from "react-router-dom"
import { useLogin } from "@/features/auth/useLogin"
import {
  AuthError,
  AuthLayout,
  Field,
  SubmitButton,
} from "@/features/auth/AuthLayout"

export function AuthScreen({ onEnter }: { onEnter: () => void }) {
  const { pending, error, login } = useLogin()

  // Glue affichage -> exécution : extrait les champs et délègue à `useLogin`.
  const submit = async (data: FormData) => {
    if (pending) return
    const email = String(data.get("email") ?? "")
    const password = String(data.get("password") ?? "")
    if (await login(email, password)) onEnter()
  }

  return (
    <AuthLayout
      kicker="ログイン / Connexion"
      title="Bon retour."
      onSubmit={submit}
    >
      <div className="space-y-4">
        <Field
          name="email"
          label="Adresse e-mail"
          placeholder="toi@exemple.jp"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          name="password"
          label="Mot de passe"
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
          required
        />
        <p className="text-sm text-right">
          <Link
            to="/forgot-password"
            className="text-ember hover:text-ember-soft underline underline-offset-4"
          >
            Mot de passe oublié ?
          </Link>
        </p>
      </div>

      <AuthError message={error} />

      <SubmitButton pending={pending}>
        {pending ? "Connexion…" : "Entrer →"}
      </SubmitButton>

      <p className="text-sm text-fog mt-8 text-center">
        Pas encore de compte ?{" "}
        <Link
          to="/register"
          className="text-ember hover:text-ember-soft underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  )
}
