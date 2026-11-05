import {
  themes,
  words,
  kanjis,
  sentences,
  hiragana,
  katakana,
  grammarBank,
} from "@/data"

export type QType = "hiragana" | "katakana" | "vocab" | "kanji" | "grammar" | "sentences"
export type QMode = "fr2jp" | "jp2fr" | "read2mean"
export type QScope = "daily" | "hard" | "review" | "random"

export type Question = {
  prompt: string
  promptJp: boolean
  answer: string
  options: string[]
  optionsJp: boolean
  // Étape 2 optionnelle (mode « lecture puis sens » des kanji)
  stage2?: { answer: string; options: string[]; optionsJp: boolean }
}

export const TYPE_OPTS: { id: QType; label: string; jp: string; note: string }[] =
  [
    {
      id: "hiragana",
      label: "Hiragana",
      jp: "ひらがな",
      note: "46 syllabes de base",
    },
    {
      id: "katakana",
      label: "Katakana",
      jp: "カタカナ",
      note: "Mots étrangers",
    },
    {
      id: "vocab",
      label: "Vocabulaire",
      jp: "単語",
      note: "Mots & traductions",
    },
    { id: "kanji", label: "Kanji", jp: "漢字", note: "Caractères & sens" },
    {
      id: "grammar",
      label: "Grammaire",
      jp: "文法",
      note: "Particules & formes",
    },
    { id: "sentences", label: "Phrases", jp: "例文", note: "Phrases types" },
  ]

export const MODE_OPTS: {
  id: QMode
  label: string
  jp: string
  note?: string
  only?: QType
}[] = [
  { id: "fr2jp", label: "Du français au japonais", jp: "仏 → 和" },
  { id: "jp2fr", label: "Du japonais au français", jp: "和 → 仏" },
  {
    id: "read2mean",
    label: "Lecture puis traduction",
    jp: "読み → 意味",
    note: "Lis le kanji, puis choisis son sens",
    only: "kanji",
  },
]

export const SCOPE_OPTS: { id: QScope; label: string; note: string }[] = [
  {
    id: "daily",
    label: "Thème du jour uniquement",
    note: `« ${themes[0].title} »`,
  },
  {
    id: "hard",
    label: "Mes points faibles",
    note: "Éléments les plus difficiles",
  },
  {
    id: "review",
    label: "Révision des anciennes notions",
    note: "Ce que tu as vu il y a longtemps",
  },
  { id: "random", label: "Aléatoire", note: "Un peu de tout" },
]

export const QUIZ_LEN = 20
export const DAILY_THEME = themes[0].id

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function scopeFilter<T extends { themes: string[] }>(
  items: T[],
  scope: QScope,
): T[] {
  let out: T[]
  switch (scope) {
    case "daily":
      out = items.filter((i) => i.themes.includes(DAILY_THEME))
      break
    case "hard":
      out = items.filter((_, i) => i % 3 === 1)
      break
    case "review":
      out = [...items].reverse().slice(0, Math.ceil(items.length / 2))
      break
    default:
      out = items
  }
  return out.length >= 4 ? out : items
}

function makeOptions(answer: string, pool: string[]): string[] {
  const distract = shuffle(pool.filter((p) => p !== answer)).slice(0, 3)
  return shuffle([answer, ...distract])
}

export function buildQuiz(type: QType, mode: QMode, scope: QScope): Question[] {
  const out: Question[] = []

  const pushKana = (table: { kana: string; romaji: string }[]) => {
    const romajiPool = table.map((k) => k.romaji)
    const kanaPool = table.map((k) => k.kana)
    shuffle(table).forEach((k) => {
      if (mode === "jp2fr") {
        out.push({
          prompt: k.kana,
          promptJp: true,
          answer: k.romaji,
          options: makeOptions(k.romaji, romajiPool),
          optionsJp: false,
        })
      } else {
        out.push({
          prompt: k.romaji,
          promptJp: false,
          answer: k.kana,
          options: makeOptions(k.kana, kanaPool),
          optionsJp: true,
        })
      }
    })
  }

  if (type === "hiragana") pushKana(hiragana)
  else if (type === "katakana") pushKana(katakana)
  else if (type === "kanji") {
    const items = scopeFilter(kanjis, scope)
    const charPool = items.map((i) => i.char)
    const meaningPool = items.map((i) => i.meaning)
    // mots composés (mots-exemples) rattachés aux kanji du périmètre
    const exItems = items.flatMap((i) => i.examples ?? [])
    const wordPool = exItems.map((e) => e.word)
    const readingPool = exItems.map((e) => e.reading)
    const exMeaningPool = exItems.map((e) => e.meaning)

    // Mode « lecture puis traduction » : deux étapes par kanji
    if (mode === "read2mean") {
      const readingPoolK = items.map((i) => i.kun[0] || i.on[0]).filter(Boolean)
      shuffle(items).forEach((i) => {
        const reading = i.kun[0] || i.on[0]
        if (!reading) return
        out.push({
          prompt: i.char,
          promptJp: true,
          answer: reading,
          options: makeOptions(reading, readingPoolK),
          optionsJp: true,
          stage2: {
            answer: i.meaning,
            options: makeOptions(i.meaning, meaningPool),
            optionsJp: false,
          },
        })
      })
      const pool2 = shuffle(out)
      const full2: Question[] = []
      let j = 0
      while (full2.length < QUIZ_LEN && pool2.length > 0) {
        const base = pool2[j % pool2.length]
        full2.push(
          j < pool2.length ? base : { ...base, options: shuffle(base.options) },
        )
        j++
      }
      return full2
    }

    shuffle(items).forEach((i) => {
      if (mode === "jp2fr") {
        out.push({
          prompt: i.char,
          promptJp: true,
          answer: i.meaning,
          options: makeOptions(i.meaning, meaningPool),
          optionsJp: false,
        })
      } else {
        out.push({
          prompt: i.meaning,
          promptJp: false,
          answer: i.char,
          options: makeOptions(i.char, charPool),
          optionsJp: true,
        })
      }
    })

    // questions sur les mots composés + leur lecture
    shuffle(exItems).forEach((e) => {
      if (readingPool.length >= 3) {
        // lecture du mot composé (toujours utile : reconnaître la lecture)
        out.push({
          prompt: e.word,
          promptJp: true,
          answer: e.reading,
          options: makeOptions(e.reading, readingPool),
          optionsJp: true,
        })
      }
      if (mode === "jp2fr") {
        out.push({
          prompt: `${e.word}（${e.reading}）`,
          promptJp: true,
          answer: e.meaning,
          options: makeOptions(e.meaning, exMeaningPool),
          optionsJp: false,
        })
      } else {
        out.push({
          prompt: e.meaning,
          promptJp: false,
          answer: e.word,
          options: makeOptions(e.word, wordPool),
          optionsJp: true,
        })
      }
    })
  } else if (type === "vocab" || type === "sentences") {
    const items = scopeFilter(type === "vocab" ? words : sentences, scope)
    const kanaPool = items.map((i) => i.kana)
    const frPool = items.map((i) => i.translation)
    shuffle(items).forEach((i) => {
      if (mode === "jp2fr") {
        out.push({
          prompt: i.kana,
          promptJp: true,
          answer: i.translation,
          options: makeOptions(i.translation, frPool),
          optionsJp: false,
        })
      } else {
        out.push({
          prompt: i.translation,
          promptJp: false,
          answer: i.kana,
          options: makeOptions(i.kana, kanaPool),
          optionsJp: true,
        })
      }
    })
  } else {
    // grammar — particle/form choices, direction-agnostic
    let bank = grammarBank
    if (scope === "daily") bank = grammarBank.filter((g) => g.daily)
    else if (scope === "hard") bank = grammarBank.filter((g) => g.hard)
    else if (scope === "review") bank = grammarBank.filter((g) => g.review)
    if (bank.length < 3) bank = grammarBank
    shuffle(bank).forEach((g) => {
      out.push({
        prompt: g.prompt,
        promptJp: true,
        answer: g.answer,
        options: shuffle(g.options),
        optionsJp: true,
      })
    })
  }

  // mélange global pour entrelacer les types de questions (kanji seuls / mots composés / lectures)
  const pool = shuffle(out)

  // cycle to reach QUIZ_LEN questions
  const full: Question[] = []
  let i = 0
  while (full.length < QUIZ_LEN && pool.length > 0) {
    const base = pool[i % pool.length]
    full.push(
      i < out.length ? base : { ...base, options: shuffle(base.options) },
    )
    i++
  }
  return full
}

export function resultMessage(score: number, total: number) {
  const pct = score / total
  if (pct >= 0.9) return { tag: "Excellent !", jp: "素晴らしい！" }
  if (pct >= 0.7) return { tag: "Bien joué", jp: "よくできました" }
  if (pct >= 0.5) return { tag: "En progrès", jp: "その調子！" }
  return { tag: "Continue de t'entraîner", jp: "がんばって！" }
}
