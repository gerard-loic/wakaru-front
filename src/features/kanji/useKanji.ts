import { SyloApiError, sf, sylo } from "@/lib/sylo"
import { READING_KIND_ORDER } from "@/lib/readingKinds"
import { parseStringList } from "@/lib/syloValues"
import { useRemote, type Remote } from "@/lib/useRemote"
import {
  KANJI_RELATIONS,
  WITH_KNOWLEDGE,
  toKanji,
  type CompositionRecord,
  type KanjiEntry,
  type KanjiRecord,
} from "@/features/kanji/kanjiModel"

/** Mot dans lequel apparaît le kanji, avec la lecture qu'il y prend. */
export interface KanjiExample {
  /** Id du mot (`/words/<id>`) : permet d'ouvrir son détail. */
  wordId: number
  /** Mot complet (graphie usuelle) et sa lecture. */
  word: string
  wordReading: string
  meaning: string
  /** Lecture du kanji dans ce mot (`サン`, `やま`…). */
  reading: string
  /** Type de lecture (`composition_type.uid` : `on`, `kun`, `jukujikun`…). */
  kind: string
  /** Libellé complet du type de lecture. */
  kindName: string
  /** Lecture adoucie par rendaku (か -> が…). */
  rendaku: boolean
}

export interface KanjiDetail {
  kanji: KanjiEntry
  examples: KanjiExample[]
}

export type UseKanji = Omit<Remote<KanjiDetail | null>, "data"> & {
  /** Kanji chargé avec ses mots-exemples, ou `null` tant qu'il ne l'est pas. */
  detail: KanjiDetail | null
}

interface CompositionTypeRecord {
  id: number
  uid: string
  name: string
}

interface ExampleWordRecord {
  id: number
  writing: string | null
  reading: string | null
  translations: string | null
}

/**
 * Détail d'un kanji via Sylo (`GET /kanjis/<id>`) et ses mots-exemples, issus
 * de ses compositions. Indépendant de la liste : le kanji peut être ouvert
 * depuis n'importe quelle interface. Ne touche pas à l'affichage.
 */
export function useKanji(id: number): UseKanji {
  const { data, ...remote } = useRemote<KanjiDetail | null>(
    async () => {
      const [record, types] = await Promise.all([
        sylo
          .get<KanjiRecord>("kanjis", id, {
            with: [...KANJI_RELATIONS, "compositions"],
            extra: WITH_KNOWLEDGE,
          })
          .catch((err) => {
            if (err instanceof SyloApiError && err.status === 404) {
              throw new SyloApiError(
                "Ce kanji n'existe pas ou a été supprimé.",
                { code: err.code, status: 404 },
              )
            }
            throw err
          }),
        // Libellés des types de lecture : échec non bloquant.
        sylo
          .listAll<CompositionTypeRecord>("composition_types")
          .catch(() => []),
      ])
      const examples = await loadExamples(record.compositions ?? [], types)
      return { kanji: toKanji(record), examples }
    },
    null,
    [id],
  )
  return { ...remote, detail: data }
}

/** Charge en une requête les mots liés aux compositions et les associe. */
async function loadExamples(
  compositions: CompositionRecord[],
  types: CompositionTypeRecord[],
): Promise<KanjiExample[]> {
  const live = compositions.filter((c) => c.deleted_at == null && c.word_id)
  const wordIds = [...new Set(live.map((c) => c.word_id!))]
  if (wordIds.length === 0) return []

  // Pas de `listAll` : `query` porte le filtre ; 200 mots-exemples suffisent.
  const { data: words } = await sylo.query<ExampleWordRecord>("words", {
    filter: sf.in("id", wordIds),
    limit: 200,
  })
  const wordById = new Map(words.map((w) => [w.id, w]))
  const typeById = new Map(types.map((t) => [t.id, t]))

  const examples = live.flatMap((c): KanjiExample[] => {
    const word = wordById.get(c.word_id!)
    if (!word) return []
    const type = c.composition_type_id
      ? typeById.get(c.composition_type_id)
      : undefined
    return [
      {
        wordId: word.id,
        word: word.writing || word.reading || "",
        wordReading: word.reading ?? "",
        meaning: parseStringList(word.translations).join(", "),
        reading: c.reading ?? "",
        kind: type?.uid ?? "",
        kindName: type?.name ?? "",
        rendaku: c.is_rendaku === true,
      },
    ]
  })

  const rank = (kind: string) => {
    const i = READING_KIND_ORDER.indexOf(kind)
    return i === -1 ? READING_KIND_ORDER.length : i
  }
  return examples.sort((a, b) => rank(a.kind) - rank(b.kind))
}
