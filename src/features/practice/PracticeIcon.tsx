import type { ReactNode } from "react"

/**
 * Icônes des cartes de l'assistant « M'exercer » : une par sujet
 * (`words`, `kanjis`…) et par focus (`theme`, `weakness`, `random`…).
 * Clé inconnue : icône générique.
 */

const PATHS: Record<string, ReactNode> = {
  // Sujets
  words: (
    <>
      <path d="M4 5h11a3 3 0 0 1 3 3v11H7a3 3 0 0 1-3-3z" />
      <path d="M4 16a3 3 0 0 1 3-3h11" />
      <path d="M8 8h6" />
    </>
  ),
  kanjis: (
    <>
      <path d="M19 3l-8.5 8.5" />
      <path d="M10.5 11.5c-2.5 0-4 1.5-4.5 4-.3 1.7-1.3 3-3 3.5 3 1.5 7.5 1 9-2.5.6-1.5.3-3.2-1.5-5z" />
      <path d="M16 6l2 2" />
    </>
  ),
  hiraganas: (
    <>
      <path d="M5 7c3 .5 6 .3 9-.5" />
      <path d="M10 4c-.5 5 0 10 2 15" />
      <path d="M16 11c-4 0-8 2.5-8 5.5 0 2 2 2.5 4 1.5 3-1.5 6-4 7-7" />
    </>
  ),
  katakanas: (
    <>
      <path d="M5 6h13l-2 5" />
      <path d="M11 6c0 6-2 10-6 13" />
    </>
  ),
  sentences: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </>
  ),
  mix: (
    <>
      <path d="M3 7h3c4 0 6 10 10 10h4" />
      <path d="M3 17h3c1.6 0 2.8-1.6 3.9-3.5" />
      <path d="M14 10.5C15 8.6 16.3 7 18 7h2" />
      <path d="M18 4l3 3-3 3" />
      <path d="M18 14l3 3-3 3" />
    </>
  ),
  // Focus
  theme: (
    <>
      <rect x="4" y="5" width="16" height="15" />
      <path d="M4 10h16" />
      <path d="M9 3v4" />
      <path d="M15 3v4" />
      <path d="M8 14h3v3H8z" />
    </>
  ),
  weakness: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  random: (
    <>
      <rect x="4" y="4" width="16" height="16" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
    </>
  ),
  progressive: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20v-3h3v3" />
      <path d="M10.5 20v-6h3v6" />
      <path d="M15 20v-9h3v9" />
      <path d="M4 12l5-4 4 2 6-6" />
      <path d="M16 4h3v3" />
    </>
  ),
  new: (
    <>
      <path d="M12 3l2 6.5L20.5 12 14 14.5 12 21l-2-6.5L3.5 12 10 9.5z" />
    </>
  ),
  review: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 4v5h-5" />
    </>
  ),
}

const FALLBACK = (
  <>
    <path d="M12 3l2 6.5L20.5 12 14 14.5 12 21l-2-6.5L3.5 12 10 9.5z" />
  </>
)

export default function PracticeIcon({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name] ?? FALLBACK}
    </svg>
  )
}
