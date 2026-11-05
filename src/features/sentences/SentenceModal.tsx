import type { ReactNode } from "react"
import { MASTERY_META } from "@/lib/mastery"
import { Modal } from "@/components/Modal"
import { AiNotice } from "@/components/AiNotice"
import { MasteryDot } from "@/components/Mastery"
import { LevelBadge, ThemeTag } from "@/components/Badges"
import { SentenceAnalysis } from "@/features/sentences/SentenceAnalysis"
import type { SentenceDetail } from "@/features/sentences/useSentence"

/** Popin de détail d'une phrase. Purement présentationnelle (voir `useSentence`). */
export function SentenceModal({
  detail,
  loading = false,
  error = null,
  onRetry,
  onOpenWord,
  onClose,
}: {
  /** Phrase à afficher, ou `null` pendant le chargement / en cas d'erreur. */
  detail: SentenceDetail | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  /** Ouvre le détail d'un mot de la phrase. */
  onOpenWord: (id: number) => void
  onClose: () => void
}) {
  if (!detail) {
    return (
      <Modal
        size="lg"
        title={
          <span className="display font-800 text-lg">
            {error ? "Phrase indisponible" : "Chargement…"}
          </span>
        }
        onClose={onClose}
      >
        {error ? (
          <div
            role="alert"
            className="border border-ember/40 bg-ember/5 px-4 py-6 flex flex-col items-center gap-3 text-center"
          >
            <p className="mono text-xs text-ember">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mono text-xs uppercase tracking-[0.1em] text-ember hover:text-ember-soft underline underline-offset-4"
              >
                Réessayer
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3" aria-busy={loading}>
            <div className="h-8 w-3/4 bg-ink/40 animate-pulse" />
            <div className="h-4 w-1/2 bg-ink/40 animate-pulse" />
            <div className="h-24 w-full bg-ink/40 animate-pulse" />
          </div>
        )}
      </Modal>
    )
  }

  const { sentence: s, tokens } = detail
  const analysed = tokens.some((t) => !t.punctuation)

  return (
    <Modal
      size="lg"
      title={
        <span className="block mono text-[10px] uppercase tracking-[0.16em] text-ember">
          Phrase · 例文
        </span>
      }
      subtitle={
        <span className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1.5">
            <MasteryDot level={s.mastery} />
            <span className="mono text-[10px] uppercase tracking-[0.1em] text-fog">
              {MASTERY_META[s.mastery].label}
            </span>
          </span>
          {s.level && <LevelBadge level={s.level} />}
        </span>
      }
      footer={<AiNotice />}
      onClose={onClose}
    >
      <div className="space-y-8">
        <div>
          <p className="jp text-3xl leading-relaxed">{s.text}</p>
          <p className="text-base text-chalk/80 mt-2">{s.translation}</p>
        </div>

        {analysed && (
          <Section label="Analyse de la phrase">
            <SentenceAnalysis tokens={tokens} onOpenWord={onOpenWord} />
          </Section>
        )}

        {s.theme && (
          <Section label="Thème">
            <div className="flex flex-wrap gap-1.5">
              <ThemeTag id={s.theme.id} name={s.theme.name} />
            </div>
          </Section>
        )}
      </div>
    </Modal>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-5">
      <h3 className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-4">
        {label}
      </h3>
      {children}
    </section>
  )
}
