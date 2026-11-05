// Ordre alphabétique français : accents et casse ignorés, « 2 » avant « 10 ».
const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true })

/** Liste déroulante de filtre (catégorie, nature, thème…). `null` = aucun filtre. */
export default function FilterSelect({
  label,
  allLabel,
  value,
  onChange,
  options,
}: {
  label: string
  /** Libellé de l'entrée sans filtre (« Tous », « Toutes »). */
  allLabel: string
  value: number | null
  onChange: (value: number | null) => void
  options: { id: number; name: string }[]
}) {
  // Une seule entrée ne filtrerait rien.
  if (options.length < 2) return null

  const active = value !== null
  const sorted = [...options].sort((a, b) => collator.compare(a.name, b.name))

  return (
    <label
      className={
        "group relative flex items-center min-w-0 max-w-full bg-panel border transition-colors cursor-pointer focus-within:border-ember " +
        (active ? "border-ember/60" : "border-line hover:border-line-bright")
      }
    >
      <span className="mono shrink-0 pl-3 text-[10px] uppercase tracking-[0.1em] text-fog">
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className={
          "mono appearance-none min-w-0 max-w-52 truncate bg-transparent pl-2.5 pr-8 py-2 text-xs outline-none cursor-pointer [&>option]:bg-panel [&>option]:text-chalk " +
          (active ? "text-ember" : "text-chalk")
        }
      >
        <option value="">{allLabel}</option>
        {sorted.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className={
          "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors group-hover:text-chalk " +
          (active ? "text-ember" : "text-fog")
        }
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  )
}
