import type { GrammarQ } from "./types"

export const grammarBank: GrammarQ[] = [
  {
    prompt: "これ＿ わたしの ちちです。",
    answer: "は",
    options: ["は", "を", "に", "で"],
    daily: true,
  },
  {
    prompt: "ごはん＿ たべます。",
    answer: "を",
    options: ["を", "は", "へ", "が"],
    hard: true,
  },
  {
    prompt: "えき＿ いきます。",
    answer: "へ",
    options: ["へ", "を", "は", "の"],
    review: true,
  },
  {
    prompt: "ともだち＿ はなします。",
    answer: "と",
    options: ["と", "を", "に", "は"],
  },
  {
    prompt: "がっこう＿ べんきょうします。",
    answer: "で",
    options: ["で", "を", "へ", "が"],
    daily: true,
  },
  {
    prompt: "ほん＿ よみます。",
    answer: "を",
    options: ["を", "に", "は", "で"],
  },
  {
    prompt: "あした＿ あめです。",
    answer: "は",
    options: ["は", "を", "で", "へ"],
    review: true,
  },
  {
    prompt: "きれい＿ はな",
    answer: "な",
    options: ["な", "い", "の", "と"],
    hard: true,
  },
  { prompt: "たか＿ やま", answer: "い", options: ["い", "な", "を", "に"] },
  {
    prompt: "せんせい＿ しつもんします。",
    answer: "に",
    options: ["に", "を", "は", "で"],
    hard: true,
  },
]
