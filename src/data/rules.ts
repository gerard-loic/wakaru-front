import type { Rule } from "./types"

export const rules: Rule[] = [
  {
    id: "r1",
    title: "La particule は (wa) — le thème",
    category: "Particules",
    themes: ["famille", "ville"],
    body: "La particule は, prononcée « wa » dans ce contexte, marque le thème de la phrase — ce dont on parle. Elle se place après le mot qu'elle isole : わたしは がくせいです (Watashi wa gakusei desu) → « Moi, je suis étudiant(e) ». Le thème n'est pas forcément le sujet grammatical ; c'est le cadre de référence de l'énoncé.",
    exercises: ["e1"],
    isNew: true,
  },
  {
    id: "r2",
    title: "La particule を (o) — le complément d'objet",
    category: "Particules",
    themes: ["nourriture"],
    body: "La particule を marque le complément d'objet direct du verbe. Elle se lit « o ». Exemple : ごはんを たべます (Gohan o tabemasu) → « Je mange du riz ». Elle précède toujours immédiatement le verbe d'action.",
    exercises: ["e2"],
  },
  {
    id: "r3",
    title: "La forme て (te) — enchaîner les actions",
    category: "Conjugaison",
    themes: ["voyage", "temps"],
    body: "La forme en て permet d'enchaîner deux actions, de formuler une demande polie (〜てください) ou l'aspect progressif (〜ています). La transformation dépend de la terminaison du verbe : たべる → たべて, のむ → のんで, いく → いって (irrégulier).",
    exercises: ["e3"],
  },
  {
    id: "r4",
    title: "Les adjectifs en い et en な",
    category: "Adjectifs",
    themes: ["nature", "ville"],
    body: "Le japonais distingue deux classes d'adjectifs. Les adjectifs en い se conjuguent (たかい → たかかった). Les adjectifs en な s'appuient sur です et prennent な devant un nom (きれいな はな → « une belle fleur »).",
    exercises: ["e4"],
  },
  {
    id: "r5",
    title: "Compter avec les spécificatifs",
    category: "Nombres",
    themes: ["nourriture", "ville"],
    body: "Pour compter en japonais, on ajoute un classificateur adapté à l'objet : 〜つ (objets généraux), 〜人 (personnes), 〜本 (objets longs), 〜枚 (objets plats). Exemple : りんごを みっつ ください → « Trois pommes, s'il vous plaît ».",
    exercises: [],
  },
]
