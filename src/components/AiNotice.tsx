import { Link } from "react-router-dom"

/** Mention discrète signalant un contenu pédagogique généré par IA (cf. CGU, art. 4). */
export function AiNotice() {
  return (
    <p className="mono text-[10px] text-fog/70">
      Contenu généré par IA, peut contenir des erreurs ·{" "}
      <Link
        to="/cgu"
        target="_blank"
        rel="noopener"
        className="underline underline-offset-2 hover:text-ember transition-colors"
      >
        En savoir plus
      </Link>
    </p>
  )
}
