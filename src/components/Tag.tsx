import { themeTitle } from "@/lib/themeTitle"

export function Tag({
  id,
  onClick,
}: {
  id: string
  onClick?: (id: string) => void
}) {
  return (
    <button
      onClick={onClick ? () => onClick(id) : undefined}
      className={
        "mono text-[10px] uppercase tracking-[0.12em] px-2 py-[3px] border border-line text-fog " +
        "transition-colors hover:border-ember hover:text-ember " +
        (onClick ? "cursor-pointer" : "cursor-default")
      }
    >
      {themeTitle(id)}
    </button>
  )
}
