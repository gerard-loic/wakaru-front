import { useEffect, useState } from "react"

/**
 * Renvoie `value` une fois qu'elle n'a plus changé pendant `delay` ms. Sert à
 * ne lancer une recherche qu'à la fin de la frappe.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
