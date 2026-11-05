export function Search({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative w-full min-w-0 flex-1 md:w-auto md:flex-none">
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
        className="mono text-base md:text-xs bg-panel border border-line pl-9 pr-3 py-2.5 w-full md:w-72 text-chalk placeholder:text-fog/60 outline-none focus:border-ember transition-colors"
      />
    </div>
  )
}
