import { useId, useState, type KeyboardEvent, type ReactNode } from "react"
import { MASTERY_META } from "@/lib/mastery"
import { Modal } from "@/components/Modal"
import { AiNotice } from "@/components/AiNotice"
import { MasteryDot } from "@/components/Mastery"
import { LevelBadge, ThemeTag } from "@/components/Badges"
import { WordComposition } from "@/features/vocab/WordComposition"
import WordConjugation from "@/features/vocab/WordConjugation"
import {
  wordDotLevel,
  type ConjugationForm,
  type VocabWord,
  type WordSegment,
} from "@/features/vocab/wordModel"

type WordTab = "detail" | "conjugation"

const WORD_TABS: { key: WordTab; label: string }[] = [
  { key: "detail", label: "Détail" },
  { key: "conjugation", label: "Conjugaison" },
]

/**
 * Popin de détail d'un mot. Purement présentationnelle (voir `useWord`).
 * Les verbes ont deux onglets : détail et conjugaison.
 */
export function WordModal({
  word,
  composition = [],
  conjugation = [],
  loading = false,
  error = null,
  onRetry,
  onOpenKanji,
  onClose,
}: {
  /** Mot à afficher, ou `null` pendant le chargement / en cas d'erreur. */
  word: VocabWord | null
  /** Segments du mot (voir `WordComposition`). */
  composition?: WordSegment[]
  /** Tableau de conjugaison, vide hors verbes (voir `WordConjugation`). */
  conjugation?: ConjugationForm[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  /** Ouvre le détail d'un kanji de la composition. */
  onOpenKanji: (id: number) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<WordTab>("detail")
  const tabsId = useId()

  if (!word) {
    return (
      <Modal
        title={
          <span className="display font-800 text-lg">
            {error ? "Mot indisponible" : "Chargement…"}
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
            <div className="h-5 w-2/3 bg-ink/40 animate-pulse" />
            <div className="h-4 w-full bg-ink/40 animate-pulse" />
            <div className="h-4 w-5/6 bg-ink/40 animate-pulse" />
          </div>
        )}
      </Modal>
    )
  }

  const w = word
  const dot = wordDotLevel(w)
  const hasReading = w.reading !== "" && w.reading !== w.writing
  // Un mot tout en kana n'a rien à décomposer.
  const showComposition = composition.some((s) => s.kind !== "kana")
  const [mainMeaning, ...otherMeanings] = w.translations
  const hasTabs = conjugation.length > 0
  const panelId = `${tabsId}-panel`

  return (
    <Modal
      // Le tableau de conjugaison a besoin de la largeur : 4 colonnes de formes
      // longues. Fixée pour le mot, elle ne saute pas d'un onglet à l'autre.
      size={hasTabs ? "xl" : "lg"}
      title={
        <span className="display text-2xl font-900 tracking-tight first-letter:uppercase block">
          {mainMeaning || w.writing}
        </span>
      }
      subtitle={
        <span className="flex items-center gap-2.5 flex-wrap">
          {dot && (
            <span className="flex items-center gap-1.5">
              <MasteryDot level={dot} />
              <span className="mono text-[10px] uppercase tracking-[0.1em] text-fog">
                {MASTERY_META[dot].label}
              </span>
            </span>
          )}
          {w.level && <LevelBadge level={w.level} />}
        </span>
      }
      footer={<AiNotice />}
      onClose={onClose}
    >
      {hasTabs && (
        <WordTabs
          id={tabsId}
          panelId={panelId}
          active={tab}
          onChange={setTab}
        />
      )}
      <div
        id={hasTabs ? panelId : undefined}
        role={hasTabs ? "tabpanel" : undefined}
        aria-labelledby={hasTabs ? `${tabsId}-${tab}` : undefined}
      >
        {hasTabs && tab === "conjugation" ? (
          <WordConjugation forms={conjugation} dictionary={w.writing} />
        ) : (
            <div className="grid sm:grid-cols-[minmax(0,14rem)_1fr] gap-6">
              {/* Fiche : le mot et ses caractéristiques. */}
              <aside className="space-y-4 self-start">
                <div className="border border-line bg-ink/30 px-4 py-6 text-center">
                  {hasReading && (
                    <div className="jp text-sm text-fog mb-2">{w.reading}</div>
                  )}
                  <div className="jp text-5xl leading-tight text-chalk break-words">
                    {w.writing}
                  </div>
                </div>

                <dl className="border border-line divide-y divide-line">
                  {w.partOfSpeech && (
                    <Fact label="Nature">
                      <div className="text-sm">{w.partOfSpeech.caption}</div>
                      {w.partOfSpeech.name !== w.partOfSpeech.caption && (
                        <div className="text-xs text-fog mt-0.5">
                          {w.partOfSpeech.name}
                        </div>
                      )}
                    </Fact>
                  )}
                  {w.level && (
                    <Fact label="Niveau">
                      <span className="text-sm">JLPT {w.level}</span>
                    </Fact>
                  )}
                  {w.themes.length > 0 && (
                    <Fact label={w.themes.length > 1 ? "Thèmes" : "Thème"}>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {w.themes.map((t) => (
                          <ThemeTag key={t.id} id={t.id} name={t.name} />
                        ))}
                      </div>
                    </Fact>
                  )}
                </dl>
              </aside>

              {/* Contenu : sens, explication, composition, exemples. */}
              <div className="space-y-6 min-w-0">
                {w.translations.length > 0 && (
                  <Section label={w.translations.length > 1 ? "Traductions" : "Traduction"}>
                    <p className="text-lg">
                      {mainMeaning}
                      {otherMeanings.length > 0 && (
                        <span className="text-fog">, {otherMeanings.join(", ")}</span>
                      )}
                    </p>
                  </Section>
                )}

                {w.description && (
                  <Section label="Explication">
                    <p className="text-sm text-chalk/90 leading-relaxed">
                      {w.description}
                    </p>
                  </Section>
                )}

                {showComposition && (
                  <Section label="Composition">
                    <WordComposition
                      segments={composition}
                      writing={w.writing}
                      reading={w.reading}
                      onOpenKanji={onOpenKanji}
                    />
                  </Section>
                )}

                {w.examples.length > 0 && (
                  <Section label={w.examples.length > 1 ? "Exemples" : "Exemple"}>
                    <ul className="space-y-3">
                      {w.examples.map((ex) => (
                        <li key={ex.text} className="border-l-2 border-ember/60 pl-3">
                          <div className="jp text-base">{ex.text}</div>
                          <div className="text-sm text-fog">{ex.translation}</div>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>
            </div>
        )}
      </div>
    </Modal>
  )
}

/** Barre d'onglets : clic, ou flèches gauche / droite une fois le focus dessus. */
function WordTabs({
  id,
  panelId,
  active,
  onChange,
}: {
  id: string
  panelId: string
  active: WordTab
  onChange: (tab: WordTab) => void
}) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    const step = e.key === "ArrowRight" ? 1 : -1
    const index = WORD_TABS.findIndex((t) => t.key === active)
    const next = WORD_TABS[(index + step + WORD_TABS.length) % WORD_TABS.length]
    onChange(next.key)
    document.getElementById(`${id}-${next.key}`)?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Sections du mot"
      onKeyDown={onKeyDown}
      className="flex flex-wrap gap-1 border-b border-line mb-6"
    >
      {WORD_TABS.map((t) => (
        <button
          key={t.key}
          id={`${id}-${t.key}`}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          aria-controls={panelId}
          tabIndex={active === t.key ? 0 : -1}
          onClick={() => onChange(t.key)}
          className={
            "mono text-xs uppercase tracking-[0.08em] px-4 py-3 border-b-2 -mb-px transition-colors " +
            (active === t.key
              ? "border-ember text-ember"
              : "border-transparent text-fog hover:text-chalk")
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/** Ligne de la fiche : libellé au-dessus, valeur en dessous. */
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-4 py-3">
      <dt className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-1">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">
        {label}
      </h3>
      {children}
    </section>
  )
}
