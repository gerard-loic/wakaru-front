import { useState, type FC } from "react"
import { Logo } from "@/components/Logo"
import {
  IconDash,
  IconWord,
  IconKana,
  IconGrid,
  IconBrush,
  IconRule,
  IconCheck,
  IconQuote,
  IconBoard,
  IconCoffee,
  IconInfo,
} from "@/components/icons"
import { AboutModal } from "@/layout/AboutModal"
import { useItemStats, type ItemStats } from "@/layout/useItemStats"
import { UserMenu } from "@/layout/UserMenu"
import type { CurrentUser } from "@/layout/useCurrentUser"

export type NavKey = "dashboard" | "vocab" | "hiragana" | "katakana" | "themes" | "kanji" | "grammar" | "exercises" | "sentences" | "blackboard"

const NAV: { key: NavKey; label: string; jp: string; Icon: FC }[] = [
  {
    key: "dashboard",
    label: "Tableau de bord",
    jp: "ダッシュボード",
    Icon: IconDash,
  },
  { key: "vocab", label: "Vocabulaire", jp: "単語", Icon: IconWord },
  { key: "hiragana", label: "Hiragana", jp: "ひらがな", Icon: IconKana },
  { key: "katakana", label: "Katakana", jp: "カタカナ", Icon: IconKana },
  { key: "themes", label: "Thèmes", jp: "テーマ", Icon: IconGrid },
  { key: "kanji", label: "Kanji", jp: "漢字", Icon: IconBrush },
  { key: "grammar", label: "Grammaire", jp: "文法", Icon: IconRule },
  { key: "exercises", label: "Exercices", jp: "練習", Icon: IconCheck },
  { key: "sentences", label: "Phrases", jp: "例文", Icon: IconQuote },
  { key: "blackboard", label: "Tableau noir", jp: "黒板", Icon: IconBoard },
]

/** Famille d'items de `GET /stats/items` correspondant à chaque entrée du menu. */
const STATS_KEY: Partial<Record<NavKey, keyof ItemStats>> = {
  vocab: "words",
  hiragana: "hiraganas",
  katakana: "katakanas",
  themes: "themes",
  kanji: "kanjis",
  grammar: "grammar_rules",
  exercises: "exercises",
  sentences: "sentences",
}

export function Sidebar({
  active,
  user,
  knowledgeVersion,
  onUserChange,
  onNav,
  onLogout,
  onPractice,
}: {
  active: NavKey
  user: CurrentUser | null
  /** Change quand la progression de l'utilisateur a été modifiée. */
  knowledgeVersion: number
  /** Appelé après une modification du profil. */
  onUserChange: () => void
  onNav: (k: NavKey) => void
  onLogout: () => void
  onPractice: () => void
}) {
  // Rechargé à chaque changement de section : consulter des items peut les marquer comme vus.
  const itemStats = useItemStats([active, knowledgeVersion])
  const [aboutOpen, setAboutOpen] = useState(false)
  return (
    <aside className="w-64 shrink-0 bg-panel border-r border-line flex flex-col h-full">
      <div className="px-[22px] py-4 border-b border-line flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNav("dashboard")}
          aria-label="Tableau de bord"
          className="block transition-opacity hover:opacity-80"
        >
          <Logo size="lg" />
        </button>
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          aria-label="À propos de Wakaru"
          title="À propos de Wakaru"
          className="size-8 shrink-0 grid place-items-center translate-y-1 text-fog hover:text-ember transition-colors"
        >
          <IconInfo />
        </button>
      </div>
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-4">
          <button
            onClick={onPractice}
            className="group w-full flex items-center gap-2.5 px-2.5 py-2.5 bg-ember text-ink transition-colors hover:bg-ember-soft"
          >
            <span className="jp text-lg leading-none w-9 shrink-0 text-center">練習</span>
            <span className="flex-1 min-w-0 text-left">
              <span className="block text-sm font-600 leading-tight">
                M'exercer
              </span>
              <span className="block mono text-[10px] leading-tight opacity-70 truncate mt-0.5">
                Quiz · 20 questions
              </span>
            </span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>

        
        {NAV.map((n, i) => {
          const on = active === n.key
          const statsKey = STATS_KEY[n.key]
          const newCount = statsKey ? (itemStats[statsKey]?.new ?? 0) : 0
          return (
            <button
              key={n.key}
              onClick={() => onNav(n.key)}
              className={
                "group w-full flex items-center gap-2.5 px-[22px] py-2 text-left transition-colors relative " +
                (on
                  ? "text-chalk bg-line"
                  : "text-fog hover:text-chalk hover:bg-line/60")
              }
            >
              <span
                className={
                  "absolute left-0 top-0 bottom-0 w-[3px] transition-all " +
                  (on
                    ? "bg-ember"
                    : "bg-transparent group-hover:bg-line-bright")
                }
              />
              <span
                className={
                  "w-9 shrink-0 grid place-items-center " +
                  (on ? "text-ember" : "text-fog group-hover:text-chalk")
                }
              >
                <n.Icon />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm leading-tight truncate">{n.label}</span>
                <span className="block jp text-[10px] text-fog leading-tight">
                  {n.jp}
                </span>
              </span>
              {newCount > 0 ? (
                <span
                  title={`${newCount} nouveau${newCount > 1 ? "x" : ""}`}
                  className="num text-[10px] font-700 min-w-5 h-5 px-1 grid place-items-center bg-ember text-ink rounded-full leading-none"
                >
                  {newCount}
                </span>
              ) : (
                <span className="mono text-[10px] text-fog">
                  
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-line">
        <UserMenu user={user} onUserChange={onUserChange} onLogout={onLogout} />
        <a
          href="https://buymeacoffee.com/lgerard"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 w-full flex items-center gap-2.5 px-2.5 py-2 bg-ember text-ink transition-colors hover:bg-ember-soft"
        >
          <span className="w-9 shrink-0 grid place-items-center">
            <IconCoffee />
          </span>
          <span className="flex-1 min-w-0 text-left">
            <span className="block text-sm font-600 leading-tight truncate">
              Offrez-moi un café
            </span>
            <span className="block mono text-[10px] leading-tight opacity-70 truncate">
              Soutenez Wakaru
            </span>
          </span>
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>
    </aside>
  )
}
