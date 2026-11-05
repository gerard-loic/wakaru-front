import type { Sentence } from "./types"

export const sentences: Sentence[] = [
  {
    id: "s1",
    kana: "これは わたしの かぞくです。",
    romaji: "Kore wa watashi no kazoku desu.",
    translation: "Voici ma famille.",
    themes: ["famille"],
  },
  {
    id: "s2",
    kana: "まいあさ ごはんを たべます。",
    romaji: "Maiasa gohan o tabemasu.",
    translation: "Je mange du riz chaque matin.",
    themes: ["nourriture", "temps"],
  },
  {
    id: "s3",
    kana: "えきで でんしゃを まちます。",
    romaji: "Eki de densha o machimasu.",
    translation: "J'attends le train à la gare.",
    themes: ["voyage", "ville"],
  },
  {
    id: "s4",
    kana: "やまの うえに そらが ひろがります。",
    romaji: "Yama no ue ni sora ga hirogarimasu.",
    translation: "Le ciel s'étend au-dessus de la montagne.",
    themes: ["nature"],
  },
  {
    id: "s5",
    kana: "よる、まちが とても しずかです。",
    romaji: "Yoru, machi ga totemo shizuka desu.",
    translation: "La nuit, la ville est très calme.",
    themes: ["ville", "temps"],
  },
  {
    id: "s6",
    kana: "みずを もう いっぱい ください。",
    romaji: "Mizu o mō ippai kudasai.",
    translation: "Un autre verre d'eau, s'il vous plaît.",
    themes: ["nourriture"],
  },
]
