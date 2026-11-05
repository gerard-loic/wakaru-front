import { masteryFromKnowledge, type Mastery } from "@/lib/mastery"

/**
 * Modèle « phrase » partagé par la liste (`useSentences`) et le détail
 * (`useSentence`) : forme brute renvoyée par Sylo, forme prête à afficher et
 * conversion, dont le découpage de la phrase en groupes.
 */

/** Enregistrement brut renvoyé par `/sentences` (avec `SENTENCE_RELATIONS` + `with_knowledge`). */
export interface SentenceRecord {
  id: number
  text: string | null
  translation: string
  theme: { id: number; name: string | null; deleted_at: string | null } | null
  level: { uid: string; name: string } | null
  /** Présent avec `with_knowledge` : progression de l'utilisateur connecté. */
  user_knowledge: { type: string | null } | null
}

/** Enregistrement brut renvoyé par `QUERY /sentence_tokens` (avec `TOKEN_RELATIONS`). */
export interface TokenRecord {
  id: number
  text: string | null
  reading: string | null
  /** Forme du dictionnaire (`みる` pour `みます`), vide si identique. */
  lemma: string | null
  word_id: number | null
  deleted_at: string | null
  sentence_token_role: { uid: string; name: string } | null
  word: { id: number; writing: string | null; reading: string | null } | null
}

/** Phrase prête à afficher. */
export interface SentenceEntry {
  id: number
  text: string
  translation: string
  theme: { id: number; name: string } | null
  /** Niveau JLPT, ex : `"N5"`. */
  level: string | null
  /** Maîtrise de l'utilisateur connecté (`user_knowledge.type`). */
  mastery: Mastery
}

/** Élément de la phrase (mot, particule, ponctuation). */
export interface SentenceToken {
  id: number
  text: string
  reading: string
  /** Forme du dictionnaire, ou `null` si identique au texte. */
  lemma: string | null
  /** Rôle grammatical (`sentence_token_role.uid`), ou `null` (particule, ponctuation…). */
  role: string | null
  /** Explication du rôle fournie par l'API. */
  roleName: string | null
  /** Mot du vocabulaire correspondant, s'il est relié. */
  word: { id: number; writing: string } | null
  /** Ponctuation (。、！？…) : affichée, mais pas analysée. */
  punctuation: boolean
}

/**
 * Groupe de la phrase : un élément porteur d'un rôle suivi des éléments qui
 * s'y rattachent (particule qui le marque…). Ex. : 「こうえん」+「で」 = lieu.
 */
export interface SentenceChunk {
  key: string
  role: string | null
  roleName: string | null
  tokens: SentenceToken[]
}

/** Relations à charger pour construire un `SentenceEntry`. */
export const SENTENCE_RELATIONS = ["theme", "level"]

/** Relations à charger pour construire un `SentenceToken`. */
export const TOKEN_RELATIONS = ["sentence_token_role", "word"]

/** Paramètre propre au backend : ajoute `user_knowledge` à chaque phrase. */
export const WITH_KNOWLEDGE = { with_knowledge: true }

export function toSentence(r: SentenceRecord): SentenceEntry {
  const theme = r.theme && r.theme.deleted_at == null && r.theme.name ? r.theme : null
  return {
    id: r.id,
    text: r.text?.trim() ?? "",
    translation: r.translation.trim(),
    theme: theme && { id: theme.id, name: theme.name! },
    level: r.level?.name ?? null,
    mastery: masteryFromKnowledge(r.user_knowledge?.type),
  }
}

const PUNCTUATION = /^[\s。、．，！？!?,.「」『』（）()・…〜]+$/

export function toToken(t: TokenRecord): SentenceToken {
  const text = t.text ?? ""
  const lemma = t.lemma?.trim()
  return {
    id: t.id,
    text,
    reading: t.reading ?? "",
    lemma: lemma && lemma !== text ? lemma : null,
    role: t.sentence_token_role?.uid ?? null,
    roleName: t.sentence_token_role?.name.trim() || null,
    word: t.word
      ? { id: t.word.id, writing: t.word.writing || t.word.reading || "" }
      : null,
    punctuation: PUNCTUATION.test(text),
  }
}

/**
 * Regroupe les éléments : chaque élément porteur d'un rôle ouvre un groupe,
 * les éléments sans rôle qui suivent (particules) s'y rattachent ; la
 * ponctuation forme son propre groupe.
 */
export function chunkTokens(tokens: SentenceToken[]): SentenceChunk[] {
  const chunks: SentenceChunk[] = []
  for (const t of tokens) {
    const last = chunks[chunks.length - 1]
    const attach =
      !t.role && !t.punctuation && last && !last.tokens[0].punctuation
    if (attach) {
      last.tokens.push(t)
    } else {
      chunks.push({ key: String(t.id), role: t.role, roleName: t.roleName, tokens: [t] })
    }
  }
  return chunks
}
