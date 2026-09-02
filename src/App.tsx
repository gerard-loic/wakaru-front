import { useMemo, useState } from 'react'
import wakaruLogo from '@/imports/image.png'
import {
  themes,
  words,
  kanjis,
  rules,
  exercises,
  sentences,
  hiragana,
  katakana,
  grammarBank,
  ambiance,
  stats,
  evolution,
  type StatCat as StatCatType,
  type Theme,
  type Kanji,
  type KanjiExample,
  type Rule,
  type Exercise,
} from './data'

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

const themeTitle = (id: string) => themes.find((t) => t.id === id)?.title ?? id

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'
  u.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

function Tag({ id, onClick }: { id: string; onClick?: (id: string) => void }) {
  return (
    <button
      onClick={onClick ? () => onClick(id) : undefined}
      className={
        'mono text-[10px] uppercase tracking-[0.12em] px-2 py-[3px] border border-line text-fog ' +
        'transition-colors hover:border-ember hover:text-ember ' +
        (onClick ? 'cursor-pointer' : 'cursor-default')
      }
    >
      {themeTitle(id)}
    </button>
  )
}

function SpeakBtn({ text, big }: { text: string; big?: boolean }) {
  const [on, setOn] = useState(false)
  return (
    <button
      onClick={() => {
        speak(text)
        setOn(true)
        setTimeout(() => setOn(false), 600)
      }}
      title="Écouter"
      className={
        'grid place-items-center border border-line text-fog transition-all ' +
        'hover:border-ember hover:text-ember active:scale-95 ' +
        (on ? 'border-ember text-ember bg-ember/10 ' : '') +
        (big ? 'size-11' : 'size-8')
      }
    >
      <svg
        width={big ? 18 : 14}
        height={big ? 18 : 14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M19 5a9 9 0 0 1 0 14" />
      </svg>
    </button>
  )
}

function SectionHead({
  index,
  title,
  jp,
  count,
  children,
}: {
  index: string
  title: string
  jp: string
  count?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5 mb-6">
      <div className="flex items-end gap-4">
        <span className="mono text-ember text-sm mb-1">{index}</span>
        <div>
          <div className="jp text-fog text-sm mb-1">{jp}</div>
          <h1 className="display text-4xl font-800 tracking-tight leading-none">{title}</h1>
        </div>
        {count && (
          <span className="mono text-xs text-fog mb-1 hidden sm:block">/ {count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function Search({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-fog"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mono text-xs bg-panel border border-line pl-9 pr-3 py-2.5 w-full md:w-72 text-chalk placeholder:text-fog/60 outline-none focus:border-ember transition-colors"
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Auth screen                                                         */
/* ------------------------------------------------------------------ */

function Auth({ onEnter }: { onEnter: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  return (
    <div className="h-full grid lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-wakaru overflow-hidden">
        <div
          className="absolute -right-10 bottom-[-4rem] jp text-ink/10 leading-none select-none pointer-events-none"
          style={{ fontSize: '26rem' }}
        >
          分
        </div>
        <div className="relative jp text-ink/70 text-sm tracking-[0.28em] uppercase">
          分かる・日本語
        </div>

        <div className="relative flex flex-col items-center text-center -mt-8">
          <img
            src={wakaruLogo}
            alt="Wakaru"
            className="w-[min(28rem,80%)] h-auto object-contain"
          />
          <div className="jp text-ink text-2xl mt-6 mb-3">言葉は世界への扉。</div>
          <h2 className="display text-ink text-4xl font-900 leading-[0.95] tracking-tight max-w-md">
            Apprends le japonais, un caractère à la fois.
          </h2>
        </div>

        <div className="relative mono text-[11px] text-ink/75 flex gap-4 justify-center">
          <span>2 048 mots</span>
          <span className="text-ink">•</span>
          <span>512 kanji</span>
          <span className="text-ink">•</span>
          <span>N5 → N2</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onEnter()
          }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <div className="mono text-[11px] uppercase tracking-[0.2em] text-ember mb-2">
            {mode === 'login' ? 'ログイン / Connexion' : '新規登録 / Inscription'}
          </div>
          <h1 className="display text-3xl font-800 mb-8">
            {mode === 'login' ? 'Bon retour.' : 'Rejoins-nous.'}
          </h1>

          <div className="space-y-4">
            {mode === 'signup' && (
              <Field label="Nom d'utilisateur" placeholder="haruki_92" />
            )}
            <Field label="Adresse e-mail" placeholder="toi@exemple.jp" type="email" />
            <Field label="Mot de passe" placeholder="••••••••" type="password" />
          </div>

          <button
            type="submit"
            className="mono text-sm uppercase tracking-[0.1em] w-full mt-8 py-3.5 bg-ember text-ink font-600 transition-all hover:bg-ember-soft active:scale-[0.99]"
          >
            {mode === 'login' ? 'Entrer' : 'Créer mon compte'} →
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-line" />
            <span className="mono text-[10px] text-fog uppercase">ou</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={onEnter}
            className="mono text-xs w-full py-3 border border-line text-fog hover:border-line-bright hover:text-chalk transition-colors"
          >
            Continuer avec Google
          </button>

          <p className="text-sm text-fog mt-8 text-center">
            {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà inscrit ? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-ember hover:text-ember-soft underline underline-offset-4"
            >
              {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  placeholder,
  type = 'text',
}: {
  label: string
  placeholder: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="mono text-[10px] uppercase tracking-[0.12em] text-fog">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full bg-panel border border-line px-3.5 py-3 text-chalk placeholder:text-fog/50 outline-none focus:border-ember transition-colors"
      />
    </label>
  )
}

function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const h = size === 'lg' ? 'h-14' : 'h-10'
  return (
    <div className="flex items-center gap-3">
      <img
        src={wakaruLogo}
        alt="Wakaru — logo"
        className={h + ' w-auto object-contain'}
      />
      <span className="jp text-[9px] text-fog tracking-[0.28em] uppercase leading-none hidden sm:block">
        分かる・日本語
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

type NavKey =
  | 'dashboard'
  | 'vocab'
  | 'hiragana'
  | 'katakana'
  | 'themes'
  | 'kanji'
  | 'grammar'
  | 'exercises'
  | 'sentences'

const NAV: { key: NavKey; label: string; jp: string; Icon: React.FC }[] = [
  { key: 'dashboard', label: 'Tableau de bord', jp: 'ダッシュボード', Icon: IconDash },
  { key: 'vocab', label: 'Vocabulaire', jp: '単語', Icon: IconWord },
  { key: 'hiragana', label: 'Hiragana', jp: 'ひらがな', Icon: IconKana },
  { key: 'katakana', label: 'Katakana', jp: 'カタカナ', Icon: IconKana },
  { key: 'themes', label: 'Thèmes', jp: 'テーマ', Icon: IconGrid },
  { key: 'kanji', label: 'Kanji', jp: '漢字', Icon: IconBrush },
  { key: 'grammar', label: 'Grammaire', jp: '文法', Icon: IconRule },
  { key: 'exercises', label: 'Exercices', jp: '練習', Icon: IconCheck },
  { key: 'sentences', label: 'Phrases', jp: '例文', Icon: IconQuote },
]

function Sidebar({
  active,
  onNav,
  onLogout,
  onPractice,
}: {
  active: NavKey
  onNav: (k: NavKey) => void
  onLogout: () => void
  onPractice: () => void
}) {
  return (
    <aside className="w-64 shrink-0 bg-panel border-r border-line flex flex-col h-full">
      <div className="p-5 border-b border-line">
        <Logo />
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-5">
          <button
            onClick={onPractice}
            className="group w-full flex items-center gap-3 px-3 py-3 bg-ember text-ink transition-colors hover:bg-ember-soft"
          >
            <span className="jp text-lg leading-none">練習</span>
            <span className="flex-1 text-left">
              <span className="block text-sm font-600 leading-tight">M'exercer</span>
              <span className="mono text-[10px] leading-tight opacity-70">Quiz · 20 questions</span>
            </span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        <div className="mono text-[10px] uppercase tracking-[0.16em] text-fog px-5 mb-2">
          Bibliothèque
        </div>
        {NAV.map((n, i) => {
          const on = active === n.key
          const newCount = newCountFor(n.key)
          return (
            <button
              key={n.key}
              onClick={() => onNav(n.key)}
              className={
                'group w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors relative ' +
                (on ? 'text-chalk bg-panel-2' : 'text-fog hover:text-chalk hover:bg-panel-2/50')
              }
            >
              <span
                className={
                  'absolute left-0 top-0 bottom-0 w-[3px] transition-all ' +
                  (on ? 'bg-ember' : 'bg-transparent group-hover:bg-line-bright')
                }
              />
              <span className={on ? 'text-ember' : 'text-fog group-hover:text-chalk'}>
                <n.Icon />
              </span>
              <span className="flex-1">
                <span className="block text-sm leading-tight">{n.label}</span>
                <span className="jp text-[10px] text-fog leading-tight">{n.jp}</span>
              </span>
              {newCount > 0 ? (
                <span
                  title={`${newCount} nouveau${newCount > 1 ? 'x' : ''}`}
                  className="mono text-[10px] font-700 min-w-5 h-5 px-1 grid place-items-center bg-ember text-ink rounded-full leading-none"
                >
                  {newCount}
                </span>
              ) : (
                <span className="mono text-[10px] text-fog">{String(i + 1).padStart(2, '0')}</span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-line">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="size-9 grid place-items-center bg-ember-dim border border-ember/40 jp text-ember font-700">
            春
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm truncate">Haruki T.</div>
            <div className="mono text-[10px] text-fog">Niveau N4 · 68%</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mono text-[11px] uppercase tracking-[0.1em] w-full py-2 border border-line text-fog hover:border-ember hover:text-ember transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/* 1 — Vocabulary                                                      */
/* ------------------------------------------------------------------ */

function VocabView({
  onTheme,
  onExercise,
}: {
  onTheme: (id: string) => void
  onExercise: () => void
}) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return words.filter((w) => {
      if (!t) return true
      return (
        w.kana.includes(t) ||
        w.romaji.toLowerCase().includes(t) ||
        w.translation.toLowerCase().includes(t) ||
        w.themes.some((id) => themeTitle(id).toLowerCase().includes(t))
      )
    })
  }, [q])

  return (
    <div>
      <SectionHead index="01" title="Vocabulaire" jp="単語リスト" count={`${words.length} mots`}>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            <ExerciseCta onClick={onExercise} />
            <Search value={q} onChange={setQ} placeholder="Rechercher un mot ou un thème…" />
          </div>
          <MasteryLegend />
        </div>
      </SectionHead>

      <div className="border border-line divide-y divide-line">
        <div className="hidden md:grid grid-cols-[1.4fr_1fr_2fr_auto] gap-4 px-4 py-2.5 bg-panel mono text-[10px] uppercase tracking-[0.12em] text-fog">
          <span>Hiragana</span>
          <span>Rōmaji</span>
          <span>Traduction · Thèmes</span>
          <span>Audio</span>
        </div>
        {filtered.map((w) => (
          <div
            key={w.id}
            className="grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_1fr_2fr_auto] gap-4 px-4 py-3.5 items-center hover:bg-panel/60 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <MasteryDot level={masteryOf(w.id)} />
              <span className="jp text-2xl group-hover:text-ember transition-colors">{w.kana}</span>
            </div>
            <div className="mono text-sm text-fog hidden md:block">{w.romaji}</div>
            <div className="col-start-1 md:col-start-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{w.translation}</span>
                {w.isNew && <NewTag />}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {w.themes.map((t) => (
                  <Tag key={t} id={t} onClick={onTheme} />
                ))}
              </div>
            </div>
            <div className="row-start-1 col-start-2 md:row-auto md:col-auto justify-self-end">
              <SpeakBtn text={w.kana} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <Empty />}
      </div>
    </div>
  )
}

function ThemeFilter({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const opts = [{ id: 'all', title: 'Tous' }, ...themes.map((t) => ({ id: t.id, title: t.title }))]
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={
            'mono text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 border transition-colors ' +
            (value === o.id
              ? 'bg-ember border-ember text-ink'
              : 'border-line text-fog hover:border-line-bright hover:text-chalk')
          }
        >
          {o.title}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 2 — Themes                                                          */
/* ------------------------------------------------------------------ */

// Deterministic « exercices faits » per theme (stable between renders).
function exoProgress(t: Theme): { done: number; total: number } {
  const total = t.count.exercises
  if (total === 0) return { done: 0, total }
  let h = 0
  for (let i = 0; i < t.id.length; i++) h = (h * 31 + t.id.charCodeAt(i)) >>> 0
  return { done: h % (total + 1), total }
}

function ExoProgress({ t, compact = false }: { t: Theme; compact?: boolean }) {
  const { done, total } = exoProgress(t)
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div className={compact ? '' : 'w-full'}>
      <div className="flex items-center justify-between mono text-[10px] uppercase tracking-[0.08em] text-fog mb-1.5">
        <span>Exercices</span>
        <span className={done === total ? 'text-emerald-300' : 'text-ember'}>
          {done}/{total} faits
        </span>
      </div>
      <div className="h-1.5 bg-line overflow-hidden">
        <div
          className={'h-full transition-all duration-500 ' + (done === total ? 'bg-emerald-400' : 'bg-ember')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ThemesView({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div>
      <SectionHead index="02" title="Thèmes" jp="テーマ一覧" count={`${themes.length} thèmes`} />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => onOpen(t.id)}
            className="group text-left border border-line bg-panel hover:border-ember transition-colors overflow-hidden"
          >
            <div className="relative aspect-[3/2] bg-panel-2 overflow-hidden">
              <img
                src={t.image}
                alt={t.title}
                className="size-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <span className="absolute top-3 left-3 mono text-[10px] uppercase tracking-[0.12em] bg-ink/80 border border-line px-2 py-1 text-fog">
                {t.count.words + t.count.kanji} entrées
              </span>
              {t.isNew && <NewTag className="absolute top-3 right-3" />}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="display text-xl font-700 leading-tight group-hover:text-ember transition-colors">
                  {t.title}
                </h3>
                <span className="text-ember mt-1 shrink-0 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
              <div className="mono text-[10px] text-fog mt-3 mb-4">{formatDate(t.date)}</div>
              <ExoProgress t={t} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* Weekly programme (planning) for a theme */

type PlanKind = 'exercice' | 'vocab' | 'kanji' | 'hiragana' | 'katakana' | 'phrases'

const PLAN_META: Record<PlanKind, { glyph: string; label: string }> = {
  exercice: { glyph: '練', label: 'Exercice' },
  vocab: { glyph: '単', label: 'Vocabulaire' },
  kanji: { glyph: '漢', label: 'Kanji' },
  hiragana: { glyph: 'あ', label: 'Hiragana' },
  katakana: { glyph: 'ア', label: 'Katakana' },
  phrases: { glyph: '例', label: 'Phrases' },
}

const WEEK_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

type PlanTask = { kind: PlanKind; label: string; detail: string; done: boolean }

function seededRandom(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildWeekPlan(themeId: string): PlanTask[][] {
  const t = themes.find((x) => x.id === themeId)!
  const te = exercises.filter((e) => e.themes.includes(themeId))
  const tw = words.filter((w) => w.themes.includes(themeId))
  const tk = kanjis.filter((k) => k.themes.includes(themeId))
  const ts = sentences.filter((s) => s.themes.includes(themeId))

  const pool: Omit<PlanTask, 'done'>[] = [
    ...te.map((e) => ({ kind: 'exercice' as PlanKind, label: e.title, detail: e.subject })),
    { kind: 'vocab', label: 'Révision de vocabulaire', detail: `${tw.length} mots du thème` },
    { kind: 'kanji', label: 'Révision des kanji', detail: `${tk.length} kanji du thème` },
    { kind: 'phrases', label: 'Révision des phrases', detail: `${ts.length} phrases types` },
    { kind: 'hiragana', label: 'Révision des hiragana', detail: '46 caractères de base' },
    { kind: 'katakana', label: 'Révision des katakana', detail: '46 caractères de base' },
  ]

  const rnd = seededRandom(t.id)
  const week: PlanTask[][] = []
  for (let d = 0; d < 7; d++) {
    const day: PlanTask[] = []
    const used = new Set<number>()
    while (day.length < 3) {
      let idx = Math.floor(rnd() * pool.length)
      if (used.has(idx) && used.size < pool.length) {
        idx = (idx + 1) % pool.length
        continue
      }
      used.add(idx)
      // past days mostly done, today partial, future to do
      const done = d < 2 ? rnd() > 0.15 : d === 2 ? rnd() > 0.6 : false
      day.push({ ...pool[idx], done })
    }
    week.push(day)
  }
  return week
}

function WeekPlan({ themeId }: { themeId: string }) {
  const week = useMemo(() => buildWeekPlan(themeId), [themeId])
  const all = week.flat()
  const done = all.filter((t) => t.done).length
  const todayIdx = (new Date().getDay() + 6) % 7 // Monday = 0

  return (
    <div>
      <div className="border border-line bg-panel p-4 mb-5 flex items-center justify-between">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.12em] text-fog">
            Programme de la semaine
          </div>
          <div className="text-sm mt-1">3 exercices par jour · {all.length} au total</div>
        </div>
        <div className="text-right">
          <div className="display font-900 text-2xl leading-none text-ember">
            {done}
            <span className="text-fog text-base">/{all.length}</span>
          </div>
          <div className="mono text-[10px] text-fog uppercase">effectués</div>
        </div>
      </div>

      <div className="space-y-4">
        {week.map((day, i) => {
          const isToday = i === todayIdx
          return (
            <div key={i} className={'border ' + (isToday ? 'border-ember' : 'border-line')}>
              <div
                className={
                  'flex items-center gap-3 px-4 py-2.5 border-b ' +
                  (isToday ? 'border-ember/40 bg-ember/10' : 'border-line bg-panel')
                }
              >
                <span className="mono text-[11px] uppercase tracking-[0.14em] text-chalk">
                  {WEEK_DAYS[i]}
                </span>
                {isToday && (
                  <span className="mono text-[9px] uppercase tracking-[0.12em] text-ember border border-ember/50 px-1.5 py-0.5">
                    Aujourd'hui
                  </span>
                )}
                <span className="mono text-[10px] text-fog ml-auto">
                  {day.filter((t) => t.done).length}/3
                </span>
              </div>
              <div className="divide-y divide-line">
                {day.map((task, j) => (
                  <div key={j} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className="jp text-lg w-9 h-9 shrink-0 grid place-items-center border border-line text-ember"
                      title={PLAN_META[task.kind].label}
                    >
                      {PLAN_META[task.kind].glyph}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{task.label}</div>
                      <div className="mono text-[10px] text-fog truncate">
                        {PLAN_META[task.kind].label} · {task.detail}
                      </div>
                    </div>
                    <StatusPill done={task.done} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ThemeDetail({
  theme,
  onBack,
  onOpenKanji,
  onOpenRule,
  onOpenExercise,
}: {
  theme: Theme
  onBack: () => void
  onOpenKanji: (id: string) => void
  onOpenRule: (id: string) => void
  onOpenExercise: (id: string) => void
}) {
  const [tab, setTab] = useState<
    'plan' | 'vocab' | 'kanji' | 'grammar' | 'sentences' | 'exercises'
  >('plan')
  const tw = words.filter((w) => w.themes.includes(theme.id))
  const tk = kanjis.filter((k) => k.themes.includes(theme.id))
  const tr = rules.filter((r) => r.themes.includes(theme.id))
  const ts = sentences.filter((s) => s.themes.includes(theme.id))
  const te = exercises.filter((e) => e.themes.includes(theme.id))

  const tabs = [
    { key: 'plan', label: 'Programme', n: undefined as number | undefined },
    { key: 'vocab', label: 'Vocabulaire', n: tw.length },
    { key: 'kanji', label: 'Kanji', n: tk.length },
    { key: 'grammar', label: 'Grammaire', n: tr.length },
    { key: 'sentences', label: 'Phrases', n: ts.length },
    { key: 'exercises', label: 'Exercices', n: te.length },
  ] as const

  return (
    <div>
      <BackBar onBack={onBack} label="Thèmes" />
      <div className="relative border border-line overflow-hidden mb-6">
        <div className="aspect-[16/5] bg-panel-2">
          <img src={theme.image} alt={theme.title} className="size-full object-cover grayscale-[30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        </div>
        <div className="absolute bottom-0 left-0 p-6">
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-2">
            Thème · {formatDate(theme.date)}
          </div>
          <h1 className="display text-4xl md:text-5xl font-900 tracking-tight">{theme.title}</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-start mb-8">
        <p className="text-sm text-chalk/80 leading-relaxed max-w-2xl">
          {ambiance[theme.id]}
        </p>
        <div className="lg:w-64 border border-line bg-panel p-4">
          <ExoProgress t={theme} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-line mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              'mono text-xs uppercase tracking-[0.08em] px-4 py-3 border-b-2 -mb-px transition-colors ' +
              (tab === t.key
                ? 'border-ember text-ember'
                : 'border-transparent text-fog hover:text-chalk')
            }
          >
            {t.label}
            {t.n !== undefined && <span className="text-fog/70"> ({t.n})</span>}
          </button>
        ))}
      </div>

      {tab === 'plan' && <WeekPlan themeId={theme.id} />}

      {tab === 'vocab' && (
        <div className="border border-line divide-y divide-line">
          {tw.map((w) => (
            <div key={w.id} className="flex items-center gap-4 px-4 py-3">
              <div className="jp text-xl min-w-24">{w.kana}</div>
              <div className="mono text-xs text-fog min-w-24 hidden sm:block">{w.romaji}</div>
              <div className="flex-1 text-sm">{w.translation}</div>
              <SpeakBtn text={w.kana} />
            </div>
          ))}
        </div>
      )}

      {tab === 'kanji' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tk.map((k) => (
            <KanjiCard key={k.id} k={k} onOpen={onOpenKanji} />
          ))}
        </div>
      )}

      {tab === 'grammar' && (
        <div className="space-y-3">
          {tr.map((r) => (
            <RuleRow key={r.id} r={r} onOpen={onOpenRule} />
          ))}
        </div>
      )}

      {tab === 'sentences' && (
        <div className="space-y-3">
          {ts.map((s) => (
            <div key={s.id} className="border border-line p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="jp text-xl leading-relaxed">{s.kana}</p>
                <SpeakBtn text={s.kana} />
              </div>
              <p className="mono text-xs text-fog mt-2">{s.romaji}</p>
              <p className="text-sm text-fog mt-1">{s.translation}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'exercises' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {te.map((e) => (
            <ExerciseCard key={e.id} e={e} onOpen={onOpenExercise} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 3 — Kanji                                                           */
/* ------------------------------------------------------------------ */

function KanjiCard({ k, onOpen }: { k: Kanji; onOpen: (id: string) => void }) {
  return (
    <button
      onClick={() => onOpen(k.id)}
      className="group text-left border border-line bg-panel hover:border-ember transition-colors p-4 flex gap-4"
    >
      <div className="relative jp text-6xl leading-none font-500 group-hover:text-ember transition-colors">
        <MasteryDot level={masteryOf(k.id)} className="absolute -top-1 -left-1" />
        {k.char}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mono text-[10px] text-fog uppercase">On</div>
        <div className="jp text-sm mb-1 truncate">{k.on.join('・') || '—'}</div>
        <div className="mono text-[10px] text-fog uppercase">Kun</div>
        <div className="jp text-sm truncate">{k.kun.join('・') || '—'}</div>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
        <div className="mono text-[10px] text-ember border border-ember/40 px-1.5 py-0.5">
          {k.jlpt}
        </div>
        {k.isNew && <NewTag />}
      </div>
    </button>
  )
}

type ExampleEntry = KanjiExample & { kanjiId: string; kanjiChar: string }

const kanjiWords: ExampleEntry[] = kanjis.flatMap((k) =>
  (k.examples ?? []).map((ex) => ({ ...ex, kanjiId: k.id, kanjiChar: k.char })),
)

function KanjiView({
  onOpen,
  onTheme,
  onExercise,
}: {
  onOpen: (id: string) => void
  onTheme: (id: string) => void
  onExercise: () => void
}) {
  const [tab, setTab] = useState<'kanji' | 'words'>('kanji')
  const [q, setQ] = useState('')
  const [qw, setQw] = useState('')

  const filtered = kanjis.filter((k) => {
    const t = q.trim().toLowerCase()
    if (!t) return true
    return (
      k.char.includes(t) ||
      k.meaning.toLowerCase().includes(t) ||
      k.on.some((o) => o.includes(t)) ||
      k.kun.some((o) => o.includes(t)) ||
      k.themes.some((id) => themeTitle(id).toLowerCase().includes(t))
    )
  })

  const filteredWords = kanjiWords.filter((w) => {
    const t = qw.trim().toLowerCase()
    if (!t) return true
    return (
      w.word.includes(t) ||
      w.reading.includes(t) ||
      w.meaning.toLowerCase().includes(t) ||
      w.kanjiChar.includes(t)
    )
  })

  const tabs: { key: 'kanji' | 'words'; label: string; n: number }[] = [
    { key: 'kanji', label: 'Kanji', n: kanjis.length },
    { key: 'words', label: 'Mots-exemples', n: kanjiWords.length },
  ]

  return (
    <div>
      <SectionHead index="03" title="Kanji" jp="漢字リスト" count={`${kanjis.length} kanji`}>
        <ExerciseCta onClick={onExercise} />
      </SectionHead>

      <div className="flex flex-wrap gap-1 border-b border-line mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              'mono text-xs uppercase tracking-[0.08em] px-4 py-3 border-b-2 -mb-px transition-colors ' +
              (tab === t.key
                ? 'border-ember text-ember'
                : 'border-transparent text-fog hover:text-chalk')
            }
          >
            {t.label}
            <span className="text-fog/70"> ({t.n})</span>
          </button>
        ))}
      </div>

      {tab === 'kanji' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <MasteryLegend />
            <Search value={q} onChange={setQ} placeholder="Rechercher un kanji ou un thème…" />
          </div>
          <div className="border border-line divide-y divide-line">
            <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1.5fr] gap-4 px-4 py-2.5 bg-panel mono text-[10px] uppercase tracking-[0.12em] text-fog">
              <span className="w-14">Kanji</span>
              <span>Lecture ON</span>
              <span>Lecture KUN</span>
              <span>Sens · Thèmes</span>
            </div>
            {filtered.map((k) => (
              <button
                key={k.id}
                onClick={() => onOpen(k.id)}
                className="w-full text-left grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_1fr_1.5fr] gap-4 px-4 py-3.5 items-center hover:bg-panel/60 transition-colors group"
              >
                <div className="relative jp text-4xl w-14 leading-none group-hover:text-ember transition-colors">
                  <MasteryDot level={masteryOf(k.id)} className="absolute -top-1 -right-1" />
                  {k.char}
                </div>
                <div className="jp text-sm text-fog hidden md:block">{k.on.join('・') || '—'}</div>
                <div className="jp text-sm text-fog hidden md:block">{k.kun.join('・') || '—'}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{k.meaning}</span>
                    {k.isNew && <NewTag />}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {k.themes.map((t) => (
                      <span
                        key={t}
                        onClick={(e) => {
                          e.stopPropagation()
                          onTheme(t)
                        }}
                        className="mono text-[10px] uppercase tracking-[0.12em] px-2 py-[3px] border border-line text-fog hover:border-ember hover:text-ember transition-colors"
                      >
                        {themeTitle(t)}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <Empty />}
          </div>
        </div>
      )}

      {tab === 'words' && (
        <div>
          <div className="flex justify-end mb-4">
            <Search value={qw} onChange={setQw} placeholder="Rechercher un mot-exemple…" />
          </div>
          <div className="border border-line divide-y divide-line">
            <div className="hidden md:grid grid-cols-[auto_1.3fr_1fr_1.4fr_auto] gap-4 px-4 py-2.5 bg-panel mono text-[10px] uppercase tracking-[0.12em] text-fog">
              <span className="w-10">Kanji</span>
              <span>Mot</span>
              <span>Lecture</span>
              <span>Sens</span>
              <span>Audio</span>
            </div>
            {filteredWords.map((w) => (
              <div
                key={w.kanjiId + w.word}
                className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1.3fr_1fr_1.4fr_auto] gap-4 px-4 py-3 items-center"
              >
                <button
                  onClick={() => onOpen(w.kanjiId)}
                  className="jp text-2xl w-10 leading-none text-chalk hover:text-ember transition-colors"
                  title="Voir le kanji"
                >
                  {w.kanjiChar}
                </button>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="jp text-lg truncate">{w.word}</span>
                  <span
                    className={`mono text-[9px] uppercase tracking-[0.1em] px-1 py-0.5 border shrink-0 ${
                      w.kind === 'on' ? 'text-ember border-ember/40' : 'text-fog border-line-bright'
                    }`}
                  >
                    {w.kind === 'on' ? 'ON' : 'KUN'}
                  </span>
                </div>
                <div className="jp text-sm text-fog hidden md:block truncate">{w.reading}</div>
                <div className="text-sm hidden md:block truncate">{w.meaning}</div>
                <div className="justify-self-end">
                  <SpeakBtn text={w.word} />
                </div>
              </div>
            ))}
            {filteredWords.length === 0 && <Empty />}
          </div>
        </div>
      )}
    </div>
  )
}

function KanjiDetail({
  k,
  onBack,
  onTheme,
}: {
  k: Kanji
  onBack: () => void
  onTheme: (id: string) => void
}) {
  return (
    <div>
      <BackBar onBack={onBack} label="Kanji" />
      <div className="grid lg:grid-cols-[minmax(0,340px)_1fr] gap-6">
        <div className="border border-line bg-panel p-8 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 mono text-[11px] text-ember border border-ember/40 px-2 py-0.5">
            {k.jlpt}
          </div>
          <div className="absolute top-4 right-4 mono text-[11px] text-fog">
            {k.strokes} traits
          </div>
          <div className="jp text-[12rem] leading-none font-500 text-chalk">{k.char}</div>
          {k.radical && (
            <div className="mt-6 flex items-center gap-2 mono text-[11px] text-fog">
              <span className="uppercase tracking-[0.12em]">Radical</span>
              <span className="jp text-base text-chalk">{k.radical.char}</span>
              <span className="text-fog">· {k.radical.meaning}</span>
            </div>
          )}
        </div>

        <div>
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-1">
            Signification principale
          </div>
          <h1 className="display text-5xl font-900 tracking-tight mb-8 capitalize">{k.meaning}</h1>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <ReadingBlock label="Lecture ON (音読み)" values={k.on} />
            <ReadingBlock label="Lecture KUN (訓読み)" values={k.kun} />
          </div>

          {(k.components?.length || k.radical) && (
            <div className="border-t border-line pt-5 mb-8">
              <div className="mono text-[11px] uppercase tracking-[0.12em] text-fog mb-3">
                Décomposition
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(k.components ?? []).map((c, i) => (
                  <span key={c + i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-fog mono text-sm">+</span>}
                    <span className="jp text-2xl border border-line bg-panel w-12 h-12 flex items-center justify-center text-chalk">
                      {c}
                    </span>
                  </span>
                ))}
                {k.components?.length ? (
                  <>
                    <span className="text-fog mono text-sm">=</span>
                    <span className="jp text-2xl border border-ember/50 bg-panel w-12 h-12 flex items-center justify-center text-ember">
                      {k.char}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {k.examples?.length ? (
            <div className="border-t border-line pt-5 mb-8">
              <div className="mono text-[11px] uppercase tracking-[0.12em] text-fog mb-3">
                Mots-exemples par lecture
              </div>
              <div className="space-y-2">
                {k.examples.map((ex) => (
                  <ExampleRow key={ex.word} ex={ex} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-t border-line pt-5 mb-8">
            <div className="mono text-[11px] uppercase tracking-[0.12em] text-fog mb-3">
              Autres significations
            </div>
            <div className="flex flex-wrap gap-2">
              {k.otherMeanings.map((m) => (
                <span key={m} className="border border-line px-3 py-1.5 text-sm text-chalk">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <div className="mono text-[11px] uppercase tracking-[0.12em] text-fog mb-3">
              Thèmes rattachés
            </div>
            <div className="flex flex-wrap gap-2">
              {k.themes.map((t) => (
                <Tag key={t} id={t} onClick={onTheme} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReadingBlock({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="border border-line bg-panel p-4">
      <div className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">{label}</div>
      <div className="jp text-2xl">{values.length ? values.join('　') : '—'}</div>
    </div>
  )
}

function ExampleRow({ ex }: { ex: KanjiExample }) {
  return (
    <div className="flex items-center gap-3 border border-line bg-panel px-4 py-2.5">
      <span
        className={`mono text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 border ${
          ex.kind === 'on' ? 'text-ember border-ember/40' : 'text-fog border-line-bright'
        }`}
      >
        {ex.kind === 'on' ? 'ON' : 'KUN'}
      </span>
      <div className="flex-1 min-w-0 flex items-baseline gap-3">
        <span className="jp text-xl text-chalk">{ex.word}</span>
        <span className="jp text-sm text-fog">{ex.reading}</span>
      </div>
      <span className="text-sm text-fog truncate">{ex.meaning}</span>
      <SpeakBtn text={ex.word} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 4 — Grammar                                                         */
/* ------------------------------------------------------------------ */

function RuleRow({ r, onOpen }: { r: Rule; onOpen: (id: string) => void }) {
  return (
    <button
      onClick={() => onOpen(r.id)}
      className="w-full text-left border border-line bg-panel hover:border-ember transition-colors p-4 flex items-center gap-4 group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base group-hover:text-ember transition-colors">{r.title}</h3>
          {r.isNew && <NewTag />}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {r.themes.map((t) => (
            <span
              key={t}
              className="mono text-[10px] uppercase tracking-[0.12em] px-2 py-[3px] border border-line text-fog"
            >
              {themeTitle(t)}
            </span>
          ))}
        </div>
      </div>
      <span className="text-ember shrink-0 transition-transform group-hover:translate-x-1">→</span>
    </button>
  )
}

function GrammarView({ onOpen }: { onOpen: (id: string) => void }) {
  const [q, setQ] = useState('')

  const categories = useMemo(() => {
    const t = q.trim().toLowerCase()
    const filtered = rules.filter((r) => {
      if (!t) return true
      return (
        r.title.toLowerCase().includes(t) ||
        r.category.toLowerCase().includes(t) ||
        r.body.toLowerCase().includes(t) ||
        r.themes.some((id) => themeTitle(id).toLowerCase().includes(t))
      )
    })
    const map = new Map<string, Rule[]>()
    filtered.forEach((r) => {
      if (!map.has(r.category)) map.set(r.category, [])
      map.get(r.category)!.push(r)
    })
    return [...map.entries()]
  }, [q])

  return (
    <div>
      <SectionHead index="04" title="Grammaire" jp="文法規則" count={`${rules.length} règles`}>
        <Search value={q} onChange={setQ} placeholder="Rechercher une règle…" />
      </SectionHead>
      <div className="space-y-8">
        {categories.map(([cat, list]) => (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-3">
              <span className="mono text-[11px] uppercase tracking-[0.14em] text-ember">{cat}</span>
              <div className="h-px flex-1 bg-line" />
              <span className="mono text-[10px] text-fog">{list.length}</span>
            </div>
            <div className="space-y-3">
              {list.map((r) => (
                <RuleRow key={r.id} r={r} onOpen={onOpen} />
              ))}
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="border border-line">
            <Empty />
          </div>
        )}
      </div>
    </div>
  )
}

function RuleDetail({
  r,
  onBack,
  onTheme,
  onOpenExercise,
}: {
  r: Rule
  onBack: () => void
  onTheme: (id: string) => void
  onOpenExercise: (id: string) => void
}) {
  const linked = exercises.filter((e) => r.exercises.includes(e.id))
  return (
    <div>
      <BackBar onBack={onBack} label="Grammaire" />
      <div className="max-w-3xl">
        <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-2">
          {r.category}
        </div>
        <h1 className="display text-4xl font-900 tracking-tight leading-tight mb-4">{r.title}</h1>
        <div className="flex flex-wrap gap-2 mb-8">
          {r.themes.map((t) => (
            <Tag key={t} id={t} onClick={onTheme} />
          ))}
        </div>

        <div className="border-l-2 border-ember pl-5 py-1 mb-10">
          <p className="text-lg leading-relaxed text-chalk/90">{r.body}</p>
        </div>

        <div className="border-t border-line pt-6">
          <div className="mono text-[11px] uppercase tracking-[0.12em] text-fog mb-4">
            Exercices rattachés · {linked.length}
          </div>
          {linked.length ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {linked.map((e) => (
                <ExerciseCard key={e.id} e={e} onOpen={onOpenExercise} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-fog">Aucun exercice rattaché pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 5 — Exercises                                                       */
/* ------------------------------------------------------------------ */

function ExerciseCard({ e, onOpen }: { e: Exercise; onOpen: (id: string) => void }) {
  return (
    <button
      onClick={() => onOpen(e.id)}
      className="group text-left border border-line bg-panel hover:border-ember transition-colors p-4 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="mono text-[10px] uppercase tracking-[0.12em] text-ember">{e.subject}</span>
        <span className="mono text-[10px] text-fog">{formatDate(e.date)}</span>
      </div>
      <h3 className="text-base mt-2 group-hover:text-ember transition-colors">{e.title}</h3>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {e.themes.map((t) => (
          <span
            key={t}
            className="mono text-[10px] uppercase tracking-[0.12em] px-2 py-[3px] border border-line text-fog"
          >
            {themeTitle(t)}
          </span>
        ))}
      </div>
      <div className="mono text-[10px] text-fog mt-3 flex items-center gap-2">
        <span>{e.questions.length} questions</span>
        <span className="text-ember ml-auto transition-transform group-hover:translate-x-1">→</span>
      </div>
    </button>
  )
}

function ExercisesView({
  onOpen,
  onRun,
}: {
  onOpen: (id: string) => void
  onRun: (id: string) => void
}) {
  const [q, setQ] = useState('')
  const filtered = exercises.filter((e) => {
    const t = q.trim().toLowerCase()
    if (!t) return true
    return (
      e.title.toLowerCase().includes(t) ||
      e.subject.toLowerCase().includes(t) ||
      e.themes.some((id) => themeTitle(id).toLowerCase().includes(t))
    )
  })

  return (
    <div>
      <SectionHead
        index="05"
        title="Exercices"
        jp="練習問題"
        count={`${exercises.length} exercices`}
      >
        <Search value={q} onChange={setQ} placeholder="Rechercher un exercice…" />
      </SectionHead>

      <div className="border border-line divide-y divide-line">
        <div className="hidden md:grid grid-cols-[2fr_1.2fr_1.6fr_auto_auto] gap-4 px-4 py-2.5 bg-panel mono text-[10px] uppercase tracking-[0.12em] text-fog">
          <span>Titre</span>
          <span>Sujet</span>
          <span>Thèmes</span>
          <span>Date</span>
          <span>Action</span>
        </div>
        {filtered.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.2fr_1.6fr_auto_auto] gap-4 px-4 py-3.5 items-center hover:bg-panel/60 transition-colors group"
          >
            <button onClick={() => onOpen(e.id)} className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm group-hover:text-ember transition-colors">{e.title}</span>
                {e.isNew && <NewTag />}
              </div>
              <div className="mono text-[10px] text-fog mt-0.5">{e.questions.length} questions</div>
            </button>
            <div className="mono text-xs text-ember hidden md:block">{e.subject}</div>
            <div className="col-start-1 md:col-start-3 flex flex-wrap gap-1.5">
              {e.themes.map((t) => (
                <span
                  key={t}
                  className="mono text-[10px] uppercase tracking-[0.12em] px-2 py-[3px] border border-line text-fog"
                >
                  {themeTitle(t)}
                </span>
              ))}
            </div>
            <div className="hidden md:block mono text-[11px] text-fog">{formatDate(e.date)}</div>
            <div className="row-start-1 col-start-2 md:row-auto md:col-auto justify-self-end">
              <button
                onClick={() => onRun(e.id)}
                className="mono text-[11px] uppercase tracking-[0.08em] px-3 py-2 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Lancer
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <Empty />}
      </div>
    </div>
  )
}

function ExerciseDetail({
  e,
  onBack,
  onTheme,
  onRun,
}: {
  e: Exercise
  onBack: () => void
  onTheme: (id: string) => void
  onRun: (id: string) => void
}) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  return (
    <div>
      <BackBar onBack={onBack} label="Exercices" />
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mono text-[11px] uppercase tracking-[0.16em] mb-2">
          <span className="text-ember">{e.subject}</span>
          <span className="text-line-bright">·</span>
          <span className="text-fog">{formatDate(e.date)}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <h1 className="display text-4xl font-900 tracking-tight">{e.title}</h1>
          <button
            onClick={() => onRun(e.id)}
            className="mono text-xs uppercase tracking-[0.1em] px-4 py-2.5 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors flex items-center gap-2 shrink-0"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Lancer l'exercice
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {e.themes.map((t) => (
            <Tag key={t} id={t} onClick={onTheme} />
          ))}
        </div>
        <div className="border border-line bg-panel p-4 mb-8">
          <div className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-1">Consigne</div>
          <p className="text-sm">{e.prompt}</p>
        </div>

        <div className="space-y-4">
          {e.questions.map((qa, i) => {
            const open = revealed[i]
            return (
              <div key={i} className="border border-line">
                <div className="flex items-start gap-4 p-4">
                  <span className="mono text-ember text-sm">{String(i + 1).padStart(2, '0')}</span>
                  <p className="jp text-xl flex-1 leading-relaxed">{qa.q}</p>
                  <SpeakBtn text={qa.q.replace(/＿+/g, '')} />
                </div>
                <button
                  onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
                  className="mono text-[11px] uppercase tracking-[0.1em] w-full text-left px-4 py-2.5 border-t border-line text-fog hover:text-ember transition-colors"
                >
                  {open ? '▾ Masquer la correction' : '▸ Afficher la correction'}
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-1 bg-panel">
                    <p className="jp text-base text-ember-soft leading-relaxed">{qa.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 6 — Sentences                                                       */
/* ------------------------------------------------------------------ */

function SentencesView({ onTheme }: { onTheme: (id: string) => void }) {
  const [theme, setTheme] = useState('all')
  const filtered = sentences.filter((s) => theme === 'all' || s.themes.includes(theme))
  return (
    <div>
      <SectionHead
        index="06"
        title="Phrases"
        jp="例文集"
        count={`${sentences.length} phrases`}
      />
      <ThemeFilter value={theme} onChange={setTheme} />
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((s) => (
          <div key={s.id} className="border border-line bg-panel p-5 hover:border-line-bright transition-colors">
            <div className="flex items-start justify-between gap-4">
              <p className="jp text-2xl leading-relaxed">{s.kana}</p>
              <SpeakBtn text={s.kana} />
            </div>
            <p className="mono text-xs text-fog mt-3">{s.romaji}</p>
            <p className="text-sm text-chalk/80 mt-1">{s.translation}</p>
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-line">
              {s.themes.map((t) => (
                <Tag key={t} id={t} onClick={onTheme} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hiragana / Katakana                                                 */
/* ------------------------------------------------------------------ */

function KanaView({
  index,
  title,
  jp,
  table,
  onExercise,
}: {
  index: string
  title: string
  jp: string
  table: { kana: string; romaji: string }[]
  onExercise: () => void
}) {
  return (
    <div>
      <SectionHead index={index} title={title} jp={jp} count={`${table.length} caractères`}>
        <div className="flex flex-col items-end gap-3">
          <ExerciseCta onClick={onExercise} />
          <MasteryLegend />
        </div>
      </SectionHead>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {table.map((k) => (
          <button
            key={k.kana}
            onClick={() => speak(k.kana)}
            title="Écouter"
            className="group relative aspect-square border border-line bg-panel hover:border-ember hover:bg-panel-2 transition-colors flex flex-col items-center justify-center gap-1"
          >
            <MasteryDot level={masteryOf(title + k.kana)} className="absolute top-2.5 right-2.5" />
            <span className="jp text-4xl leading-none group-hover:text-ember transition-colors">
              {k.kana}
            </span>
            <span className="mono text-xs text-fog uppercase tracking-[0.1em]">{k.romaji}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mastery indicator                                                   */
/* ------------------------------------------------------------------ */

type Mastery = 'known' | 'learning' | 'hard'

const MASTERY_META: Record<Mastery, { color: string; label: string }> = {
  known: { color: '#3fbf7f', label: 'Maîtrisé' },
  learning: { color: '#f2a63b', label: 'En cours' },
  hard: { color: '#e5484d', label: 'À revoir' },
}

// Deterministic level per element so the indicator stays stable between renders.
function masteryOf(seed: string): Mastery {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const m = h % 10
  if (m < 5) return 'known'
  if (m < 8) return 'learning'
  return 'hard'
}

function ExerciseCta({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mono text-[11px] uppercase tracking-[0.08em] px-3 py-2.5 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
    >
      <span className="jp text-sm leading-none">練</span>
      M'exercer
    </button>
  )
}

function NewTag({ className = '' }: { className?: string }) {
  return (
    <span
      className={
        'mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-[2px] bg-ember text-ink font-700 leading-none whitespace-nowrap ' +
        className
      }
    >
      Nouveau
    </span>
  )
}

function newCountFor(key: NavKey): number {
  switch (key) {
    case 'vocab':
      return words.filter((w) => w.isNew).length
    case 'kanji':
      return kanjis.filter((k) => k.isNew).length
    case 'themes':
      return themes.filter((t) => t.isNew).length
    case 'grammar':
      return rules.filter((r) => r.isNew).length
    case 'exercises':
      return exercises.filter((e) => e.isNew).length
    default:
      return 0
  }
}

function MasteryLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <span className="mono text-[10px] uppercase tracking-[0.1em] text-fog">Maîtrise</span>
      {(['known', 'learning', 'hard'] as const).map((l) => (
        <span key={l} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: MASTERY_META[l].color }} />
          <span className="mono text-[10px] uppercase tracking-[0.08em] text-fog">
            {MASTERY_META[l].label}
          </span>
        </span>
      ))}
    </div>
  )
}

function MasteryDot({ level, className = '' }: { level: Mastery; className?: string }) {
  const m = MASTERY_META[level]
  return (
    <span
      title={`Maîtrise : ${m.label}`}
      className={'size-2.5 rounded-full shrink-0 ' + className}
      style={{ background: m.color, boxShadow: `0 0 0 3px ${m.color}22` }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Small shared bits                                                   */
/* ------------------------------------------------------------------ */

function BackBar({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <button
      onClick={onBack}
      className="mono text-[11px] uppercase tracking-[0.12em] text-fog hover:text-ember transition-colors mb-6 flex items-center gap-2"
    >
      ← Retour · {label}
    </button>
  )
}

function Empty() {
  return (
    <div className="px-4 py-16 text-center">
      <div className="jp text-4xl text-line-bright mb-3">空</div>
      <p className="mono text-xs text-fog uppercase tracking-[0.12em]">Aucun résultat</p>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/* Icons */
function IconDash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13a9 9 0 0 1 18 0" /><path d="M12 13l4-3" /><circle cx="12" cy="13" r="1.5" />
    </svg>
  )
}
function IconWord() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V5h16v2" /><path d="M9 20h6" /><path d="M12 5v15" />
    </svg>
  )
}
function IconKana() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6h14" /><path d="M11 4c0 6-2 12-6 15" /><path d="M12 9c2 3 5 5 8 6" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}
function IconBrush() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 14.5 3 21" /><path d="M14 4l6 6-7 7-4-4z" /><path d="M13 5l6 6" />
    </svg>
  )
}
function IconRule() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}
function IconQuote() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.5-4A9 8 0 1 1 8 19a9 9 0 0 1-3.5-.7z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* 0 — Dashboard                                                       */
/* ------------------------------------------------------------------ */

// status palette — good / learning / difficult / remaining (label + color, never color-alone)
const STATUS = {
  known: { color: '#3fbf7f', label: 'Su' },
  learning: { color: '#f2a63b', label: 'En apprentissage' },
  hard: { color: '#e5484d', label: 'Difficultés' },
  rest: { color: '#2a2622', label: 'À découvrir' },
}

function DashboardView({
  onOpenTheme,
  onPractice,
  onRun,
}: {
  onOpenTheme: (id: string) => void
  onPractice: () => void
  onRun: (id: string) => void
}) {
  const daily = themes[0]
  const text = ambiance[daily.id] ?? ''
  const todayIdx = (new Date().getDay() + 6) % 7 // Monday = 0
  const todayTasks = buildWeekPlan(daily.id)[todayIdx]
  const doExercise = (task: PlanTask) => {
    if (task.kind === 'exercice') {
      const match = exercises.find((e) => e.title === task.label)
      if (match) {
        onRun(match.id)
        return
      }
    }
    onPractice()
  }

  return (
    <div>
      <div className="flex items-end justify-between border-b border-line pb-5 mb-6">
        <div className="flex items-end gap-4">
          <span className="mono text-ember text-sm mb-1">00</span>
          <div>
            <div className="jp text-fog text-sm mb-1">ダッシュボード</div>
            <h1 className="display text-4xl font-800 tracking-tight leading-none">
              Bonjour, Haruki
            </h1>
          </div>
        </div>
        <span className="mono text-xs text-fog mb-1 hidden sm:block">{today()}</span>
      </div>

      {/* Daily theme banner */}
      <section className="border border-line overflow-hidden mb-8">
        <div className="grid lg:grid-cols-[1.4fr_1fr]">
          <div className="relative min-h-64 bg-panel-2">
            <img src={daily.image} alt={daily.title} className="absolute inset-0 size-full object-cover grayscale-[25%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10 lg:bg-gradient-to-r" />
            <div className="relative p-6 lg:p-8 h-full flex flex-col justify-end max-w-xl">
              <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-2">
                Thème du jour · {formatDate(daily.date)}
              </div>
              <h2 className="display text-4xl lg:text-5xl font-900 tracking-tight mb-4">
                {daily.title}
              </h2>
              <p className="text-sm text-chalk/80 leading-relaxed mb-5">{text}</p>
              <div>
                <button
                  onClick={() => onOpenTheme(daily.id)}
                  className="mono text-xs uppercase tracking-[0.1em] px-4 py-2.5 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors"
                >
                  Explorer le thème →
                </button>
              </div>
            </div>
          </div>

          {/* Daily plan */}
          <div className="border-t lg:border-t-0 lg:border-l border-line p-6 bg-panel flex flex-col">
            <div className="flex items-baseline justify-between mb-4">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-fog">
                Ton programme du jour
              </div>
              <div className="display font-800 text-lg text-ember leading-none">
                {WEEK_DAYS[todayIdx]}
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {todayTasks.map((t, i) => (
                <div
                  key={i}
                  className="border border-line p-3 flex items-center gap-3 bg-ink/40"
                >
                  <span
                    className="jp text-lg w-9 h-9 shrink-0 grid place-items-center border border-line text-ember"
                    title={PLAN_META[t.kind].label}
                  >
                    {PLAN_META[t.kind].glyph}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{t.label}</div>
                    <div className="mono text-[10px] text-fog truncate">
                      {PLAN_META[t.kind].label}
                    </div>
                  </div>
                  {t.done ? (
                    <StatusPill done />
                  ) : (
                    <button
                      onClick={() => doExercise(t)}
                      className="mono text-[11px] uppercase tracking-[0.08em] px-3 py-2 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Faire
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* General statistics */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-ember">
            Statistiques générales
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          {(['known', 'learning', 'hard', 'rest'] as const).map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span className="size-3" style={{ background: STATUS[k].color }} />
              <span className="mono text-[10px] uppercase tracking-[0.08em] text-fog">
                {STATUS[k].label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((s) => (
            <StatCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      {/* Evolution */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-ember">
            Mon évolution
          </span>
          <div className="h-px flex-1 bg-line" />
          <span className="mono text-[10px] text-fog">Mots maîtrisés · 8 semaines</span>
        </div>
        <EvolutionChart />
      </section>
    </div>
  )
}

function StatusPill({ done }: { done: boolean }) {
  return (
    <span
      className={
        'mono text-[10px] uppercase tracking-[0.08em] px-2.5 py-1 border flex items-center gap-1.5 shrink-0 ' +
        (done
          ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10'
          : 'border-ember/50 text-ember bg-ember/10')
      }
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: done ? '#3fbf7f' : '#ff6a1a' }}
      />
      {done ? 'Effectué' : 'À faire'}
    </span>
  )
}

function StatCard({ s }: { s: StatCatType }) {
  const rest = Math.max(0, s.total - s.known - s.learning - s.hard)
  const segs = [
    { k: 'known' as const, v: s.known },
    { k: 'learning' as const, v: s.learning },
    { k: 'hard' as const, v: s.hard },
    { k: 'rest' as const, v: rest },
  ]
  const pct = Math.round((s.known / s.total) * 100)
  return (
    <div className="border border-line bg-panel p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="jp text-2xl text-fog">{s.jp}</span>
          <div>
            <div className="text-base leading-tight">{s.label}</div>
            <div className="mono text-[11px] text-fog">{s.total} au total</div>
          </div>
        </div>
        <div className="text-right">
          <div className="display font-900 text-3xl leading-none text-ember">{pct}%</div>
          <div className="mono text-[10px] text-fog uppercase">maîtrisé</div>
        </div>
      </div>

      {/* proportion bar — 2px surface gap between segments */}
      <div className="flex gap-[2px] h-3 mb-3">
        {segs.map(
          (seg) =>
            seg.v > 0 && (
              <div
                key={seg.k}
                title={`${STATUS[seg.k].label} · ${seg.v}`}
                style={{ width: `${(seg.v / s.total) * 100}%`, background: STATUS[seg.k].color }}
              />
            ),
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {segs.map((seg) => (
          <div key={seg.k}>
            <div className="mono text-sm" style={{ color: STATUS[seg.k].color }}>
              {seg.v}
            </div>
            <div className="mono text-[9px] uppercase tracking-[0.06em] text-fog leading-tight">
              {STATUS[seg.k].label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EvolutionChart() {
  const max = Math.max(...evolution.map((e) => e.mastered))
  const min = Math.min(...evolution.map((e) => e.mastered))
  const first = evolution[0].mastered
  const last = evolution[evolution.length - 1].mastered
  const growth = last - first

  return (
    <div className="border border-line bg-panel p-6">
      <div className="flex items-end gap-6 mb-6">
        <div>
          <div className="display font-900 text-4xl leading-none">
            {last.toLocaleString('fr-FR')}
          </div>
          <div className="mono text-[11px] text-fog uppercase mt-1">mots maîtrisés</div>
        </div>
        <div className="mb-1 mono text-xs text-emerald-300">
          +{growth.toLocaleString('fr-FR')} <span className="text-fog">sur 8 semaines</span>
        </div>
      </div>

      {/* single-series bars — sequential single hue, 4px rounded data-ends on baseline */}
      <div className="flex items-end gap-2 sm:gap-3 h-40">
        {evolution.map((e, i) => {
          const h = ((e.mastered - min * 0.85) / (max - min * 0.85)) * 100
          const isLast = i === evolution.length - 1
          return (
            <div key={e.week} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="mono text-[10px] text-fog opacity-0 group-hover:opacity-100 transition-opacity">
                {e.mastered}
              </span>
              <div
                className="w-full rounded-t-[4px] transition-all"
                style={{
                  height: `${Math.max(6, h)}%`,
                  background: isLast ? 'var(--color-ember)' : 'var(--color-ember-dim)',
                }}
                title={`${e.week} · ${e.mastered} mots`}
              />
              <span className={'mono text-[9px] ' + (isLast ? 'text-ember' : 'text-fog')}>
                {e.week}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function today() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

/* ------------------------------------------------------------------ */
/* M'exercer — practice flow                                           */
/* ------------------------------------------------------------------ */

type QType = 'hiragana' | 'katakana' | 'vocab' | 'kanji' | 'grammar' | 'sentences'
type QMode = 'fr2jp' | 'jp2fr' | 'read2mean'
type QScope = 'daily' | 'hard' | 'review' | 'random'

type Question = {
  prompt: string
  promptJp: boolean
  answer: string
  options: string[]
  optionsJp: boolean
  // Étape 2 optionnelle (mode « lecture puis sens » des kanji)
  stage2?: { answer: string; options: string[]; optionsJp: boolean }
}

const TYPE_OPTS: { id: QType; label: string; jp: string; note: string }[] = [
  { id: 'hiragana', label: 'Hiragana', jp: 'ひらがな', note: '46 syllabes de base' },
  { id: 'katakana', label: 'Katakana', jp: 'カタカナ', note: 'Mots étrangers' },
  { id: 'vocab', label: 'Vocabulaire', jp: '単語', note: 'Mots & traductions' },
  { id: 'kanji', label: 'Kanji', jp: '漢字', note: 'Caractères & sens' },
  { id: 'grammar', label: 'Grammaire', jp: '文法', note: 'Particules & formes' },
  { id: 'sentences', label: 'Phrases', jp: '例文', note: 'Phrases types' },
]

const MODE_OPTS: { id: QMode; label: string; jp: string; note?: string; only?: QType }[] = [
  { id: 'fr2jp', label: 'Du français au japonais', jp: '仏 → 和' },
  { id: 'jp2fr', label: 'Du japonais au français', jp: '和 → 仏' },
  {
    id: 'read2mean',
    label: 'Lecture puis traduction',
    jp: '読み → 意味',
    note: 'Lis le kanji, puis choisis son sens',
    only: 'kanji',
  },
]

const SCOPE_OPTS: { id: QScope; label: string; note: string }[] = [
  { id: 'daily', label: 'Thème du jour uniquement', note: `« ${themes[0].title} »` },
  { id: 'hard', label: 'Mes points faibles', note: 'Éléments les plus difficiles' },
  { id: 'review', label: 'Révision des anciennes notions', note: 'Ce que tu as vu il y a longtemps' },
  { id: 'random', label: 'Aléatoire', note: 'Un peu de tout' },
]

const QUIZ_LEN = 20
const DAILY_THEME = themes[0].id

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function scopeFilter<T extends { themes: string[] }>(items: T[], scope: QScope): T[] {
  let out: T[]
  switch (scope) {
    case 'daily':
      out = items.filter((i) => i.themes.includes(DAILY_THEME))
      break
    case 'hard':
      out = items.filter((_, i) => i % 3 === 1)
      break
    case 'review':
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

function buildQuiz(type: QType, mode: QMode, scope: QScope): Question[] {
  const out: Question[] = []

  const pushKana = (table: { kana: string; romaji: string }[]) => {
    const romajiPool = table.map((k) => k.romaji)
    const kanaPool = table.map((k) => k.kana)
    shuffle(table).forEach((k) => {
      if (mode === 'jp2fr') {
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

  if (type === 'hiragana') pushKana(hiragana)
  else if (type === 'katakana') pushKana(katakana)
  else if (type === 'kanji') {
    const items = scopeFilter(kanjis, scope)
    const charPool = items.map((i) => i.char)
    const meaningPool = items.map((i) => i.meaning)
    // mots composés (mots-exemples) rattachés aux kanji du périmètre
    const exItems = items.flatMap((i) => i.examples ?? [])
    const wordPool = exItems.map((e) => e.word)
    const readingPool = exItems.map((e) => e.reading)
    const exMeaningPool = exItems.map((e) => e.meaning)

    // Mode « lecture puis traduction » : deux étapes par kanji
    if (mode === 'read2mean') {
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
        full2.push(j < pool2.length ? base : { ...base, options: shuffle(base.options) })
        j++
      }
      return full2
    }

    shuffle(items).forEach((i) => {
      if (mode === 'jp2fr') {
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
      if (mode === 'jp2fr') {
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
  } else if (type === 'vocab' || type === 'sentences') {
    const items = scopeFilter(type === 'vocab' ? words : sentences, scope)
    const kanaPool = items.map((i) => i.kana)
    const frPool = items.map((i) => i.translation)
    shuffle(items).forEach((i) => {
      if (mode === 'jp2fr') {
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
    if (scope === 'daily') bank = grammarBank.filter((g) => g.daily)
    else if (scope === 'hard') bank = grammarBank.filter((g) => g.hard)
    else if (scope === 'review') bank = grammarBank.filter((g) => g.review)
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
    full.push(i < out.length ? base : { ...base, options: shuffle(base.options) })
    i++
  }
  return full
}

function Practice({ onClose, initialType }: { onClose: () => void; initialType?: QType }) {
  const [step, setStep] = useState<'type' | 'mode' | 'scope' | 'quiz' | 'result'>(
    initialType ? 'mode' : 'type',
  )
  const [type, setType] = useState<QType | null>(initialType ?? null)
  const [mode, setMode] = useState<QMode | null>(null)
  const [quiz, setQuiz] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [stage, setStage] = useState(0) // 0 ou 1 pour les questions à deux étapes
  const [stage0ok, setStage0ok] = useState(false)

  const q = quiz[idx]
  const twoStage = !!q?.stage2
  const curAnswer = stage === 1 && q?.stage2 ? q.stage2.answer : q?.answer
  const curOptions = stage === 1 && q?.stage2 ? q.stage2.options : q?.options ?? []
  const curOptionsJp = stage === 1 && q?.stage2 ? q.stage2.optionsJp : q?.optionsJp

  const start = (scope: QScope) => {
    setQuiz(buildQuiz(type!, mode!, scope))
    setIdx(0)
    setScore(0)
    setPicked(null)
    setRevealed(false)
    setStage(0)
    setStage0ok(false)
    setStep('quiz')
  }

  const pick = (opt: string) => {
    if (picked) return
    setPicked(opt)
    const correct = opt === curAnswer
    if (twoStage && stage === 0) {
      setStage0ok(correct)
    } else {
      const ok = twoStage ? correct && stage0ok : correct
      if (ok) setScore((s) => s + 1)
    }
  }

  const next = () => {
    // passer à l'étape 2 de la même question
    if (twoStage && stage === 0) {
      setStage(1)
      setPicked(null)
      setRevealed(false)
      return
    }
    if (idx + 1 >= quiz.length) setStep('result')
    else {
      setIdx((i) => i + 1)
      setPicked(null)
      setRevealed(false)
      setStage(0)
      setStage0ok(false)
    }
  }

  const reset = () => {
    setStep('type')
    setType(null)
    setMode(null)
    setQuiz([])
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-panel border border-line max-h-[90vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-panel z-10">
          <div className="flex items-center gap-3">
            <span className="jp text-ember text-xl">練習</span>
            <div>
              <div className="display font-800 text-lg leading-none">M'exercer</div>
              <div className="mono text-[10px] text-fog uppercase tracking-[0.12em] mt-1">
                {step === 'type' && 'Étape 1 / 3 · Type'}
                {step === 'mode' && 'Étape 2 / 3 · Sens'}
                {step === 'scope' && 'Étape 3 / 3 · Contenu'}
                {step === 'quiz' && `Question ${idx + 1} / ${quiz.length}`}
                {step === 'result' && 'Résultat'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 grid place-items-center border border-line text-fog hover:border-ember hover:text-ember transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {step === 'type' && (
            <WizardStep title="Quel type d'exercice ?">
              {TYPE_OPTS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setType(o.id)
                    setStep('mode')
                  }}
                  className="group text-left border border-line p-4 hover:border-ember bg-ink/40 transition-colors flex items-center gap-4"
                >
                  <span className="jp text-2xl text-fog group-hover:text-ember transition-colors w-16 shrink-0">
                    {o.jp}
                  </span>
                  <span className="flex-1">
                    <span className="block text-base">{o.label}</span>
                    <span className="mono text-[10px] text-fog uppercase tracking-[0.08em]">
                      {o.note}
                    </span>
                  </span>
                  <span className="text-ember transition-transform group-hover:translate-x-1">→</span>
                </button>
              ))}
            </WizardStep>
          )}

          {step === 'mode' && (
            <WizardStep title="Dans quel sens ?" onBack={() => setStep('type')}>
              {MODE_OPTS.filter((o) => !o.only || o.only === type).map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setMode(o.id)
                    setStep('scope')
                  }}
                  className="group text-left border border-line p-5 hover:border-ember bg-ink/40 transition-colors flex items-center gap-4"
                >
                  <span className="jp text-xl text-ember w-20 shrink-0">{o.jp}</span>
                  <span className="flex-1">
                    <span className="block text-base">{o.label}</span>
                    {o.note && (
                      <span className="mono text-[10px] text-fog uppercase tracking-[0.08em]">
                        {o.note}
                      </span>
                    )}
                  </span>
                  <span className="text-ember transition-transform group-hover:translate-x-1">→</span>
                </button>
              ))}
            </WizardStep>
          )}

          {step === 'scope' && (
            <WizardStep title="Sur quel contenu ?" onBack={() => setStep('mode')}>
              {SCOPE_OPTS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => start(o.id)}
                  className="group text-left border border-line p-4 hover:border-ember bg-ink/40 transition-colors flex items-center gap-4"
                >
                  <span className="flex-1">
                    <span className="block text-base">{o.label}</span>
                    <span className="mono text-[10px] text-fog uppercase tracking-[0.08em]">
                      {o.note}
                    </span>
                  </span>
                  <span className="text-ember transition-transform group-hover:translate-x-1">→</span>
                </button>
              ))}
            </WizardStep>
          )}

          {step === 'quiz' && quiz[idx] && (
            <div>
              {/* progress */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-1 flex-1 bg-line overflow-hidden">
                  <div
                    className="h-full bg-ember transition-all duration-300"
                    style={{ width: `${(idx / quiz.length) * 100}%` }}
                  />
                </div>
                <span className="mono text-[11px] text-fog">
                  {score} <span className="text-ember">★</span>
                </span>
              </div>

              <div className="text-center py-6 mb-6 border border-line bg-ink/40">
                <div className="mono text-[10px] uppercase tracking-[0.14em] text-fog mb-4">
                  {twoStage
                    ? stage === 0
                      ? 'Étape 1 · Comment se lit ce kanji ?'
                      : 'Étape 2 · Quelle est sa traduction ?'
                    : mode === 'jp2fr'
                      ? 'Traduis en français'
                      : 'Trouve la bonne réponse'}
                </div>
                <div
                  className={
                    (quiz[idx].promptJp ? 'jp' : 'display font-800') +
                    ' text-chalk ' +
                    (quiz[idx].promptJp ? 'text-6xl' : 'text-3xl px-4')
                  }
                >
                  {quiz[idx].prompt}
                </div>
                {twoStage && stage === 1 && (
                  <div className="jp text-2xl text-ember mt-3">{quiz[idx].answer}</div>
                )}
              </div>

              {!revealed ? (
                <div className="text-center">
                  <p className="mono text-[11px] text-fog uppercase tracking-[0.1em] mb-4">
                    Cherche la réponse de mémoire, puis affiche les propositions.
                  </p>
                  <button
                    onClick={() => setRevealed(true)}
                    className="mono text-sm uppercase tracking-[0.1em] w-full py-3.5 border border-ember text-ember font-600 hover:bg-ember hover:text-ink transition-colors"
                  >
                    Prêt à répondre ! →
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {curOptions.map((opt) => {
                    const isAnswer = opt === curAnswer
                    const isPicked = opt === picked
                    let cls = 'border-line hover:border-ember bg-ink/40'
                    if (picked) {
                      if (isAnswer) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      else if (isPicked) cls = 'border-red-500 bg-red-500/10 text-red-300'
                      else cls = 'border-line opacity-40'
                    }
                    return (
                      <button
                        key={opt}
                        onClick={() => pick(opt)}
                        disabled={!!picked}
                        className={
                          'border p-4 text-center transition-colors ' +
                          (curOptionsJp ? 'jp text-2xl' : 'text-base') +
                          ' ' +
                          cls
                        }
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )}

              {picked && (
                <button
                  onClick={next}
                  className="mono text-sm uppercase tracking-[0.1em] w-full mt-6 py-3.5 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors"
                >
                  {twoStage && stage === 0
                    ? 'Étape suivante'
                    : idx + 1 >= quiz.length
                      ? 'Voir mon score'
                      : 'Question suivante'}{' '}
                  →
                </button>
              )}
            </div>
          )}

          {step === 'result' && (
            <div className="text-center py-6">
              <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-4">
                {resultMessage(score, quiz.length).tag}
              </div>
              <div className="jp text-5xl mb-2">{resultMessage(score, quiz.length).jp}</div>
              <div className="display font-900 text-7xl tracking-tight my-4">
                {score}
                <span className="text-fog text-3xl">/{quiz.length}</span>
              </div>
              <div className="mono text-sm text-fog mb-8">
                {Math.round((score / quiz.length) * 100)}% de réussite
              </div>

              {/* score bar */}
              <div className="h-2 bg-line overflow-hidden mb-10 max-w-sm mx-auto">
                <div
                  className="h-full bg-ember transition-all duration-700"
                  style={{ width: `${(score / quiz.length) * 100}%` }}
                />
              </div>

              <div className="flex gap-3 max-w-sm mx-auto">
                <button
                  onClick={reset}
                  className="mono text-xs uppercase tracking-[0.1em] flex-1 py-3 border border-line text-fog hover:border-ember hover:text-ember transition-colors"
                >
                  Nouvel exercice
                </button>
                <button
                  onClick={onClose}
                  className="mono text-xs uppercase tracking-[0.1em] flex-1 py-3 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors"
                >
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WizardStep({
  title,
  onBack,
  children,
}: {
  title: string
  onBack?: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="mono text-[11px] uppercase tracking-[0.12em] text-fog hover:text-ember transition-colors mb-4"
        >
          ← Retour
        </button>
      )}
      <h2 className="display text-2xl font-800 mb-5">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function resultMessage(score: number, total: number) {
  const pct = score / total
  if (pct >= 0.9) return { tag: 'Excellent !', jp: '素晴らしい！' }
  if (pct >= 0.7) return { tag: 'Bien joué', jp: 'よくできました' }
  if (pct >= 0.5) return { tag: 'En progrès', jp: 'その調子！' }
  return { tag: 'Continue de t\'entraîner', jp: 'がんばって！' }
}

/* ------------------------------------------------------------------ */
/* Exercise runner — guided run of one exercise                        */
/* ------------------------------------------------------------------ */

function ExerciseRunner({ e, onClose }: { e: Exercise; onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const total = e.questions.length
  const qa = e.questions[idx]

  const grade = (ok: boolean) => {
    if (ok) setCorrect((c) => c + 1)
    if (idx + 1 >= total) setDone(true)
    else {
      setIdx((i) => i + 1)
      setRevealed(false)
    }
  }

  const restart = () => {
    setIdx(0)
    setRevealed(false)
    setCorrect(0)
    setDone(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-panel border border-line max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-panel z-10">
          <div className="flex items-center gap-3">
            <span className="jp text-ember text-xl">練習</span>
            <div>
              <div className="display font-800 text-lg leading-none">{e.title}</div>
              <div className="mono text-[10px] text-fog uppercase tracking-[0.12em] mt-1">
                {done ? 'Bilan' : `Question ${idx + 1} / ${total} · ${e.subject}`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 grid place-items-center border border-line text-fog hover:border-ember hover:text-ember transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {!done ? (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-1 flex-1 bg-line overflow-hidden">
                  <div
                    className="h-full bg-ember transition-all duration-300"
                    style={{ width: `${(idx / total) * 100}%` }}
                  />
                </div>
                <span className="mono text-[11px] text-fog">
                  {correct} <span className="text-ember">★</span>
                </span>
              </div>

              <div className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-3">
                {e.prompt}
              </div>

              <div className="text-center py-8 mb-6 border border-line bg-ink/40 relative">
                <span className="absolute top-3 left-3 mono text-ember text-sm">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="absolute top-3 right-3">
                  <SpeakBtn text={qa.q.replace(/＿+/g, '')} />
                </span>
                <p className="jp text-3xl leading-relaxed px-6">{qa.q}</p>
              </div>

              {!revealed ? (
                <div className="text-center">
                  <p className="mono text-[11px] text-fog uppercase tracking-[0.1em] mb-4">
                    Formule ta réponse, puis vérifie la correction.
                  </p>
                  <button
                    onClick={() => setRevealed(true)}
                    className="mono text-sm uppercase tracking-[0.1em] w-full py-3.5 border border-ember text-ember font-600 hover:bg-ember hover:text-ink transition-colors"
                  >
                    Afficher la correction →
                  </button>
                </div>
              ) : (
                <div>
                  <div className="border-l-2 border-ember pl-4 py-2 mb-6 bg-ink/40">
                    <div className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-1">
                      Correction
                    </div>
                    <p className="jp text-lg text-ember-soft leading-relaxed">{qa.a}</p>
                  </div>
                  <div className="mono text-[11px] text-fog uppercase tracking-[0.1em] mb-3 text-center">
                    As-tu trouvé la bonne réponse ?
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => grade(false)}
                      className="mono text-xs uppercase tracking-[0.1em] py-3.5 border border-red-500/50 text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      À revoir
                    </button>
                    <button
                      onClick={() => grade(true)}
                      className="mono text-xs uppercase tracking-[0.1em] py-3.5 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                    >
                      Réussi ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-4">
                {resultMessage(correct, total).tag}
              </div>
              <div className="jp text-5xl mb-2">{resultMessage(correct, total).jp}</div>
              <div className="display font-900 text-7xl tracking-tight my-4">
                {correct}
                <span className="text-fog text-3xl">/{total}</span>
              </div>
              <div className="mono text-sm text-fog mb-8">
                {Math.round((correct / total) * 100)}% de réussite
              </div>
              <div className="h-2 bg-line overflow-hidden mb-10 max-w-sm mx-auto">
                <div
                  className="h-full bg-ember transition-all duration-700"
                  style={{ width: `${(correct / total) * 100}%` }}
                />
              </div>
              <div className="flex gap-3 max-w-sm mx-auto">
                <button
                  onClick={restart}
                  className="mono text-xs uppercase tracking-[0.1em] flex-1 py-3 border border-line text-fog hover:border-ember hover:text-ember transition-colors"
                >
                  Recommencer
                </button>
                <button
                  onClick={onClose}
                  className="mono text-xs uppercase tracking-[0.1em] flex-1 py-3 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors"
                >
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

type Detail =
  | { type: 'theme'; id: string }
  | { type: 'kanji'; id: string }
  | { type: 'rule'; id: string }
  | { type: 'exercise'; id: string }
  | null

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [nav, setNav] = useState<NavKey>('dashboard')
  const [detail, setDetail] = useState<Detail>(null)
  const [practiceType, setPracticeType] = useState<QType | 'any' | null>(null)
  const [runId, setRunId] = useState<string | null>(null)

  if (!authed) return <Auth onEnter={() => setAuthed(true)} />

  const go = (k: NavKey) => {
    setNav(k)
    setDetail(null)
  }
  const openTheme = (id: string) => setDetail({ type: 'theme', id })
  const openKanji = (id: string) => setDetail({ type: 'kanji', id })
  const openRule = (id: string) => setDetail({ type: 'rule', id })
  const openExercise = (id: string) => setDetail({ type: 'exercise', id })
  const runExercise = (id: string) => setRunId(id)
  const openPractice = (t: QType | 'any' = 'any') => setPracticeType(t)

  let content: React.ReactNode

  if (detail?.type === 'theme') {
    const t = themes.find((x) => x.id === detail.id)!
    content = (
      <ThemeDetail
        theme={t}
        onBack={() => {
          setNav('themes')
          setDetail(null)
        }}
        onOpenKanji={openKanji}
        onOpenRule={openRule}
        onOpenExercise={openExercise}
      />
    )
  } else if (detail?.type === 'kanji') {
    content = (
      <KanjiDetail
        k={kanjis.find((x) => x.id === detail.id)!}
        onBack={() => setDetail(null)}
        onTheme={openTheme}
      />
    )
  } else if (detail?.type === 'rule') {
    content = (
      <RuleDetail
        r={rules.find((x) => x.id === detail.id)!}
        onBack={() => setDetail(null)}
        onTheme={openTheme}
        onOpenExercise={openExercise}
      />
    )
  } else if (detail?.type === 'exercise') {
    content = (
      <ExerciseDetail
        e={exercises.find((x) => x.id === detail.id)!}
        onBack={() => setDetail(null)}
        onTheme={openTheme}
        onRun={runExercise}
      />
    )
  } else {
    switch (nav) {
      case 'dashboard':
        content = (
          <DashboardView
            onOpenTheme={openTheme}
            onPractice={() => openPractice('any')}
            onRun={runExercise}
          />
        )
        break
      case 'vocab':
        content = <VocabView onTheme={openTheme} onExercise={() => openPractice('vocab')} />
        break
      case 'hiragana':
        content = (
          <KanaView
            index="1a"
            title="Hiragana"
            jp="ひらがな"
            table={hiragana}
            onExercise={() => openPractice('hiragana')}
          />
        )
        break
      case 'katakana':
        content = (
          <KanaView
            index="1b"
            title="Katakana"
            jp="カタカナ"
            table={katakana}
            onExercise={() => openPractice('katakana')}
          />
        )
        break
      case 'themes':
        content = <ThemesView onOpen={openTheme} />
        break
      case 'kanji':
        content = (
          <KanjiView onOpen={openKanji} onTheme={openTheme} onExercise={() => openPractice('kanji')} />
        )
        break
      case 'grammar':
        content = <GrammarView onOpen={openRule} />
        break
      case 'exercises':
        content = <ExercisesView onOpen={openExercise} onRun={runExercise} />
        break
      case 'sentences':
        content = <SentencesView onTheme={openTheme} />
        break
    }
  }

  return (
    <div className="h-full flex bg-ink text-chalk">
      <Sidebar
        active={nav}
        onNav={go}
        onLogout={() => setAuthed(false)}
        onPractice={() => openPractice('any')}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{content}</div>
      </main>
      {practiceType && (
        <Practice
          initialType={practiceType === 'any' ? undefined : practiceType}
          onClose={() => setPracticeType(null)}
        />
      )}
      {runId && (
        <ExerciseRunner
          e={exercises.find((x) => x.id === runId)!}
          onClose={() => setRunId(null)}
        />
      )}
    </div>
  )
}
