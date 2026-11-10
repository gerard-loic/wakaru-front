import { markRead } from "@/lib/knowledge"
import { sf, sylo } from "@/lib/sylo"
import { useRemote, type Remote } from "@/lib/useRemote"
import {
  toTheme,
  type ThemeEntry,
  type ThemeRecord,
} from "@/features/themes/themeModel"
import {
  WORD_RELATIONS,
  WITH_KNOWLEDGE as WORD_KNOWLEDGE,
  loadThemeNames,
  loadThemeWordIds,
  toWord,
  type VocabWord,
  type WordRecord,
} from "@/features/vocab/wordModel"
import {
  KANJI_RELATIONS,
  WITH_KNOWLEDGE as KANJI_KNOWLEDGE,
  themeKanjiIds,
  toKanji,
  type KanjiEntry,
  type KanjiRecord,
  type ThemeKanjiLinks,
} from "@/features/kanji/kanjiModel"
import {
  RULE_RELATIONS,
  WITH_KNOWLEDGE as RULE_KNOWLEDGE,
  toRule,
  type RuleEntry,
  type RuleRecord,
} from "@/features/grammar/ruleModel"
import {
  SENTENCE_RELATIONS,
  WITH_KNOWLEDGE as SENTENCE_KNOWLEDGE,
  toSentence,
  type SentenceEntry,
  type SentenceRecord,
} from "@/features/sentences/sentenceModel"
import {
  EXERCISE_RELATIONS,
  WITH_KNOWLEDGE as EXERCISE_KNOWLEDGE,
  toExercise,
  type ExerciseEntry,
  type ExerciseRecord,
} from "@/features/exercises/exerciseModel"

/** Thème et tout son contenu. */
export interface ThemeContent {
  theme: ThemeEntry
  words: VocabWord[]
  kanjis: KanjiEntry[]
  rules: RuleEntry[]
  sentences: SentenceEntry[]
  exercises: ExerciseEntry[]
}

type ThemeWithKanjis = ThemeRecord & ThemeKanjiLinks

/**
 * Détail d'un thème : le thème puis, en parallèle, ses mots (via
 * `theme_words`), kanji, règles, phrases et exercices. `data` vaut `null` tant que rien
 * n'est chargé.
 *
 * Consulter la page du thème vaut lecture : s'il est encore « nouveau »
 * (`user_knowledge.is_new`), il est marqué comme lu.
 */
export function useTheme(id: number): Remote<ThemeContent | null> {
  return useRemote(
    async () => {
      const record = await sylo.get<ThemeWithKanjis>("themes", id, {
        with: ["kanjis"],
        extra: { with_knowledge: true },
      })
      const knowledge = record.user_knowledge
      if (knowledge?.is_new) {
        // Échec non bloquant : le thème reste « nouveau » jusqu'à la prochaine ouverture.
        markRead(knowledge.id).catch(() => {})
      }
      const kanjiIds = themeKanjiIds(record)

      const [words, kanjis, rules, sentences, exercises] = await Promise.all([
        loadWords(id),
        kanjiIds.length
          ? sylo.queryAll<KanjiRecord>("kanjis", {
              filter: sf.in("id", kanjiIds),
              orderby: ["id.ASC"],
              with: KANJI_RELATIONS,
              extra: KANJI_KNOWLEDGE,
            })
          : [],
        sylo.queryAll<RuleRecord>("grammar_rules", {
          filter: sf.eq("theme_id", id),
          orderby: ["name.ASC", "id.ASC"],
          with: RULE_RELATIONS,
          extra: RULE_KNOWLEDGE,
        }),
        sylo.queryAll<SentenceRecord>("sentences", {
          filter: sf.eq("theme_id", id),
          orderby: ["id.ASC"],
          with: SENTENCE_RELATIONS,
          extra: SENTENCE_KNOWLEDGE,
        }),
        sylo.queryAll<ExerciseRecord>("exercises", {
          filter: sf.eq("theme_id", id),
          orderby: ["id.ASC"],
          with: EXERCISE_RELATIONS,
          extra: EXERCISE_KNOWLEDGE,
        }),
      ])

      return {
        theme: toTheme(record),
        words,
        kanjis: kanjis.map(toKanji),
        rules: rules.map(toRule),
        sentences: sentences.map(toSentence),
        exercises: exercises.map(toExercise),
      }
    },
    null,
    [id],
  )
}

async function loadWords(themeId: number): Promise<VocabWord[]> {
  const ids = await loadThemeWordIds(themeId)
  if (!ids.length) return []
  const [records, themeNames] = await Promise.all([
    sylo.queryAll<WordRecord>("words", {
      filter: sf.in("id", ids),
      orderby: ["reading.ASC", "id.ASC"],
      with: WORD_RELATIONS,
      extra: WORD_KNOWLEDGE,
    }),
    loadThemeNames(),
  ])
  return records.map((r) => toWord(r, themeNames))
}
