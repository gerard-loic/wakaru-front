import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useUnsubscribe } from "@/features/auth/useUnsubscribe"
import {
  ActionLink,
  AuthError,
  AuthLayout,
  SubmitButton,
} from "@/features/auth/AuthLayout"

/**
 * Page d'arrivée du lien de désinscription : `/desabonnement?token=…`.
 *
 * L'appel part d'un clic, jamais du chargement : les scanners de messagerie
 * ouvrent les liens des e-mails et certains exécutent le JavaScript, ce qui
 * désinscrirait l'utilisateur à son insu.
 */
export default function UnsubscribeScreen() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const { pending, error, unsubscribe } = useUnsubscribe()
  const [outcome, setOutcome] = useState<"done" | "invalid_token" | null>(null)

  const submit = async () => {
    if (pending || outcome) return
    const result = await unsubscribe(token)
    if (result !== "error") setOutcome(result)
  }

  const kicker = "配信停止 / Désinscription"

  if (outcome === "done") {
    return (
      <AuthLayout kicker={kicker} title="C'est fait." onSubmit={submit}>
        <p className="text-chalk">
          Tu ne recevras plus nos e-mails d'information. Tu peux les réactiver à
          tout moment depuis ton profil.
        </p>
        <ActionLink to="/login">Retour à Wakaru →</ActionLink>
      </AuthLayout>
    )
  }

  if (!token || outcome === "invalid_token") {
    return (
      <AuthLayout kicker={kicker} title="Lien invalide." onSubmit={submit}>
        <p className="text-chalk">
          Ce lien de désinscription est invalide. Tu peux aussi gérer l'envoi
          des e-mails depuis ton profil.
        </p>
        <ActionLink to="/login">Retour à Wakaru →</ActionLink>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout kicker={kicker} title={"Se désinscrire\u00a0?"} onSubmit={submit}>
      <p className="text-chalk">
        Tu ne recevras plus d'e-mail quand un nouveau thème est disponible. Les
        e-mails liés à ton compte, comme la réinitialisation du mot de passe,
        continueront d'être envoyés.
      </p>

      <AuthError message={error} />

      <SubmitButton pending={pending}>
        {pending ? "Désinscription…" : "Me désinscrire →"}
      </SubmitButton>
    </AuthLayout>
  )
}
