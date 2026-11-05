import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile"
import { useForgotPassword } from "@/features/auth/useForgotPassword"
import {
  AuthError,
  AuthLayout,
  Field,
  SubmitButton,
} from "@/features/auth/AuthLayout"

export default function ForgotPasswordScreen() {
  const { pending, error, requestReset, fail } = useForgotPassword()
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const captcha = useRef<TurnstileHandle>(null)

  // Glue affichage -> exécution : valide localement puis délègue au hook.
  const submit = async (data: FormData) => {
    if (pending || sent) return
    if (!captchaToken) {
      return fail("Valide le captcha avant de continuer.")
    }

    const ok = await requestReset(String(data.get("email") ?? ""), captchaToken)
    if (ok) setSent(true)
    // Jeton à usage unique : il faut un nouveau captcha avant de réessayer.
    else captcha.current?.reset()
  }

  return (
    <AuthLayout
      kicker="パスワード / Mot de passe oublié"
      title={sent ? "Regarde tes e-mails." : "Mot de passe oublié ?"}
      onSubmit={submit}
    >
      {sent ? (
        // Formulation neutre : l'API ne révèle pas si le compte existe.
        <p className="text-chalk">
          Si un compte existe avec cette adresse, tu vas recevoir un e-mail
          contenant un lien pour redéfinir ton mot de passe.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            <p className="text-sm text-fog">
              Indique ton adresse e-mail : nous t'enverrons un lien pour
              redéfinir ton mot de passe.
            </p>
            <Field
              name="email"
              label="Adresse e-mail"
              placeholder="toi@exemple.jp"
              type="email"
              autoComplete="email"
              required
            />
            <Turnstile ref={captcha} onToken={setCaptchaToken} />
          </div>

          <AuthError message={error} />

          <SubmitButton pending={pending}>
            {pending ? "Envoi…" : "Envoyer le lien →"}
          </SubmitButton>
        </>
      )}

      <p className="text-sm text-fog mt-8 text-center">
        <Link
          to="/login"
          className="text-ember hover:text-ember-soft underline underline-offset-4"
        >
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  )
}
