import { Link } from "react-router-dom"
import wakaruLogo from "@/imports/image.png"
import { Modal } from "@/components/Modal"
import { IconCoffee } from "@/components/icons"

/** Popin « À propos » : présentation du projet, soutien et CGU. */
export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title={<h2 className="display text-xl font-800">À propos de Wakaru</h2>}
      subtitle={
        <span className="mono text-[11px] uppercase tracking-[0.2em] text-ember">
          分かるについて
        </span>
      }
      onClose={onClose}
    >
      <div className="bg-wakaru flex justify-center -mx-6 -mt-6 mb-6">
        <img
          src={wakaruLogo}
          alt="Wakaru"
          className="w-[min(26rem,90%)] h-auto object-contain"
        />
      </div>

      <div className="space-y-3 text-sm text-fog leading-relaxed">
        <p>
          <span className="jp text-chalk">分かる</span> (<em>wakaru</em>)
          signifie « comprendre » en japonais. C'est l'ambition de Wakaru :
          t'aider à vraiment comprendre la langue, pas seulement à la
          mémoriser.
        </p>
        <p>
          Je suis ingénieur, et j'ai conçu Wakaru pour explorer ce que
          l'intelligence artificielle peut faire en matière de{" "}
          <strong className="text-chalk">
            création de contenus éducatifs
          </strong>
          .
        </p>
        <p>
          L'objectif : te proposer{" "}
          <strong className="text-chalk">
            du nouveau contenu chaque semaine
          </strong>
          , adapté à ton niveau et surtout à l'actualité et à la période de
          l'année. Un contenu unique, pensé pour le moment présent, qui donne
          un rythme à ton apprentissage.
        </p>
        <p>
          Tu y retrouves les hiragana et katakana, le vocabulaire, les kanji,
          la grammaire et des phrases d'exemple décortiquées, avec des
          exercices et des quiz pour t'entraîner et un suivi de ta maîtrise au
          fil du temps.
        </p>
        <p>
          Ces contenus étant générés par l'IA, ils peuvent parfois contenir des
          imprécisions : tes retours sont précieux pour les améliorer.
        </p>
        <p>
          Wakaru est proposé en{" "}
          <strong className="text-chalk">accès bêta gratuit</strong>. Si
          l'application t'aide dans ton apprentissage, tu peux soutenir le
          projet en m'offrant un café.
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href="https://buymeacoffee.com/lgerard"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex-1 flex items-center gap-2.5 px-3 py-2.5 bg-ember text-ink transition-colors hover:bg-ember-soft"
        >
          <IconCoffee />
          <span className="flex-1 text-sm font-600">Offrez-moi un café</span>
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>
        <Link
          to="/cgu"
          target="_blank"
          rel="noopener"
          className="flex-1 flex items-center justify-center px-3 py-2.5 border border-line text-sm text-fog hover:border-ember hover:text-ember transition-colors"
        >
          Conditions générales d'utilisation
        </Link>
      </div>
    </Modal>
  )
}
