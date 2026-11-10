import { Modal } from "@/components/Modal"
import { CURRENT_RELEASE } from "@/lib/changelog"

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" })

/** Popin « Quoi de neuf ? » : version courante, date et nouveautés. */
export function ChangelogModal({ onClose }: { onClose: () => void }) {
  const { version, date, changes } = CURRENT_RELEASE
  return (
    <Modal
      title={<h2 className="display text-xl font-800">Quoi de neuf ?</h2>}
      subtitle={
        <span className="mono text-[11px] uppercase tracking-[0.2em] text-ember">
          Version {version} · {DATE_FORMAT.format(new Date(`${date}T12:00:00`))}
        </span>
      }
      onClose={onClose}
    >
      <ul className="space-y-2.5 text-sm">
        {changes.map((change) => (
          <li key={change} className="flex gap-3">
            <span aria-hidden className="text-ember shrink-0">
              ▸
            </span>
            <span>{change}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
