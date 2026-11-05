import { richTextExcerpt } from "@/lib/richText"

/**
 * Modèle « règle de grammaire » partagé par la liste (`useRules`) et le
 * détail (`useRule`) : forme brute renvoyée par Sylo, forme prête à afficher
 * et conversion.
 */

/** Enregistrement brut renvoyé par `/grammar_rules` (avec `RULE_RELATIONS` + `with_knowledge`). */
export interface RuleRecord {
  id: number
  uid: string
  name: string
  /** Texte structuré par convention (voir `parseRichText`). */
  description: string | null
  grammar_category: { id: number; uid: string; name: string } | null
  theme: { id: number; name: string | null; deleted_at: string | null } | null
  level: { uid: string; name: string } | null
  /** Présent avec `with_knowledge` : progression de l'utilisateur connecté. */
  user_knowledge: { id: number; is_new: boolean } | null
}

export interface RuleCategoryRecord {
  id: number
  uid: string
  name: string
}

/** Catégorie de règles (`grammar_categories`). */
export interface RuleCategory {
  id: number
  uid: string
  name: string
}

/** Règle prête à afficher. */
export interface RuleEntry {
  id: number
  uid: string
  title: string
  /** Texte complet, structuré par convention (afficher avec `RichText`). */
  description: string | null
  /** Premier paragraphe de la description (aperçu en liste). */
  excerpt: string
  category: RuleCategory | null
  theme: { id: number; name: string } | null
  /** Niveau JLPT, ex : `"N5"`. */
  level: string | null
  /** Pas encore lue par l'utilisateur connecté (`user_knowledge.is_new`). */
  isNew: boolean
}

/** Relations à charger pour construire un `RuleEntry`. */
export const RULE_RELATIONS = ["grammar_category", "theme", "level"]

/** Paramètre propre au backend : ajoute `user_knowledge` à chaque règle. */
export const WITH_KNOWLEDGE = { with_knowledge: true }

export function toRule(r: RuleRecord): RuleEntry {
  const theme = r.theme && r.theme.deleted_at == null && r.theme.name ? r.theme : null
  return {
    id: r.id,
    uid: r.uid,
    title: r.name.trim(),
    description: r.description?.trim() || null,
    excerpt: richTextExcerpt(r.description),
    category: r.grammar_category && toCategory(r.grammar_category),
    theme: theme && { id: theme.id, name: theme.name! },
    level: r.level?.name ?? null,
    isNew: r.user_knowledge?.is_new ?? false,
  }
}

export function toCategory(c: RuleCategoryRecord): RuleCategory {
  return { id: c.id, uid: c.uid, name: c.name.trim() }
}
