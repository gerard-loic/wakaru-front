import { useEffect, useRef, useState, type FC } from "react"
import { IconGear, IconLock, IconLogout, IconUser } from "@/components/icons"
import { ProfileModal } from "@/features/account/ProfileModal"
import { PasswordModal } from "@/features/account/PasswordModal"
import { DeleteAccountModal } from "@/features/account/DeleteAccountModal"
import type { CurrentUser } from "@/layout/useCurrentUser"

/**
 * Bloc utilisateur du bas de la sidebar : avatar, nom, niveau. Un clic sur le
 * bloc ouvre un sous-menu (informations personnelles, mot de passe,
 * déconnexion). Le menu se ferme au clic extérieur ou par Échap.
 */
export function UserMenu({
  user,
  onUserChange,
  onLogout,
}: {
  /** Utilisateur connecté, `null` tant qu'il n'est pas chargé. */
  user: CurrentUser | null
  onUserChange: () => void
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const [dialog, setDialog] = useState<
    "profile" | "password" | "delete" | null
  >(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const choose = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={user?.email}
        aria-label="Mon compte"
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          "group w-full flex items-center gap-2.5 px-2.5 py-2.5 text-left border bg-panel-2 transition-colors " +
          (open ? "border-ember" : "border-line-bright hover:border-ember")
        }
      >
        <span className="size-9 shrink-0 grid place-items-center bg-ember text-ink font-700">
          {user?.initial ?? ""}
        </span>
        <span className="min-w-0 flex-1">
          {user ? (
            <>
              <span className="block text-sm font-600 text-chalk leading-tight truncate">
                {user.displayName}
              </span>
              {user.level && (
                <span className="block mono text-[10px] text-ember leading-tight truncate mt-0.5">
                  Niveau {user.level}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="block h-3.5 w-24 bg-line animate-pulse mb-1.5" />
              <span className="block h-2.5 w-14 bg-line animate-pulse" />
            </>
          )}
        </span>
        <span
          className={
            "shrink-0 transition-colors " +
            (open ? "text-ember" : "text-fog group-hover:text-ember")
          }
        >
          <IconGear />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 right-0 bottom-full mb-2 z-20 bg-line-bright text-white py-1 shadow-xl shadow-ink/60"
        >
          <MenuItem
            Icon={IconUser}
            label="Modifier mon profil"
            disabled={!user}
            onClick={choose(() => setDialog("profile"))}
          />
          <MenuItem
            Icon={IconLock}
            label="Modifier mon mot de passe"
            disabled={!user}
            onClick={choose(() => setDialog("password"))}
          />
          <div className="my-1 border-t border-white/15" />
          <MenuItem
            Icon={IconLogout}
            label="Déconnexion"
            onClick={choose(onLogout)}
          />
        </div>
      )}

      {user && dialog === "profile" && (
        <ProfileModal
          user={user}
          onSaved={onUserChange}
          onDeleteAccount={() => setDialog("delete")}
          onClose={() => setDialog(null)}
        />
      )}
      {user && dialog === "password" && (
        <PasswordModal onClose={() => setDialog(null)} />
      )}
      {user && dialog === "delete" && (
        <DeleteAccountModal
          onDeleted={onLogout}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}

function MenuItem({
  Icon,
  label,
  disabled,
  onClick,
}: {
  Icon: FC
  label: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-500 text-white hover:bg-ember hover:text-ink transition-colors disabled:opacity-50 disabled:pointer-events-none"
    >
      <Icon />
      {label}
    </button>
  )
}
