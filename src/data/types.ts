// Shared types for the mock dataset (日本語ラボ)

export type Word = {
  id: string
  kana: string
  romaji: string
  translation: string
  themes: string[]
  isNew?: boolean
}

export type KanjiExample = {
  word: string // écriture (avec kanji)
  reading: string // lecture en kana
  meaning: string // sens en français
  kind: "on" | "kun" // lecture mobilisée
}

export type Kanji = {
  id: string
  char: string
  on: string[]
  kun: string[]
  meaning: string
  otherMeanings: string[]
  strokes: number
  jlpt: string
  themes: string[]
  radical?: { char: string; meaning: string }
  components?: string[]
  examples?: KanjiExample[]
  isNew?: boolean
}

export type Rule = {
  id: string
  title: string
  category: string
  themes: string[]
  body: string
  exercises: string[]
  isNew?: boolean
}

export type Exercise = {
  id: string
  title: string
  subject: string
  date: string
  themes: string[]
  prompt: string
  questions: { q: string; a: string }[]
  isNew?: boolean
}

export type Sentence = {
  id: string
  kana: string
  romaji: string
  translation: string
  themes: string[]
}

export type Theme = {
  id: string
  title: string
  date: string
  image: string
  count: {
    words: number
    kanji: number
    rules: number
    sentences: number
    exercises: number
  }
  isNew?: boolean
}

export type DailyTask = {
  kind: "revision" | "exercice"
  label: string
  detail: string
  done: boolean
}

export type Kana = { kana: string; romaji: string }

// Grammar quiz bank (question / correct / distractors)
export type GrammarQ = {
  prompt: string
  answer: string
  options: string[]
  daily?: boolean
  hard?: boolean
  review?: boolean
}
