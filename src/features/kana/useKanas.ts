import { useMemo, useState } from "react"
import type { KanaSection } from "@/features/kana/KanaView"
import {
  countByMastery,
  masteryFromKnowledge,
  type Mastery,
} from "@/lib/mastery"
import { sylo } from "@/lib/sylo"
import { useRemote, type Remote } from "@/lib/useRemote"

/** Syllabaire : détermine la route (`/hiraganas`, `/katakanas`) et le champ du caractère. */
export type KanaScript = "hiragana" | "katakana"

/**
 * Enregistrement brut renvoyé par `GET /hiraganas` ou `GET /katakanas`. Le
 * caractère est dans le champ nommé comme le syllabaire (`hiragana` / `katakana`).
 */
type KanaRecord = {
  id: number
  pronunciation: string
  order: number | null
  type: string | null
  /** Présent avec `with_knowledge` : progression de l'utilisateur connecté. */
  user_knowledge: { type: string | null } | null
} & Partial<Record<KanaScript, string>>

export type UseKanas = Omit<Remote<KanaSection[]>, "data"> & {
  /** Kana regroupés par type, au format attendu par `KanaView`, filtrés par maîtrise. */
  sections: KanaSection[]
  /** Nombre total de kana du syllabaire (sans filtre). */
  total: number
  /** Effectif par niveau de maîtrise (sans filtre). */
  counts: Record<Mastery, number>
  /** Niveau de maîtrise sélectionné, ou `null` pour tous. */
  mastery: Mastery | null
  setMastery: (mastery: Mastery | null) => void
}

/** Catégories affichées, dans l'ordre. La clé est la valeur normalisée de `type`. */
const TYPES: Omit<KanaSection, "items">[] = [
  { key: "gojuon", title: "Gojūon", jp: "五十音" },
  { key: "dakuten", title: "Dakuten", jp: "濁点" },
  { key: "handakuten", title: "Handakuten", jp: "半濁点" },
  { key: "yoon", title: "Yōon", jp: "拗音", columns: 3 },
]

/**
 * Récupère tous les kana d'un syllabaire via Sylo (`GET /hiraganas` ou
 * `GET /katakanas`), avec la maîtrise de l'utilisateur, triés et regroupés par
 * type. Le syllabaire étant chargé en entier, le filtre de maîtrise est
 * appliqué côté client. Ne touche pas à l'affichage.
 */
export function useKanas(script: KanaScript): UseKanas {
  const [mastery, setMastery] = useState<Mastery | null>(null)
  const { data, ...remote } = useRemote(
    async () =>
      groupByType(
        script,
        await sylo.listAll<KanaRecord>(`${script}s`, {
          orderby: ["order.ASC", "id.ASC"],
          extra: { with_knowledge: true },
        }),
      ),
    [],
    [script],
  )

  const all = useMemo(() => data.flatMap((s) => s.items), [data])
  const counts = useMemo(() => countByMastery(all, (k) => k.mastery), [all])
  const sections = useMemo(
    () =>
      mastery
        ? data
            .map((s) => ({ ...s, items: s.items.filter((k) => k.mastery === mastery) }))
            .filter((s) => s.items.length > 0)
        : data,
    [data, mastery],
  )

  return { ...remote, sections, total: all.length, counts, mastery, setMastery }
}

/**
 * Trie par `order` (puis `id`, les `order` absents en dernier) et regroupe par
 * `type`. Les types inconnus sont rassemblés dans une section « Autres ».
 */
function groupByType(script: KanaScript, records: KanaRecord[]): KanaSection[] {
  const sorted = [...records].sort(
    (a, b) =>
      (a.order ?? Number.POSITIVE_INFINITY) -
        (b.order ?? Number.POSITIVE_INFINITY) || a.id - b.id,
  )

  const byType = new Map<string, KanaSection["items"]>()
  for (const r of sorted) {
    const key = normalizeType(r.type)
    const bucket = TYPES.some((t) => t.key === key) ? key : "other"
    if (!byType.has(bucket)) byType.set(bucket, [])
    byType.get(bucket)!.push({
      id: r.id,
      kana: r[script] ?? "",
      romaji: r.pronunciation,
      mastery: masteryFromKnowledge(r.user_knowledge?.type),
    })
  }

  const sections: KanaSection[] = TYPES.filter((t) => byType.has(t.key)).map(
    (t) => ({ ...t, items: byType.get(t.key)! }),
  )
  const others = byType.get("other")
  if (others) sections.push({ key: "other", title: "Autres", jp: "その他", items: others })
  return sections
}

/** `"Yōon"`, `"YOON"`, `" yôon "` -> `"yoon"`. */
function normalizeType(type: string | null): string {
  return (type ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/gi, "")
    .toLowerCase()
}
