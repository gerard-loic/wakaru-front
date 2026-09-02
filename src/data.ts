// Mock dataset for the Japanese learning app (日本語ラボ)

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
  kind: 'on' | 'kun' // lecture mobilisée
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
  count: { words: number; kanji: number; rules: number; sentences: number; exercises: number }
  isNew?: boolean
}

export const themes: Theme[] = [
  {
    id: 'famille',
    title: 'La famille',
    date: '2026-08-04',
    image:
      'https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=640&h=420&fit=crop&auto=format',
    count: { words: 24, kanji: 8, rules: 3, sentences: 12, exercises: 4 },
    isNew: true,
  },
  {
    id: 'nourriture',
    title: 'La nourriture',
    date: '2026-07-28',
    image:
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=640&h=420&fit=crop&auto=format',
    count: { words: 41, kanji: 15, rules: 2, sentences: 20, exercises: 6 },
    isNew: true,
  },
  {
    id: 'voyage',
    title: 'Le voyage',
    date: '2026-07-15',
    image:
      'https://images.unsplash.com/photo-1528164344705-47542687000d?w=640&h=420&fit=crop&auto=format',
    count: { words: 33, kanji: 12, rules: 4, sentences: 18, exercises: 5 },
  },
  {
    id: 'temps',
    title: 'Le temps qui passe',
    date: '2026-06-30',
    image:
      'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=640&h=420&fit=crop&auto=format',
    count: { words: 28, kanji: 10, rules: 5, sentences: 14, exercises: 3 },
  },
  {
    id: 'ville',
    title: 'En ville',
    date: '2026-06-12',
    image:
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=640&h=420&fit=crop&auto=format',
    count: { words: 37, kanji: 14, rules: 3, sentences: 16, exercises: 5 },
  },
  {
    id: 'nature',
    title: 'La nature',
    date: '2026-05-20',
    image:
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=640&h=420&fit=crop&auto=format',
    count: { words: 45, kanji: 18, rules: 2, sentences: 22, exercises: 7 },
  },
]

// --- Dashboard data -------------------------------------------------

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

export type DailyTask = { kind: 'revision' | 'exercice'; label: string; detail: string; done: boolean }

export const dailyPlan: DailyTask[] = [
  {
    kind: 'revision',
    label: 'Révision du jour',
    detail: '12 mots du thème « La famille »',
    done: true,
  },
  {
    kind: 'exercice',
    label: "Exercice du jour",
    detail: 'Particule は — 20 questions',
    done: false,
  },
]

export type StatCat = {
  id: string
  label: string
  jp: string
  total: number
  known: number
  learning: number
  hard: number
}

export const stats: StatCat[] = [
  { id: 'vocab', label: 'Vocabulaire', jp: '単語', total: 2048, known: 1120, learning: 540, hard: 168 },
  { id: 'hiragana', label: 'Hiragana', jp: 'ひらがな', total: 46, known: 46, learning: 0, hard: 0 },
  { id: 'katakana', label: 'Katakana', jp: 'カタカナ', total: 46, known: 38, learning: 6, hard: 2 },
  { id: 'kanji', label: 'Kanji', jp: '漢字', total: 512, known: 214, learning: 176, hard: 74 },
]

// Mots maîtrisés cumulés, par semaine (8 dernières semaines)
export const evolution: { week: string; mastered: number }[] = [
  { week: 'S-7', mastered: 640 },
  { week: 'S-6', mastered: 712 },
  { week: 'S-5', mastered: 805 },
  { week: 'S-4', mastered: 918 },
  { week: 'S-3', mastered: 1002 },
  { week: 'S-2', mastered: 1104 },
  { week: 'S-1', mastered: 1230 },
  { week: 'Cette sem.', mastered: 1418 },
]

export type Kana = { kana: string; romaji: string }

export const hiragana: Kana[] = [
  { kana: 'あ', romaji: 'a' }, { kana: 'い', romaji: 'i' }, { kana: 'う', romaji: 'u' },
  { kana: 'え', romaji: 'e' }, { kana: 'お', romaji: 'o' },
  { kana: 'か', romaji: 'ka' }, { kana: 'き', romaji: 'ki' }, { kana: 'く', romaji: 'ku' },
  { kana: 'け', romaji: 'ke' }, { kana: 'こ', romaji: 'ko' },
  { kana: 'さ', romaji: 'sa' }, { kana: 'し', romaji: 'shi' }, { kana: 'す', romaji: 'su' },
  { kana: 'せ', romaji: 'se' }, { kana: 'そ', romaji: 'so' },
  { kana: 'た', romaji: 'ta' }, { kana: 'ち', romaji: 'chi' }, { kana: 'つ', romaji: 'tsu' },
  { kana: 'て', romaji: 'te' }, { kana: 'と', romaji: 'to' },
  { kana: 'な', romaji: 'na' }, { kana: 'に', romaji: 'ni' }, { kana: 'ぬ', romaji: 'nu' },
  { kana: 'ね', romaji: 'ne' }, { kana: 'の', romaji: 'no' },
  { kana: 'は', romaji: 'ha' }, { kana: 'ひ', romaji: 'hi' }, { kana: 'ふ', romaji: 'fu' },
  { kana: 'へ', romaji: 'he' }, { kana: 'ほ', romaji: 'ho' },
  { kana: 'ま', romaji: 'ma' }, { kana: 'み', romaji: 'mi' }, { kana: 'む', romaji: 'mu' },
  { kana: 'め', romaji: 'me' }, { kana: 'も', romaji: 'mo' },
  { kana: 'や', romaji: 'ya' }, { kana: 'ゆ', romaji: 'yu' }, { kana: 'よ', romaji: 'yo' },
  { kana: 'ら', romaji: 'ra' }, { kana: 'り', romaji: 'ri' }, { kana: 'る', romaji: 'ru' },
  { kana: 'れ', romaji: 're' }, { kana: 'ろ', romaji: 'ro' },
  { kana: 'わ', romaji: 'wa' }, { kana: 'を', romaji: 'wo' }, { kana: 'ん', romaji: 'n' },
]

export const katakana: Kana[] = [
  { kana: 'ア', romaji: 'a' }, { kana: 'イ', romaji: 'i' }, { kana: 'ウ', romaji: 'u' },
  { kana: 'エ', romaji: 'e' }, { kana: 'オ', romaji: 'o' },
  { kana: 'カ', romaji: 'ka' }, { kana: 'キ', romaji: 'ki' }, { kana: 'ク', romaji: 'ku' },
  { kana: 'ケ', romaji: 'ke' }, { kana: 'コ', romaji: 'ko' },
  { kana: 'サ', romaji: 'sa' }, { kana: 'シ', romaji: 'shi' }, { kana: 'ス', romaji: 'su' },
  { kana: 'セ', romaji: 'se' }, { kana: 'ソ', romaji: 'so' },
  { kana: 'タ', romaji: 'ta' }, { kana: 'チ', romaji: 'chi' }, { kana: 'ツ', romaji: 'tsu' },
  { kana: 'テ', romaji: 'te' }, { kana: 'ト', romaji: 'to' },
  { kana: 'ナ', romaji: 'na' }, { kana: 'ニ', romaji: 'ni' }, { kana: 'ヌ', romaji: 'nu' },
  { kana: 'ネ', romaji: 'ne' }, { kana: 'ノ', romaji: 'no' },
  { kana: 'ハ', romaji: 'ha' }, { kana: 'ヒ', romaji: 'hi' }, { kana: 'フ', romaji: 'fu' },
  { kana: 'ヘ', romaji: 'he' }, { kana: 'ホ', romaji: 'ho' },
  { kana: 'マ', romaji: 'ma' }, { kana: 'ミ', romaji: 'mi' }, { kana: 'ム', romaji: 'mu' },
  { kana: 'メ', romaji: 'me' }, { kana: 'モ', romaji: 'mo' },
  { kana: 'ヤ', romaji: 'ya' }, { kana: 'ユ', romaji: 'yu' }, { kana: 'ヨ', romaji: 'yo' },
  { kana: 'ラ', romaji: 'ra' }, { kana: 'リ', romaji: 'ri' }, { kana: 'ル', romaji: 'ru' },
  { kana: 'レ', romaji: 're' }, { kana: 'ロ', romaji: 'ro' },
  { kana: 'ワ', romaji: 'wa' }, { kana: 'ヲ', romaji: 'wo' }, { kana: 'ン', romaji: 'n' },
]

// Grammar quiz bank (question / correct / distractors)
export type GrammarQ = {
  prompt: string
  answer: string
  options: string[]
  daily?: boolean
  hard?: boolean
  review?: boolean
}

export const grammarBank: GrammarQ[] = [
  { prompt: 'これ＿ わたしの ちちです。', answer: 'は', options: ['は', 'を', 'に', 'で'], daily: true },
  { prompt: 'ごはん＿ たべます。', answer: 'を', options: ['を', 'は', 'へ', 'が'], hard: true },
  { prompt: 'えき＿ いきます。', answer: 'へ', options: ['へ', 'を', 'は', 'の'], review: true },
  { prompt: 'ともだち＿ はなします。', answer: 'と', options: ['と', 'を', 'に', 'は'] },
  { prompt: 'がっこう＿ べんきょうします。', answer: 'で', options: ['で', 'を', 'へ', 'が'], daily: true },
  { prompt: 'ほん＿ よみます。', answer: 'を', options: ['を', 'に', 'は', 'で'] },
  { prompt: 'あした＿ あめです。', answer: 'は', options: ['は', 'を', 'で', 'へ'], review: true },
  { prompt: 'きれい＿ はな', answer: 'な', options: ['な', 'い', 'の', 'と'], hard: true },
  { prompt: 'たか＿ やま', answer: 'い', options: ['い', 'な', 'を', 'に'] },
  { prompt: 'せんせい＿ しつもんします。', answer: 'に', options: ['に', 'を', 'は', 'で'], hard: true },
]

export const words: Word[] = [
  { id: 'w1', kana: 'ちち', romaji: 'chichi', translation: 'père (le mien)', themes: ['famille'], isNew: true },
  { id: 'w2', kana: 'はは', romaji: 'haha', translation: 'mère (la mienne)', themes: ['famille'] },
  { id: 'w3', kana: 'かぞく', romaji: 'kazoku', translation: 'famille', themes: ['famille'] },
  { id: 'w4', kana: 'ごはん', romaji: 'gohan', translation: 'riz, repas', themes: ['nourriture'] },
  { id: 'w5', kana: 'みず', romaji: 'mizu', translation: 'eau', themes: ['nourriture', 'nature'] },
  { id: 'w6', kana: 'さかな', romaji: 'sakana', translation: 'poisson', themes: ['nourriture', 'nature'] },
  { id: 'w7', kana: 'でんしゃ', romaji: 'densha', translation: 'train', themes: ['voyage', 'ville'] },
  { id: 'w8', kana: 'えき', romaji: 'eki', translation: 'gare', themes: ['voyage', 'ville'] },
  { id: 'w9', kana: 'ひこうき', romaji: 'hikōki', translation: 'avion', themes: ['voyage'] },
  { id: 'w10', kana: 'あさ', romaji: 'asa', translation: 'matin', themes: ['temps'] },
  { id: 'w11', kana: 'よる', romaji: 'yoru', translation: 'nuit, soir', themes: ['temps'] },
  { id: 'w12', kana: 'きょう', romaji: 'kyō', translation: "aujourd'hui", themes: ['temps'] },
  { id: 'w13', kana: 'まち', romaji: 'machi', translation: 'ville, quartier', themes: ['ville'] },
  { id: 'w14', kana: 'みせ', romaji: 'mise', translation: 'magasin, boutique', themes: ['ville'] },
  { id: 'w15', kana: 'やま', romaji: 'yama', translation: 'montagne', themes: ['nature', 'voyage'], isNew: true },
  { id: 'w16', kana: 'かわ', romaji: 'kawa', translation: 'rivière', themes: ['nature'] },
  { id: 'w17', kana: 'き', romaji: 'ki', translation: 'arbre', themes: ['nature'] },
  { id: 'w18', kana: 'そら', romaji: 'sora', translation: 'ciel', themes: ['nature', 'temps'] },
]

export const kanjis: Kanji[] = [
  {
    id: 'k1',
    char: '父',
    on: ['フ'],
    kun: ['ちち'],
    meaning: 'père',
    otherMeanings: ['papa', 'patriarche'],
    strokes: 4,
    jlpt: 'N5',
    themes: ['famille'],
    radical: { char: '父', meaning: 'père' },
    components: ['父'],
    examples: [
      { word: '父母', reading: 'ふぼ', meaning: 'les parents', kind: 'on' },
      { word: 'お父さん', reading: 'おとうさん', meaning: 'papa (poli)', kind: 'kun' },
      { word: '父親', reading: 'ちちおや', meaning: 'le père', kind: 'kun' },
    ],
    isNew: true,
  },
  {
    id: 'k2',
    char: '母',
    on: ['ボ'],
    kun: ['はは'],
    meaning: 'mère',
    otherMeanings: ['maman', 'matrice'],
    strokes: 5,
    jlpt: 'N5',
    themes: ['famille'],
    radical: { char: '毋', meaning: 'mère / ne pas' },
    components: ['毋'],
    examples: [
      { word: '母国', reading: 'ぼこく', meaning: 'pays natal', kind: 'on' },
      { word: 'お母さん', reading: 'おかあさん', meaning: 'maman (poli)', kind: 'kun' },
      { word: '母語', reading: 'ぼご', meaning: 'langue maternelle', kind: 'on' },
    ],
  },
  {
    id: 'k3',
    char: '水',
    on: ['スイ'],
    kun: ['みず'],
    meaning: 'eau',
    otherMeanings: ['liquide', 'mercredi (曜日)'],
    strokes: 4,
    jlpt: 'N5',
    themes: ['nature', 'nourriture'],
    radical: { char: '水', meaning: 'eau' },
    components: ['水'],
    examples: [
      { word: '水曜日', reading: 'すいようび', meaning: 'mercredi', kind: 'on' },
      { word: '水色', reading: 'みずいろ', meaning: 'bleu clair', kind: 'kun' },
      { word: '水道', reading: 'すいどう', meaning: 'eau courante', kind: 'on' },
    ],
  },
  {
    id: 'k4',
    char: '魚',
    on: ['ギョ'],
    kun: ['さかな', 'うお'],
    meaning: 'poisson',
    otherMeanings: ['produit de la mer'],
    strokes: 11,
    jlpt: 'N5',
    themes: ['nourriture', 'nature'],
    radical: { char: '魚', meaning: 'poisson' },
    components: ['⺈', '田', '灬'],
    examples: [
      { word: '金魚', reading: 'きんぎょ', meaning: 'poisson rouge', kind: 'on' },
      { word: '焼き魚', reading: 'やきざかな', meaning: 'poisson grillé', kind: 'kun' },
      { word: '魚屋', reading: 'さかなや', meaning: 'poissonnerie', kind: 'kun' },
    ],
  },
  {
    id: 'k5',
    char: '駅',
    on: ['エキ'],
    kun: [],
    meaning: 'gare',
    otherMeanings: ['station'],
    strokes: 14,
    jlpt: 'N4',
    themes: ['voyage', 'ville'],
    radical: { char: '馬', meaning: 'cheval' },
    components: ['馬', '尺'],
    examples: [
      { word: '駅前', reading: 'えきまえ', meaning: 'devant la gare', kind: 'on' },
      { word: '駅員', reading: 'えきいん', meaning: 'employé de gare', kind: 'on' },
      { word: '東京駅', reading: 'とうきょうえき', meaning: 'gare de Tokyo', kind: 'on' },
    ],
  },
  {
    id: 'k6',
    char: '山',
    on: ['サン'],
    kun: ['やま'],
    meaning: 'montagne',
    otherMeanings: ['mont', 'pic', 'tas'],
    strokes: 3,
    jlpt: 'N5',
    themes: ['nature', 'voyage'],
    radical: { char: '山', meaning: 'montagne' },
    components: ['山'],
    examples: [
      { word: '富士山', reading: 'ふじさん', meaning: 'le mont Fuji', kind: 'on' },
      { word: '山道', reading: 'やまみち', meaning: 'sentier de montagne', kind: 'kun' },
      { word: '火山', reading: 'かざん', meaning: 'volcan', kind: 'on' },
    ],
  },
  {
    id: 'k7',
    char: '川',
    on: ['セン'],
    kun: ['かわ'],
    meaning: 'rivière',
    otherMeanings: ['fleuve', 'cours d\'eau'],
    strokes: 3,
    jlpt: 'N5',
    themes: ['nature'],
    radical: { char: '川', meaning: 'rivière' },
    components: ['川'],
    examples: [
      { word: '河川', reading: 'かせん', meaning: 'cours d\'eau', kind: 'on' },
      { word: '小川', reading: 'おがわ', meaning: 'ruisseau', kind: 'kun' },
      { word: '川口', reading: 'かわぐち', meaning: 'embouchure', kind: 'kun' },
    ],
  },
  {
    id: 'k8',
    char: '朝',
    on: ['チョウ'],
    kun: ['あさ'],
    meaning: 'matin',
    otherMeanings: ['dynastie', 'aube'],
    strokes: 12,
    jlpt: 'N4',
    themes: ['temps'],
    radical: { char: '月', meaning: 'lune / mois' },
    components: ['龺', '月'],
    examples: [
      { word: '朝食', reading: 'ちょうしょく', meaning: 'petit-déjeuner', kind: 'on' },
      { word: '毎朝', reading: 'まいあさ', meaning: 'chaque matin', kind: 'kun' },
      { word: '今朝', reading: 'けさ', meaning: 'ce matin', kind: 'kun' },
    ],
  },
  {
    id: 'k9',
    char: '町',
    on: ['チョウ'],
    kun: ['まち'],
    meaning: 'ville',
    otherMeanings: ['quartier', 'bourg'],
    strokes: 7,
    jlpt: 'N4',
    themes: ['ville'],
    radical: { char: '田', meaning: 'rizière / champ' },
    components: ['田', '丁'],
    examples: [
      { word: '町長', reading: 'ちょうちょう', meaning: 'maire de la ville', kind: 'on' },
      { word: '下町', reading: 'したまち', meaning: 'quartier populaire', kind: 'kun' },
      { word: '町中', reading: 'まちなか', meaning: 'centre-ville', kind: 'kun' },
    ],
  },
  {
    id: 'k10',
    char: '空',
    on: ['クウ'],
    kun: ['そら', 'あ.く', 'から'],
    meaning: 'ciel',
    otherMeanings: ['vide', 'air', 'vacant'],
    strokes: 8,
    jlpt: 'N5',
    themes: ['nature', 'temps'],
    radical: { char: '穴', meaning: 'grotte / trou' },
    components: ['穴', '工'],
    examples: [
      { word: '空港', reading: 'くうこう', meaning: 'aéroport', kind: 'on' },
      { word: '青空', reading: 'あおぞら', meaning: 'ciel bleu', kind: 'kun' },
      { word: '空手', reading: 'からて', meaning: 'karaté (mains vides)', kind: 'kun' },
    ],
    isNew: true,
  },
]

export const rules: Rule[] = [
  {
    id: 'r1',
    title: 'La particule は (wa) — le thème',
    category: 'Particules',
    themes: ['famille', 'ville'],
    body: 'La particule は, prononcée « wa » dans ce contexte, marque le thème de la phrase — ce dont on parle. Elle se place après le mot qu\'elle isole : わたしは がくせいです (Watashi wa gakusei desu) → « Moi, je suis étudiant(e) ». Le thème n\'est pas forcément le sujet grammatical ; c\'est le cadre de référence de l\'énoncé.',
    exercises: ['e1'],
    isNew: true,
  },
  {
    id: 'r2',
    title: 'La particule を (o) — le complément d\'objet',
    category: 'Particules',
    themes: ['nourriture'],
    body: 'La particule を marque le complément d\'objet direct du verbe. Elle se lit « o ». Exemple : ごはんを たべます (Gohan o tabemasu) → « Je mange du riz ». Elle précède toujours immédiatement le verbe d\'action.',
    exercises: ['e2'],
  },
  {
    id: 'r3',
    title: 'La forme て (te) — enchaîner les actions',
    category: 'Conjugaison',
    themes: ['voyage', 'temps'],
    body: 'La forme en て permet d\'enchaîner deux actions, de formuler une demande polie (〜てください) ou l\'aspect progressif (〜ています). La transformation dépend de la terminaison du verbe : たべる → たべて, のむ → のんで, いく → いって (irrégulier).',
    exercises: ['e3'],
  },
  {
    id: 'r4',
    title: 'Les adjectifs en い et en な',
    category: 'Adjectifs',
    themes: ['nature', 'ville'],
    body: 'Le japonais distingue deux classes d\'adjectifs. Les adjectifs en い se conjuguent (たかい → たかかった). Les adjectifs en な s\'appuient sur です et prennent な devant un nom (きれいな はな → « une belle fleur »).',
    exercises: ['e4'],
  },
  {
    id: 'r5',
    title: 'Compter avec les spécificatifs',
    category: 'Nombres',
    themes: ['nourriture', 'ville'],
    body: 'Pour compter en japonais, on ajoute un classificateur adapté à l\'objet : 〜つ (objets généraux), 〜人 (personnes), 〜本 (objets longs), 〜枚 (objets plats). Exemple : りんごを みっつ ください → « Trois pommes, s\'il vous plaît ».',
    exercises: [],
  },
]

export const exercises: Exercise[] = [
  {
    id: 'e1',
    title: 'Repérer le thème',
    subject: 'Particule は',
    date: '2026-08-10',
    themes: ['famille'],
    prompt: 'Complétez chaque phrase avec la particule du thème et traduisez.',
    questions: [
      { q: 'これ＿＿ わたしの ちちです。', a: 'これは わたしの ちちです。— « Ceci, c\'est mon père. »' },
      { q: 'かぞく＿＿ よにんです。', a: 'かぞくは よにんです。— « Ma famille compte quatre personnes. »' },
    ],
    isNew: true,
  },
  {
    id: 'e2',
    title: 'Objet direct au marché',
    subject: 'Particule を',
    date: '2026-08-06',
    themes: ['nourriture'],
    prompt: 'Choisissez le complément et construisez la phrase.',
    questions: [
      { q: 'みず＿＿ のみます。', a: 'みずを のみます。— « Je bois de l\'eau. »' },
      { q: 'さかな＿＿ たべます。', a: 'さかなを たべます。— « Je mange du poisson. »' },
    ],
  },
  {
    id: 'e3',
    title: 'Itinéraire à la gare',
    subject: 'Forme て',
    date: '2026-07-22',
    themes: ['voyage'],
    prompt: 'Mettez le verbe entre parenthèses à la forme て.',
    questions: [
      { q: 'えきまで (いく) 、でんしゃに のります。', a: 'えきまで いって、でんしゃに のります。' },
      { q: 'きっぷを (かう) 、ホームへ いきます。', a: 'きっぷを かって、ホームへ いきます。' },
    ],
  },
  {
    id: 'e4',
    title: 'Décrire un paysage',
    subject: 'Adjectifs い / な',
    date: '2026-05-30',
    themes: ['nature'],
    prompt: 'Accordez correctement l\'adjectif devant le nom.',
    questions: [
      { q: '(たかい) やま', a: 'たかい やま — « une haute montagne »' },
      { q: '(きれい) そら', a: 'きれいな そら — « un ciel magnifique »' },
    ],
  },
]

export const sentences: Sentence[] = [
  {
    id: 's1',
    kana: 'これは わたしの かぞくです。',
    romaji: 'Kore wa watashi no kazoku desu.',
    translation: 'Voici ma famille.',
    themes: ['famille'],
  },
  {
    id: 's2',
    kana: 'まいあさ ごはんを たべます。',
    romaji: 'Maiasa gohan o tabemasu.',
    translation: 'Je mange du riz chaque matin.',
    themes: ['nourriture', 'temps'],
  },
  {
    id: 's3',
    kana: 'えきで でんしゃを まちます。',
    romaji: 'Eki de densha o machimasu.',
    translation: "J'attends le train à la gare.",
    themes: ['voyage', 'ville'],
  },
  {
    id: 's4',
    kana: 'やまの うえに そらが ひろがります。',
    romaji: 'Yama no ue ni sora ga hirogarimasu.',
    translation: 'Le ciel s\'étend au-dessus de la montagne.',
    themes: ['nature'],
  },
  {
    id: 's5',
    kana: 'よる、まちが とても しずかです。',
    romaji: 'Yoru, machi ga totemo shizuka desu.',
    translation: 'La nuit, la ville est très calme.',
    themes: ['ville', 'temps'],
  },
  {
    id: 's6',
    kana: 'みずを もう いっぱい ください。',
    romaji: 'Mizu o mō ippai kudasai.',
    translation: 'Un autre verre d\'eau, s\'il vous plaît.',
    themes: ['nourriture'],
  },
]
