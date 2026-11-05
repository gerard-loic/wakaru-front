import { useEffect, useId, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const MAX_WIDTH = {
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
}

/**
 * Popin générique : fond assombri, panneau centré avec en-tête (titre,
 * sous-titre, fermeture) et contenu défilant.
 *
 * Accessibilité : `role="dialog"` + `aria-modal`, fermeture par Échap ou clic
 * sur le fond, focus placé dans le panneau à l'ouverture, gardé à l'intérieur
 * (Tab / Maj+Tab) et rendu à l'élément d'origine à la fermeture.
 *
 * Rendue dans `body` : le tiroir de navigation (`translate`) servirait sinon de
 * référence au `position: fixed` et enfermerait les popins qu'il ouvre.
 */
export function Modal({
  title,
  subtitle,
  aside,
  footer,
  onClose,
  size = "md",
  children,
}: {
  /** Titre (annoncé comme nom de la popin). */
  title: ReactNode
  subtitle?: ReactNode
  /** Contenu ajouté à gauche du bouton de fermeture (actions, badges…). */
  aside?: ReactNode
  /** Mention affichée sous le contenu, séparée par un filet. */
  footer?: ReactNode
  onClose: () => void
  size?: "md" | "lg" | "xl"
  children: ReactNode
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  // `onClose` change à chaque rendu : on garde la dernière version sans
  // réabonner les écouteurs clavier.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== "Tab" || !panelRef.current) return
      const items = [
        ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      previous?.focus?.()
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => {
        // Clic sur le fond uniquement (pas un glisser commencé dans le panneau).
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={
          "w-full bg-panel border border-line max-h-full sm:max-h-[90dvh] overflow-y-auto outline-none " +
          MAX_WIDTH[size]
        }
      >
        <div className="flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-line sticky [@media(max-height:30rem)]:static top-0 bg-panel z-10">
          <div className="min-w-0">
            <div id={titleId}>{title}</div>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {aside}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="size-8 grid place-items-center border border-line text-fog hover:border-ember hover:text-ember transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
        {footer && (
          <div className="px-4 sm:px-6 py-3 border-t border-line">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
