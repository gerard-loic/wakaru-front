/**
 * Rôles grammaticaux des éléments d'une phrase (`sentence_token_role.uid`
 * côté Sylo) : libellé court et couleur. L'explication complète vient de
 * l'API (`sentence_token_role.name`).
 */

export interface SentenceRoleMeta {
  /** Libellé court (badges). */
  label: string
  /** Couleur d'accent du groupe et du badge. */
  color: string
}

const ROLES: Record<string, SentenceRoleMeta> = {
  topic: { label: "Thème", color: "#ff6a1a" },
  subject: { label: "Sujet", color: "#ff8a4c" },
  predicate: { label: "Prédicat", color: "#e5484d" },
  object: { label: "Objet", color: "#5aa9e6" },
  place: { label: "Lieu", color: "#3fbf7f" },
  destination: { label: "Destination", color: "#2fb5a8" },
  route: { label: "Trajet", color: "#7cc46a" },
  origin: { label: "Origine", color: "#9ccf5e" },
  companion: { label: "Accompagnement", color: "#b28cf5" },
  recipient: { label: "Destinataire", color: "#d18cf5" },
  possessor: { label: "Possesseur", color: "#f2a63b" },
  modifier: { label: "Modificateur", color: "#e8c547" },
  time: { label: "Temps", color: "#6c8cf5" },
  instrument: { label: "Moyen", color: "#4fc3e8" },
}

const UNKNOWN_COLOR = "#9aa0a6"

export function sentenceRole(uid: string | null | undefined): SentenceRoleMeta {
  return (uid && ROLES[uid]) || { label: uid || "", color: UNKNOWN_COLOR }
}
