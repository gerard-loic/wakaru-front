import type { ReactNode } from "react"

export function SectionHead({
  title,
  jp,
  count,
  children,
}: {
  title: string
  jp: string
  count?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5 mb-6">
      <div className="flex items-end gap-4">
        <div>
          <div className="jp text-fog text-sm mb-1">{jp}</div>
          <h1 className="display text-4xl font-800 tracking-tight leading-none">
            {title}
          </h1>
        </div>
        {count && (
          <span className="mono text-xs text-fog mb-1 hidden sm:block">
            / {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
