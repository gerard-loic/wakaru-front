import { useState, type FormEvent, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/Logo"
import { AboutModal } from "@/layout/AboutModal"
import { ChangelogModal } from "@/layout/ChangelogModal"
import { CURRENT_RELEASE } from "@/lib/changelog"

/**
 * Coquille commune aux écrans d'authentification (connexion, inscription) :
 * panneau de marque à gauche, formulaire à droite.
 */
export function AuthLayout({
  kicker,
  title,
  onSubmit,
  children,
}: {
  kicker: string
  title: string
  onSubmit: (data: FormData) => void
  children: ReactNode
}) {
  const [aboutOpen, setAboutOpen] = useState(false)
  const openAbout = () => setAboutOpen(true)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const openChangelog = () => setChangelogOpen(true)

  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-wakaru overflow-hidden">
        <div
          className="absolute -right-10 bottom-[-4rem] jp text-ink/10 leading-none select-none pointer-events-none"
          style={{ fontSize: "26rem" }}
        >
          分
        </div>
        <div className="relative jp text-ink/70 text-sm tracking-[0.28em] uppercase">
          分かる・日本語
        </div>

        <div className="relative flex flex-col items-center text-center my-auto">
          <Logo size="xl" className="text-ink" />
          <div className="jp text-ink text-2xl mt-6 mb-3">
            言葉は世界への扉。
          </div>
          <h2 className="display text-ink text-4xl font-900 leading-[0.95] tracking-tight max-w-md text-balance">
            Apprendre le japonais au fil des saisons
          </h2>
          <button
            type="button"
            onClick={openAbout}
            className="mt-8 px-5 py-2.5 border-2 border-ink text-sm font-600 text-ink hover:bg-ink hover:text-wakaru transition-colors"
          >
            En savoir plus sur Wakaru →
          </button>
        </div>

        <div className="relative mono text-[11px] text-ink/70 tracking-[0.1em]">
          v{CURRENT_RELEASE.version} ·{" "}
          <button
            type="button"
            onClick={openChangelog}
            className="underline underline-offset-4 hover:text-ink"
          >
            Quoi de neuf ?
          </button>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            onSubmit(new FormData(e.currentTarget))
          }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden mb-8">
            <Logo size="lg" />
            <button
              type="button"
              onClick={openAbout}
              className="block mt-3 text-sm text-ember hover:text-ember-soft underline underline-offset-4"
            >
              En savoir plus sur Wakaru
            </button>
            <div className="mt-1 mono text-[11px] text-fog">
              v{CURRENT_RELEASE.version} ·{" "}
              <button
                type="button"
                onClick={openChangelog}
                className="underline underline-offset-4 hover:text-chalk"
              >
                Quoi de neuf ?
              </button>
            </div>
          </div>
          <div className="mono text-[11px] uppercase tracking-[0.2em] text-ember mb-2">
            {kicker}
          </div>
          <h1 className="display text-3xl font-800 mb-8">{title}</h1>
          {children}
        </form>
      </div>

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      {changelogOpen && (
        <ChangelogModal onClose={() => setChangelogOpen(false)} />
      )}
    </div>
  )
}

export function Field({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  autoComplete,
  minLength,
  defaultValue,
}: {
  name: string
  label: string
  placeholder: string
  type?: string
  required?: boolean
  autoComplete?: string
  minLength?: number
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="mono text-[10px] uppercase tracking-[0.12em] text-fog">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        defaultValue={defaultValue}
        className="mt-1.5 w-full bg-panel border border-line px-3.5 py-3 text-chalk placeholder:text-fog/50 outline-none focus:border-ember transition-colors"
      />
    </label>
  )
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="mono text-xs text-ember mt-4 border border-ember/40 bg-ember/5 px-3 py-2"
    >
      {message}
    </p>
  )
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean
  children: ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mono text-sm uppercase tracking-[0.1em] w-full mt-8 py-3.5 bg-ember text-ink font-600 transition-all hover:bg-ember-soft active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {children}
    </button>
  )
}

/** Lien présenté comme le bouton principal des écrans d'authentification. */
export function ActionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="mono text-sm uppercase tracking-[0.1em] block text-center w-full mt-8 py-3.5 bg-ember text-ink font-600 transition-all hover:bg-ember-soft"
    >
      {children}
    </Link>
  )
}

/**
 * Consentement à l'envoi d'e-mails (`is_mailing_allowed`), à lire dans le
 * formulaire avec `data.get("is_mailing_allowed") === "on"`. Facultatif et
 * décoché par défaut : le consentement doit rester un geste volontaire.
 */
export function MailingConsent({
  defaultChecked = false,
}: {
  defaultChecked?: boolean
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-fog cursor-pointer">
      <input
        name="is_mailing_allowed"
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 accent-ember cursor-pointer"
      />
      <span>
        J'accepte de recevoir des e-mails de Wakaru, notamment quand un nouveau
        thème est disponible.
      </span>
    </label>
  )
}

/**
 * Mode vacances (`is_onvacation`), à lire dans le formulaire avec
 * `data.get("is_onvacation") === "on"`.
 */
export function VacationMode({
  defaultChecked = false,
}: {
  defaultChecked?: boolean
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-fog cursor-pointer">
      <input
        name="is_onvacation"
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 accent-ember cursor-pointer"
      />
      <span>
        Mode vacances (vous ne recevrez plus les nouveaux contenus et thèmes
        ajoutés)
      </span>
    </label>
  )
}
