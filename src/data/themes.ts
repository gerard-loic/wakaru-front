import type { Theme } from "./types"

export const themes: Theme[] = [
  {
    id: "famille",
    title: "La famille",
    date: "2026-08-04",
    image:
      "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=640&h=420&fit=crop&auto=format",
    count: { words: 24, kanji: 8, rules: 3, sentences: 12, exercises: 4 },
    isNew: true,
  },
  {
    id: "nourriture",
    title: "La nourriture",
    date: "2026-07-28",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=640&h=420&fit=crop&auto=format",
    count: { words: 41, kanji: 15, rules: 2, sentences: 20, exercises: 6 },
    isNew: true,
  },
  {
    id: "voyage",
    title: "Le voyage",
    date: "2026-07-15",
    image:
      "https://images.unsplash.com/photo-1528164344705-47542687000d?w=640&h=420&fit=crop&auto=format",
    count: { words: 33, kanji: 12, rules: 4, sentences: 18, exercises: 5 },
  },
  {
    id: "temps",
    title: "Le temps qui passe",
    date: "2026-06-30",
    image:
      "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=640&h=420&fit=crop&auto=format",
    count: { words: 28, kanji: 10, rules: 5, sentences: 14, exercises: 3 },
  },
  {
    id: "ville",
    title: "En ville",
    date: "2026-06-12",
    image:
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=640&h=420&fit=crop&auto=format",
    count: { words: 37, kanji: 14, rules: 3, sentences: 16, exercises: 5 },
  },
  {
    id: "nature",
    title: "La nature",
    date: "2026-05-20",
    image:
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=640&h=420&fit=crop&auto=format",
    count: { words: 45, kanji: 18, rules: 2, sentences: 22, exercises: 7 },
  },
]

export const ambiance: Record<string, string> = {
  famille:
    "Au Japon, la famille — 家族 (kazoku) — reste le premier cercle de transmission de la langue et des usages. Des liens de politesse graduée (敬語) aux fêtes comme お盆 où l'on honore les ancêtres, chaque relation a son mot juste. Aujourd'hui, apprends à nommer les tiens : ちち et はは pour parler des siens avec humilité, おとうさん et おかあさん pour s'adresser aux autres avec respect.",
  nourriture:
    "La cuisine japonaise — 和食 (washoku) — est inscrite au patrimoine de l'UNESCO. Du bol de riz ごはん aux poissons さかな du marché de Toyosu, la nourriture rythme la journée et le vocabulaire. « いただきます » avant de manger, « ごちそうさま » après : la table est un terrain de langue à part entière.",
  voyage:
    "Prendre le でんしゃ à la えき, filer vers une やま lointaine : voyager au Japon, c'est lire des panneaux, demander son chemin et compter les arrêts. Le réseau ferroviaire, d'une ponctualité légendaire, est le meilleur professeur de vocabulaire pratique qui soit.",
  temps:
    "あさ, よる, きょう : le temps qui passe structure toute conversation. Les Japonais accordent une grande importance aux saisons — 季節 — et à leurs mots. Maîtriser les repères temporels, c'est pouvoir raconter sa journée et se projeter.",
  ville:
    "まち animée, みせ à chaque coin de rue : la ville japonaise mêle néons et ruelles silencieuses. S'y repérer demande un vocabulaire précis, des magasins aux gares en passant par les quartiers. La nuit, よる, tout se calme d'un coup.",
  nature:
    "やま, かわ, そら : la nature irrigue la sensibilité japonaise, du 花見 au printemps aux érables 紅葉 de l'automne. Ce thème rassemble les mots pour dire le paysage, socle de la poésie comme de la conversation quotidienne.",
}
