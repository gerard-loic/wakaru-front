import { useState } from "react"
import { FilterChip } from "@/components/FilterChip"
import type {
  ConjugatedVerb,
  ConjugationForm,
  ConjugationPolarity,
} from "@/features/vocab/wordModel"

type Register = "plain" | "polite"

const REGISTERS: { key: Register; label: string }[] = [
  { key: "plain", label: "Neutre" },
  { key: "polite", label: "Poli" },
]

/** Formes regroupées par usage ; un `uid` inconnu tombe dans `OTHER_GROUP`. */
const GROUPS: { label: string; uids: string[] }[] = [
  { label: "Temps", uids: ["present", "past"] },
  { label: "Enchaîner et demander", uids: ["te", "imperative", "volitional"] },
  { label: "Condition", uids: ["conditional_ba", "conditional_tara"] },
  {
    label: "Formes dérivées",
    uids: ["potential", "passive", "causative", "causative_passive"],
  },
]
const OTHER_GROUP = "Autres formes"

/**
 * Conjugaison d'un verbe : formes regroupées par usage, dans le registre
 * choisi, avec en évidence ce qui change par rapport à la forme du
 * dictionnaire. Les formes sans usage dans ce registre sont retirées et
 * signalées en bas. Purement présentationnel.
 */
export default function WordConjugation({
  forms,
  dictionary,
}: {
  forms: ConjugationForm[]
  /** Forme du dictionnaire (écriture du mot), référence du radical. */
  dictionary: string
}) {
  const [register, setRegister] = useState<Register>("plain")
  const visible = forms.filter((f) => hasVerb(f[register]))
  const missing = forms.filter((f) => !hasVerb(f[register]))
  const known = new Set(GROUPS.flatMap((g) => g.uids))
  const groups = [
    ...GROUPS.map((g) => ({
      label: g.label,
      forms: g.uids.flatMap((uid) => visible.filter((f) => f.uid === uid)),
    })),
    { label: OTHER_GROUP, forms: visible.filter((f) => !known.has(f.uid)) },
  ].filter((g) => g.forms.length > 0)

  return (
    <div className="space-y-5">
      <div role="group" aria-label="Registre" className="flex gap-2">
        {REGISTERS.map((r) => (
          <FilterChip
            key={r.key}
            label={r.label}
            active={register === r.key}
            onClick={() => setRegister(r.key)}
          />
        ))}
      </div>

      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">
            {group.label}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {group.forms.map((form) => (
              <FormCard
                key={form.uid}
                label={form.label}
                polarity={form[register]}
                dictionary={dictionary}
              />
            ))}
          </div>
        </section>
      ))}

      {missing.length > 0 && (
        <p className="text-xs text-fog">
          Sans forme {register === "polite" ? "polie" : "neutre"} courante :{" "}
          {missing.map((f) => f.label).join(", ")}.
        </p>
      )}
    </div>
  )
}

function hasVerb(polarity: ConjugationPolarity): boolean {
  return polarity.affirmative != null || polarity.negative != null
}

/** Une forme dans un registre : affirmatif et négatif côte à côte. */
function FormCard({
  label,
  polarity,
  dictionary,
}: {
  label: string
  polarity: ConjugationPolarity
  dictionary: string
}) {
  return (
    <div className="border border-line bg-ink/30 px-4 py-2.5">
      <h4 className="text-sm font-medium mb-1.5">{label}</h4>
      <dl className="grid grid-cols-2 gap-x-4">
        {polarity.affirmative && (
          <Verb
            label="Affirmatif"
            verb={polarity.affirmative}
            dictionary={dictionary}
          />
        )}
        {polarity.negative && (
          <Verb
            label="Négatif"
            verb={polarity.negative}
            dictionary={dictionary}
          />
        )}
      </dl>
    </div>
  )
}

/** Le verbe conjugué, terminaison en évidence, et sa lecture s'il a des kanji. */
function Verb({
  label,
  verb,
  dictionary,
}: {
  label: string
  verb: ConjugatedVerb
  dictionary: string
}) {
  const stem = stemLength(verb.writing, dictionary)
  return (
    <div className="min-w-0">
      <dt className="mono text-[10px] uppercase tracking-[0.1em] text-fog">
        {label}
      </dt>
      <dd>
        <div className="jp text-sm sm:text-base">
          <span className="text-chalk/70">{verb.writing.slice(0, stem)}</span>
          <span className="text-ember font-medium">
            {verb.writing.slice(stem)}
          </span>
        </div>
        {verb.reading !== verb.writing && (
          <div className="jp text-xs text-fog">{verb.reading}</div>
        )}
      </dd>
    </div>
  )
}

/**
 * Longueur du radical : début commun avec la forme du dictionnaire, sans son
 * dernier kana, qui est toujours la terminaison (食べ|る, 飲|む).
 */
function stemLength(writing: string, dictionary: string): number {
  const max = Math.min(writing.length, dictionary.length - 1)
  let length = 0
  while (length < max && writing[length] === dictionary[length]) length++
  return length
}
