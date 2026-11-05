import { useEffect, useRef } from "react"

/**
 * Appelle `reload` à chaque changement de `version` (mais pas au montage) :
 * recharge une donnée déjà affichée quand elle a été modifiée ailleurs.
 */
export function useReloadOn(version: number, reload: () => void) {
  const last = useRef(version)
  useEffect(() => {
    if (version === last.current) return
    last.current = version
    reload()
  }, [version, reload])
}
