import type { Exercise } from "./types"

export const exercises: Exercise[] = [
  {
    id: "e1",
    title: "Repérer le thème",
    subject: "Particule は",
    date: "2026-08-10",
    themes: ["famille"],
    prompt: "Complétez chaque phrase avec la particule du thème et traduisez.",
    questions: [
      {
        q: "これ＿＿ わたしの ちちです。",
        a: "これは わたしの ちちです。— « Ceci, c'est mon père. »",
      },
      {
        q: "かぞく＿＿ よにんです。",
        a: "かぞくは よにんです。— « Ma famille compte quatre personnes. »",
      },
    ],
    isNew: true,
  },
  {
    id: "e2",
    title: "Objet direct au marché",
    subject: "Particule を",
    date: "2026-08-06",
    themes: ["nourriture"],
    prompt: "Choisissez le complément et construisez la phrase.",
    questions: [
      {
        q: "みず＿＿ のみます。",
        a: "みずを のみます。— « Je bois de l'eau. »",
      },
      {
        q: "さかな＿＿ たべます。",
        a: "さかなを たべます。— « Je mange du poisson. »",
      },
    ],
  },
  {
    id: "e3",
    title: "Itinéraire à la gare",
    subject: "Forme て",
    date: "2026-07-22",
    themes: ["voyage"],
    prompt: "Mettez le verbe entre parenthèses à la forme て.",
    questions: [
      {
        q: "えきまで (いく) 、でんしゃに のります。",
        a: "えきまで いって、でんしゃに のります。",
      },
      {
        q: "きっぷを (かう) 、ホームへ いきます。",
        a: "きっぷを かって、ホームへ いきます。",
      },
    ],
  },
  {
    id: "e4",
    title: "Décrire un paysage",
    subject: "Adjectifs い / な",
    date: "2026-05-30",
    themes: ["nature"],
    prompt: "Accordez correctement l'adjectif devant le nom.",
    questions: [
      { q: "(たかい) やま", a: "たかい やま — « une haute montagne »" },
      { q: "(きれい) そら", a: "きれいな そら — « un ciel magnifique »" },
    ],
  },
]
