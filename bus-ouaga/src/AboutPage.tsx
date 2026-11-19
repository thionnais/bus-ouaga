// ===== PAGE : À PROPOS =====
import { FARE_FCFA } from "./constants";

export default function AboutPage() {
  return (
    <div className="page">
      <div className="page-inner">
        <h1>À propos</h1>

        <h2>À quoi sert cette application ?</h2>
        <p>
          Elle aide à se repérer dans le réseau de bus de la SOTRACO à
          Ouagadougou : les lignes, les arrêts, les prochains départs et les
          arrêts les plus proches de soi. Elle est pensée pour celles et ceux
          qui découvrent la ville, notamment les étudiantes et étudiants venus
          de l'étranger.
        </p>

        <h2>D'où viennent les informations ?</h2>
        <p>
          Les lignes, les arrêts et les horaires sont recopiés depuis le site
          sotraco.bf. Ce sont des <strong>heures de départ aux terminus</strong>,
          pas aux arrêts intermédiaires, et elles peuvent varier selon la
          circulation. Les lignes spéciales (UO1 et UTS) n'ont pas d'horaires
          publiés. Les positions des arrêts ont été placées à la main : elles
          peuvent être approximatives.
        </p>
        <p>
          Ticket à la course : {FARE_FCFA} F sur les lignes ordinaires.
        </p>

        <h2>Un projet indépendant</h2>
        <p>
          À ce stade, ce projet n'est pas un service officiel de la SOTRACO. En
          cas de doute, fiez-vous aux informations affichées dans les bus et aux
          arrêts.
        </p>

        <h2>Votre position</h2>
        <p>
          Le bouton « Arrêts proches de moi » utilise la position de votre
          appareil uniquement dans votre navigateur, pour calculer les distances.
          Elle n'est ni envoyée ni enregistrée.
        </p>

        <h2>Fond de carte</h2>
        <p>
          Carte ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenStreetMap contributors
          </a>
          .
        </p>
      </div>
    </div>
  );
}