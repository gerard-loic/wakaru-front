import type { ReactNode } from "react"
import type { PromptPart } from "@/features/exercises/exerciseModel"

/**
 * Énoncé d'une question : le texte tel quel, chaque trou remplacé par
 * `renderBlank` (vide, réponse, champ de saisie…).
 */
export function PromptText({
  parts,
  renderBlank,
  className = "",
}: {
  parts: PromptPart[]
  renderBlank: (blank: Extract<PromptPart, { kind: "blank" }>) => ReactNode
  className?: string
}) {
  return (
    <p className={"jp leading-relaxed " + className}>
      {parts.map((p, i) =>
        p.kind === "text" ? (
          <span key={i}>{p.text}</span>
        ) : (
          <span key={i}>{renderBlank(p)}</span>
        ),
      )}
    </p>
  )
}

/** Trou non rempli. */
export function EmptyBlank() {
  return (
    <span className="inline-block min-w-[2.5em] mx-0.5 border-b-2 border-line-bright align-baseline">
      &nbsp;
    </span>
  )
}

/** Trou rempli avec la réponse attendue. */
export function AnswerBlank({ answers }: { answers: string[] }) {
  return (
    <span className="mx-0.5 px-1 border-b-2 border-ember text-ember-soft">
      {answers.join(" / ") || "?"}
    </span>
  )
}
