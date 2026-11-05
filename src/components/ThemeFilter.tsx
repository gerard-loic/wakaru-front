import FilterSelect from "@/components/FilterSelect"
import type { ThemeOption } from "@/features/themes/useThemeOptions"

/** Filtre « éléments d'un thème uniquement », commun aux pages de liste. */
export default function ThemeFilter({
  value,
  onChange,
  themes,
}: {
  /** Thème sélectionné (`theme.id`), ou `null` pour tous. */
  value: number | null
  onChange: (theme: number | null) => void
  themes: ThemeOption[]
}) {
  return (
    <FilterSelect
      label="Thème"
      allLabel="Tous"
      value={value}
      onChange={onChange}
      options={themes}
    />
  )
}
