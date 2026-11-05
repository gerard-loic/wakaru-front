import { sylo } from "@/lib/sylo"
import { useRemote } from "@/lib/useRemote"

/** Enregistrement `users` tel que renvoyé par `GET /users/me?with=level`. */
interface UserRecord {
  email: string
  first_name: string
  last_name: string
  level?: { uid: string; name: string } | null
}

/** Utilisateur connecté, prêt à afficher. */
export interface CurrentUser {
  firstName: string
  lastName: string
  /** « Prénom N. », ou l'e-mail à défaut de nom. */
  displayName: string
  /** Initiale affichée dans l'avatar. */
  initial: string
  email: string
  /** Nom du niveau (`levels.name`), ou `null` s'il est inconnu. */
  level: string | null
}

/**
 * Charge l'utilisateur connecté (`GET /users/me`). `user` vaut `null` tant
 * qu'il n'est pas chargé ou en cas d'erreur ; `reload` le recharge (après une
 * modification du profil, par exemple).
 */
export function useCurrentUser(): {
  user: CurrentUser | null
  reload: () => void
} {
  const { data, reload } = useRemote(
    async () =>
      toCurrentUser(
        await sylo.get<UserRecord>("users", "me", { with: ["level"] }),
      ),
    null as CurrentUser | null,
    [],
  )
  return { user: data, reload }
}

function toCurrentUser(r: UserRecord): CurrentUser {
  const first = r.first_name?.trim() ?? ""
  const last = r.last_name?.trim() ?? ""
  const name = [first, last ? `${last[0].toUpperCase()}.` : ""]
    .filter(Boolean)
    .join(" ")
  const displayName = name || r.email
  return {
    firstName: first,
    lastName: last,
    displayName,
    initial: (displayName[0] ?? "?").toUpperCase(),
    email: r.email,
    level: r.level?.name ?? null,
  }
}
