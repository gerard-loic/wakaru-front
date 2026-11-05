import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/Logo"

// TODO: renseigner l'identité réelle de l'éditeur avant mise en ligne.
const EDITOR = "Loïc Gerard"
const CONTACT_EMAIL = "wakaru@e-kodo.fr"
const HOST =
  "SAS PulseHeberg, 9 boulevard de Strasbourg, 83000 Toulon, France (RCS Toulon 824 070 619), téléphone : +33 (0)4 22 14 13 60"
const LAST_UPDATE = "4 novembre 2026"

/**
 * Conditions générales d'utilisation, accessibles sans être connecté
 * (liées depuis le formulaire d'inscription).
 */
export function TermsScreen() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        <div className="flex items-center justify-between mb-12">
          <Logo />
          <Link
            to="/"
            className="mono text-[11px] uppercase tracking-[0.12em] text-fog hover:text-ember transition-colors"
          >
            ← Retour à Wakaru
          </Link>
        </div>

        <div className="mono text-[11px] uppercase tracking-[0.2em] text-ember mb-2">
          利用規約 / Conditions d'utilisation
        </div>
        <h1 className="display text-3xl lg:text-4xl font-800 mb-3">
          Conditions générales d'utilisation
        </h1>
        <p className="mono text-xs text-fog mb-10">
          Dernière mise à jour : {LAST_UPDATE}
        </p>

        <div className="border border-ember/40 bg-ember/5 px-4 py-3 mb-12 text-sm text-chalk leading-relaxed">
          Wakaru est actuellement proposé en <strong>accès bêta gratuit</strong>.
          Ses contenus pédagogiques sont{" "}
          <strong>générés par intelligence artificielle</strong> et peuvent
          contenir des erreurs. Le service est fourni en l'état, sans
          garantie, et peut être interrompu à tout moment. Des fonctionnalités
          payantes optionnelles pourront être proposées par la suite : aucun
          montant ne sera facturé sans l'accord de l'Utilisateur.
        </div>

        <div className="space-y-10">
          <Article n={1} title="Objet">
            <p>
              Les présentes conditions générales d'utilisation (« CGU »)
              encadrent l'accès et l'utilisation de Wakaru (le « Service »),
              une application d'apprentissage du japonais. L'« Utilisateur »
              désigne toute personne qui crée un compte ou utilise le Service.
              La création d'un compte implique l'acceptation pleine et entière
              des présentes CGU. Toute personne qui ne les accepte pas ne doit
              pas utiliser le Service.
            </p>
          </Article>

          <Article n={2} title="Éditeur et hébergeur">
            <p>
              Le Service est édité par {EDITOR} (l'« Éditeur »). Toute
              question peut être adressée à {CONTACT_EMAIL}.
            </p>
            <p>Le Service est hébergé par {HOST}.</p>
          </Article>

          <Article n={3} title="Accès en version bêta">
            <p>
              Le Service est en phase de test (« bêta »). Il est donc
              susceptible de contenir des erreurs, des bugs, des contenus
              incomplets ou inexacts, et ses fonctionnalités peuvent évoluer,
              être modifiées ou retirées sans préavis.
            </p>
            <p>
              L'accès à la bêta est accordé à titre gracieux et personnel.
              L'Éditeur peut limiter le nombre d'utilisateurs, refuser ou
              retirer un accès, à sa seule discrétion.
            </p>
          </Article>

          <Article n={4} title="Contenus générés par intelligence artificielle">
            <p>
              Wakaru est un projet expérimental dont l'objet est d'explorer
              la capacité de l'intelligence artificielle (« IA ») à produire
              des contenus d'apprentissage. Les contenus pédagogiques du
              Service — notamment le vocabulaire, les fiches de kanji, les
              règles et explications de grammaire, les phrases d'exemple et
              leurs analyses, les thèmes et les exercices — sont{" "}
              <strong className="text-chalk">
                générés en tout ou partie par des outils d'IA
              </strong>
              . Ils n'ont pas tous fait l'objet d'une relecture humaine
              systématique, notamment par un enseignant ou un locuteur natif.
            </p>
            <p>
              Ces contenus peuvent donc comporter des erreurs, des
              approximations, des traductions imparfaites ou des
              formulations peu naturelles. Ils sont proposés à titre
              d'aide à l'apprentissage et ne remplacent ni un enseignement
              dispensé par un professionnel, ni des ressources de référence
              (dictionnaires, manuels). L'Utilisateur est invité à les
              vérifier en cas de doute et à signaler toute erreur à{" "}
              {CONTACT_EMAIL}.
            </p>
            <p>
              L'IA a également été utilisée pour concevoir et développer le
              Service lui-même.
            </p>
          </Article>

          <Article n={5} title="Compte utilisateur">
            <p>
              L'inscription nécessite une adresse e-mail valide, un prénom, un
              nom et un mot de passe. L'Utilisateur s'engage à fournir des
              informations exactes et à garder son mot de passe confidentiel.
              Toute activité réalisée depuis son compte est réputée effectuée
              par lui.
            </p>
            <p>
              L'Utilisateur peut supprimer son compte à tout moment directement
              depuis l'interface du Service, dans ses informations
              personnelles, ou en écrivant à {CONTACT_EMAIL}. Cette suppression
              est définitive et entraîne celle de ses données personnelles.
            </p>
          </Article>

          <Article n={6} title="Gratuité et fonctionnalités payantes">
            <p>
              Le Service est actuellement gratuit et a vocation à le rester
              pour l'essentiel, sans que cela constitue un engagement de
              gratuité définitive. L'Éditeur se réserve le droit de proposer
              à l'avenir de nouvelles fonctionnalités ou options payantes,
              dont la souscription sera facultative.
            </p>
            <p>
              Toute fonctionnalité payante sera clairement identifiée comme
              telle, avec son prix, et soumise à des conditions de vente
              spécifiques que l'Utilisateur devra accepter avant de souscrire.
              Aucun paiement ne sera exigé sans son consentement explicite.
            </p>
            <p>
              Si une fonctionnalité existante devait passer de gratuite à
              payante, l'Utilisateur en serait informé par e-mail ou dans
              l'application au moins trente (30) jours à l'avance. Il resterait
              libre de ne pas y souscrire, de cesser d'utiliser le Service et
              de supprimer son compte.
            </p>
          </Article>

          <Article n={7} title="Disponibilité, suspension et arrêt du Service">
            <p>
              L'Éditeur ne garantit pas la disponibilité continue du Service.
              Il peut, à tout moment, avec ou sans préavis, suspendre,
              interrompre ou arrêter définitivement tout ou partie du Service,
              notamment pour maintenance, évolution technique ou fin de la
              phase bêta.
            </p>
            <p>
              L'Éditeur peut également suspendre ou supprimer un compte en cas
              de manquement aux présentes CGU.
            </p>
            <p>
              Les fonctionnalités gratuites étant fournies sans contrepartie,
              ces interruptions ne donnent lieu à aucune indemnité. Les
              fonctionnalités payantes relèvent de leurs conditions de vente
              spécifiques.
            </p>
          </Article>

          <Article n={8} title="Absence de garantie">
            <p>
              Le Service est fourni « en l'état » et « selon disponibilité ».
              Dans les limites permises par la loi, l'Éditeur n'offre aucune
              garantie, expresse ou implicite, notamment quant à
              l'exactitude des contenus pédagogiques générés par IA (voir
              l'article 4), à l'absence d'erreurs ou à l'adéquation
              du Service à un objectif particulier, comme la réussite d'un
              examen.
            </p>
            <p>
              Les données liées au compte de l'Utilisateur, y compris sa
              progression, peuvent être perdues ou réinitialisées pendant la bêta.
              L'Éditeur ne garantit pas leur conservation.
            </p>
          </Article>

          <Article n={9} title="Responsabilité">
            <p>
              Dans les limites permises par la loi applicable, l'Éditeur ne
              pourra être tenu responsable des dommages indirects résultant
              de l'utilisation ou de l'impossibilité d'utiliser le Service,
              notamment la perte de données ou de progression. Rien dans les
              présentes CGU n'exclut la responsabilité de l'Éditeur lorsque
              celle-ci ne peut légalement être exclue.
            </p>
          </Article>

          <Article n={10} title="Règles d'utilisation">
            <p>L'Utilisateur s'engage à ne pas :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                tenter d'accéder au Service ou à ses systèmes par des moyens
                non autorisés, ni perturber son fonctionnement ;
              </li>
              <li>
                extraire, copier ou réutiliser massivement les contenus du
                Service, notamment par des moyens automatisés ;
              </li>
              <li>partager son compte ou le céder à un tiers ;</li>
              <li>utiliser le Service à des fins illicites.</li>
            </ul>
          </Article>

          <Article n={11} title="Propriété intellectuelle">
            <p>
              Le Service, son interface, ses contenus, sa marque et son logo
              sont protégés par le droit de la propriété intellectuelle et
              restent la propriété de l'Éditeur ou de ses partenaires.
              L'Utilisateur bénéficie d'un droit d'utilisation personnel, non
              exclusif et non transférable, limité à la durée de son accès au
              Service.
            </p>
          </Article>

          <Article n={12} title="Données personnelles">
            <p>
              Pour fonctionner, le Service traite les données fournies par
              l'Utilisateur à l'inscription (prénom, nom, adresse e-mail) ainsi
              que les données relatives à son apprentissage (progression,
              résultats d'exercices). Ces données servent uniquement à
              fournir et améliorer le Service, ainsi qu'à contacter
              l'Utilisateur à son sujet (par exemple pour l'informer d'un
              changement de ces CGU ou du lancement de fonctionnalités
              payantes). Elles ne sont ni vendues ni cédées à des tiers à des
              fins commerciales.
            </p>
            <p>
              Conformément au Règlement général sur la protection des données
              (RGPD) et à la loi « Informatique et Libertés », l'Utilisateur
              dispose d'un droit d'accès, de rectification, d'effacement, de
              limitation, d'opposition et de portabilité de ses données. Ces
              droits s'exercent en écrivant à {CONTACT_EMAIL}. Le droit
              d'effacement peut aussi s'exercer directement en supprimant son
              compte depuis l'interface du Service. L'Utilisateur peut aussi
              introduire une réclamation auprès de la CNIL (cnil.fr).
            </p>
          </Article>

          <Article n={13} title="Retours des utilisateurs">
            <p>
              Les retours, suggestions et signalements de bugs transmis par
              l'Utilisateur pendant la bêta sont les bienvenus. L'Utilisateur
              accepte que l'Éditeur puisse les utiliser librement pour
              améliorer le Service, sans contrepartie.
            </p>
          </Article>

          <Article n={14} title="Modification des CGU">
            <p>
              L'Éditeur peut modifier les présentes CGU à tout moment. En cas
              de modification importante, l'Utilisateur en sera informé par
              e-mail ou dans l'application. La poursuite de l'utilisation du
              Service après l'entrée en vigueur des nouvelles CGU vaut acceptation de
              celles-ci.
            </p>
          </Article>

          <Article n={15} title="Droit applicable">
            <p>
              Les présentes CGU sont soumises au droit français. En cas de
              litige, une solution amiable sera recherchée en priorité. À
              défaut, le litige sera porté devant les juridictions
              compétentes dans les conditions prévues par la loi.
            </p>
          </Article>
        </div>
      </div>
    </div>
  )
}

function Article({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="display text-xl font-700 mb-3 flex items-baseline gap-3">
        <span className="num text-xs text-ember">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-sm text-fog leading-relaxed">
        {children}
      </div>
    </section>
  )
}
