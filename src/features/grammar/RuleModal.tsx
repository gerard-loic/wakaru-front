import type { ReactNode } from "react"
import { Modal } from "@/components/Modal"
import { AiNotice } from "@/components/AiNotice"
import { RichText } from "@/components/RichText"
import { LevelBadge, ThemeTag } from "@/components/Badges"
import type { RuleEntry } from "@/features/grammar/ruleModel"

/** Popin de détail d'une règle de grammaire. Purement présentationnelle (voir `useRule`). */
export function RuleModal({
  rule,
  loading = false,
  error = null,
  onRetry,
  onClose,
}: {
  /** Règle à afficher, ou `null` pendant le chargement / en cas d'erreur. */
  rule: RuleEntry | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onClose: () => void
}) {
  if (!rule) {
    return (
      <Modal
        size="lg"
        title={
          <span className="display font-800 text-lg">
            {error ? "Règle indisponible" : "Chargement…"}
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
            <div className="h-4 w-full bg-ink/40 animate-pulse" />
            <div className="h-4 w-5/6 bg-ink/40 animate-pulse" />
            <div className="h-16 w-full bg-ink/40 animate-pulse" />
          </div>
        )}
      </Modal>
    )
  }

  const r = rule

  return (
    <Modal
      size="lg"
      title={
        <span className="block">
          {r.category && (
            <span className="block mono text-[10px] uppercase tracking-[0.16em] text-ember mb-1">
              {r.category.name}
            </span>
          )}
          <span className="display text-2xl font-900 tracking-tight leading-tight block">
            {r.title}
          </span>
        </span>
      }
      subtitle={r.level && <LevelBadge level={r.level} />}
      footer={<AiNotice />}
      onClose={onClose}
    >
      <div className="space-y-8">
        {r.description ? (
          <RichText text={r.description} />
        ) : (
          <p className="text-sm text-fog">Aucune explication pour le moment.</p>
        )}

        {r.theme && (
          <Section label="Thème">
            <div className="flex flex-wrap gap-1.5">
              <ThemeTag id={r.theme.id} name={r.theme.name} />
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
      <h3 className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">
        {label}
      </h3>
      {children}
    </section>
  )
}
