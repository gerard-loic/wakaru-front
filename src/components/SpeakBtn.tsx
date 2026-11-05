import { useState } from "react"
import { speak } from "@/lib/speak"

export function SpeakBtn({ text, big }: { text: string; big?: boolean }) {
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
        "grid place-items-center border border-line text-fog transition-all " +
        "hover:border-ember hover:text-ember active:scale-95 " +
        (on ? "border-ember text-ember bg-ember/10 " : "") +
        (big ? "size-11" : "size-8")
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
