import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { sylo } from "@/lib/sylo"
import { useResume } from "@/features/auth/useResume"
import {
  ActionLink,
  AuthError,
  AuthLayout,
  SubmitButton,
} from "@/features/auth/AuthLayout"

/**
 * Page d'arrivée du lien « Je me remets au japonais » de l'annonce d'un thème,
 * envoyée aux utilisateurs en mode vacances : `/reprise?token=…`.
 *
 * L'appel part d'un clic, jamais du chargement : les scanners de messagerie
 * ouvrent les liens des e-mails et certains exécutent le JavaScript, ce qui
 * sortirait l'utilisateur du mode vacances à son insu.
 */
export default function ResumeScreen() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const navigate = useNavigate()
  const { pending, error, resume } = useResume()
  const [outcome, setOutcome] = useState<
    { status: "done"; themeId: number } | { status: "invalid_token" } | null
  >(null)

  const submit = async () => {
    if (pending || outcome) return
    const result = await resume(token)
    if (result.status === "error") return
    // Déjà connecté : on file directement sur le thème.
    if (result.status === "done" && sylo.isAuthenticated) {
      navigate(`/themes/${result.themeId}`, { replace: true })
      return
    }
    setOutcome(result)
  }

  const kicker = "再開 / Reprise"

  if (outcome?.status === "done") {
    return (
      <AuthLayout kicker={kicker} title="C'est reparti." onSubmit={submit}>
        <p className="text-chalk">
          Tu n'es plus en mode vacances et le thème a été ajouté à ton
          programme. Connecte-toi pour l'explorer.
        </p>
        <ActionLink to={`/themes/${outcome.themeId}`}>
          Explorer le thème →
        </ActionLink>
      </AuthLayout>
    )
  }

  if (!token || outcome?.status === "invalid_token") {
    return (
      <AuthLayout kicker={kicker} title="Lien invalide." onSubmit={submit}>
        <p className="text-chalk">
          Ce lien est invalide. Tu peux aussi quitter le mode vacances depuis
          ton profil.
        </p>
        <ActionLink to="/login">Retour à Wakaru →</ActionLink>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      kicker={kicker}
      title={"On s'y remet ?"}
      onSubmit={submit}
    >
      <p className="text-chalk">
        Ton compte va quitter le mode vacances : le thème annoncé sera ajouté à
        ton programme, ainsi que les prochains thèmes.
      </p>

      <AuthError message={error} />

      <SubmitButton pending={pending}>
        {pending ? "Reprise…" : "Je me remets au japonais →"}
      </SubmitButton>
    </AuthLayout>
  )
}
