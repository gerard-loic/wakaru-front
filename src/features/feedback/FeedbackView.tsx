import { useState, type FormEvent } from "react"
import { SectionHead } from "@/components/SectionHead"
import { AuthError, SubmitButton } from "@/features/auth/AuthLayout"
import {
  useSendFeedback,
  type FeedbackType,
} from "@/features/feedback/useSendFeedback"

const SUBJECTS: { value: FeedbackType; label: string }[] = [
  { value: "bug", label: "Signaler un dysfonctionnement" },
  { value: "remark", label: "Proposer une évolution" },
  { value: "comment", label: "Faire un commentaire" },
]

const LABEL_CLASS = "mono text-[10px] uppercase tracking-[0.12em] text-fog"
const INPUT_CLASS =
  "mt-1.5 w-full bg-panel border border-line px-3.5 py-3 text-chalk placeholder:text-fog/50 outline-none focus:border-ember transition-colors"

export default function FeedbackView() {
  const { pending, error, send } = useSendFeedback()
  const [type, setType] = useState<FeedbackType | "">("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = message.trim()
    if (pending || !type || !text) return
    setSent(false)
    if (await send(type, text)) {
      setType("")
      setMessage("")
      setSent(true)
    }
  }

  return (
    <div>
      <SectionHead title="Feedback" jp="ご意見" />
      <div className="max-w-xl">
        <p className="text-fog leading-relaxed mb-8">
          Wakaru évolue grâce à celles et ceux qui l'utilisent. Un
          dysfonctionnement à signaler, une idée d'évolution ou simplement un
          commentaire à partager ? Écris-nous ici : chaque message est lu avec
          attention.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className={LABEL_CLASS}>Sujet</span>
            <span className="relative block">
              <select
                name="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as FeedbackType | "")
                  setSent(false)
                }}
                required
                className={
                  INPUT_CLASS +
                  " appearance-none pr-9 cursor-pointer [&>option]:bg-panel [&>option]:text-chalk"
                }
              >
                <option value="" disabled>
                  Choisir un sujet
                </option>
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-fog"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </label>

          <label className="block">
            <span className={LABEL_CLASS}>Message</span>
            <textarea
              name="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setSent(false)
              }}
              placeholder="Décris ce que tu as constaté ou ce que tu aimerais voir…"
              rows={7}
              required
              className={INPUT_CLASS + " block resize-y"}
            />
          </label>

          <AuthError message={error} />

          <SubmitButton pending={pending}>
            {pending ? "Envoi…" : "Envoyer"}
          </SubmitButton>

          {sent && (
            <p
              role="status"
              className="mono text-xs text-chalk border border-line-bright bg-line/40 px-3 py-2"
            >
              Merci ! Ton message a bien été envoyé.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
