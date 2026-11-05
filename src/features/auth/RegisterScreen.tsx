import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile"
import { useRegister } from "@/features/auth/useRegister"
import {
  AuthError,
  AuthLayout,
  Field,
  MailingConsent,
  SubmitButton,
} from "@/features/auth/AuthLayout"

const MIN_PASSWORD = 8

export function RegisterScreen({ onEnter }: { onEnter: () => void }) {
  const { pending, error, register, fail } = useRegister()
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captcha = useRef<TurnstileHandle>(null)

  // Glue affichage -> exécution : valide localement puis délègue à `useRegister`.
  const submit = async (data: FormData) => {
    if (pending) return
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
    if (!captchaToken) {
      return fail("Valide le captcha avant de continuer.")
    }

    const ok = await register({
      email: field("email"),
      firstName: field("first_name"),
      lastName: field("last_name"),
      password,
      mailingAllowed: data.get("is_mailing_allowed") === "on",
      captchaToken,
    })
    if (ok) onEnter()
    // Jeton à usage unique : il faut un nouveau captcha avant de réessayer.
    else captcha.current?.reset()
  }

  return (
    <AuthLayout
      kicker="新規登録 / Inscription"
      title="Rejoins-nous."
      onSubmit={submit}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            name="first_name"
            label="Prénom"
            placeholder="Haruki"
            autoComplete="given-name"
            required
          />
          <Field
            name="last_name"
            label="Nom"
            placeholder="Murakami"
            autoComplete="family-name"
            required
          />
        </div>
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
        <label className="flex items-start gap-3 text-sm text-fog cursor-pointer">
          <input
            name="terms"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 accent-ember cursor-pointer"
          />
          <span>
            J'accepte les{" "}
            {/* Nouvel onglet : évite de perdre la saisie du formulaire. */}
            <Link
              to="/cgu"
              target="_blank"
              rel="noopener"
              className="text-ember hover:text-ember-soft underline underline-offset-4"
            >
              conditions générales d'utilisation
            </Link>
            .
          </span>
        </label>
        <MailingConsent />
        <Turnstile ref={captcha} onToken={setCaptchaToken} />
      </div>

      <AuthError message={error} />

      <SubmitButton pending={pending}>
        {pending ? "Création…" : "Créer mon compte →"}
      </SubmitButton>

      <p className="text-sm text-fog mt-8 text-center">
        Déjà inscrit ?{" "}
        <Link
          to="/login"
          className="text-ember hover:text-ember-soft underline underline-offset-4"
        >
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  )
}
