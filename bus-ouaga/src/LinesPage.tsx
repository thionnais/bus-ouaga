// ===== 1. IMPORTS =====
import type { Stop, Line, DayType } from "./types";
import { DAY_LABELS } from "./timetable";
import { FARE_FCFA } from "./constants";
import stopsData from "./data/stops.json";
import linesData from "./data/lines.json";

// ===== 2. DONNÉES =====
const stops = stopsData as Stop[];
const lines = linesData as Line[];
const stopsById = new Map(stops.map((stop) => [stop.id, stop]));

// Les trois types de jours, dans l'ordre d'affichage
const DAY_TYPES: DayType[] = ["weekday", "saturday", "sundayHoliday"];

// Texte affiché pour chaque catégorie de ligne
const CATEGORY_LABELS: Record<Line["category"], string> = {
  urbaine: "Ligne urbaine",
  intercommunale: "Ligne intercommunale",
  speciale: "Ligne spéciale",
};

// ===== 3. PAGE : LA LISTE COMPLÈTE DES LIGNES =====
export default function LinesPage() {
  return (
    <div className="page">
      <div className="page-inner">
        <h1>Lignes</h1>
        <p>
          {lines.length} lignes enregistrées. Ticket à la course : {FARE_FCFA} F
          sur les lignes ordinaires.
        </p>

        {lines.map((line) => {
          // Horaires de cette ligne (undefined si la SOTRACO n'en publie pas)
          const timetable = line.timetable;

          return (
            <article key={line.id} className="line-card">
              <h2>
                Ligne {line.number} : {line.from} → {line.to}
              </h2>
              <p className="muted">
                {CATEGORY_LABELS[line.category]}
                {line.via ? ` · via ${line.via}` : ""}
              </p>

              {/* Les arrêts, dans l'ordre (repliés par défaut) */}
              <details>
                <summary>Arrêts ({line.stopIds.length})</summary>
                <ol>
                  {line.stopIds.map((id) => (
                    <li key={id}>{stopsById.get(id)?.name ?? "Arrêt inconnu"}</li>
                  ))}
                </ol>
              </details>

              {/* Les horaires, ou une explication s'ils n'existent pas */}
              {timetable ? (
                <details>
                  <summary>Horaires (départs aux terminus)</summary>
                  <p className="muted">
                    Heures de départ aux terminus, elles peuvent varier selon la
                    circulation.
                  </p>
                  {DAY_TYPES.map((dayType) => (
                    <div key={dayType}>
                      <h3>{DAY_LABELS[dayType]}</h3>
                      <p>
                        <strong>
                          {line.from} → {line.to} :
                        </strong>{" "}
                        {timetable[dayType].forward.join(" · ")}
                      </p>
                      <p>
                        <strong>
                          {line.to} → {line.from} :
                        </strong>{" "}
                        {timetable[dayType].backward.join(" · ")}
                      </p>
                    </div>
                  ))}
                </details>
              ) : (
                <p className="muted">
                  Horaires non publiés par la SOTRACO pour cette ligne.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}