// ===== 1. IMPORTS : les outils dont on a besoin =====
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Stop, Line } from "./types";
import { FARE_FCFA } from "./constants";
import stopsData from "./data/stops.json";
import linesData from "./data/lines.json";
import { getDayType, getNextDepartures, DAY_LABELS } from "./timetable";

// ===== 2. DONNÉES : on lit les fichiers JSON =====
const stops = stopsData as Stop[];
const lines = linesData as Line[];

// Dictionnaire pour retrouver un arrêt à partir de son id
const stopsById = new Map(stops.map((stop) => [stop.id, stop]));

// Une couleur par ligne (on recommence au début s'il y a plus de lignes)
const lineColors = ["#e63946", "#2a9d8f", "#f4a261", "#457b9d"];

// ===== 3. OUTIL : vérifier qu'un arrêt a des coordonnées GPS =====
type LocatedStop = Stop & { lat: number; lng: number };

const hasCoords = (stop: Stop | undefined): stop is LocatedStop =>
  stop !== undefined && stop.lat !== undefined && stop.lng !== undefined;

// ===== 4. COMPOSANT PRINCIPAL =====
export default function BusMap() {
   // --- 4a. ÉTAT : quelle ligne est sélectionnée (null = aucune) ---
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  // La ligne sélectionnée (undefined si aucune)
  const selectedLine = lines.find((line) => line.id === selectedLineId);

  // L'heure actuelle et le type de jour (jour ouvrable, samedi, dimanche/férié)
  const now = new Date();
  const dayType = getDayType(now);

  // Horaires de la ligne sélectionnée (undefined si pas encore disponibles)
  const timetable = selectedLine?.timetable;

  return (
    // --- 4b. MISE EN PAGE : panneau à gauche + carte à droite ---
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ===== PANNEAU DE GAUCHE ===== */}
      <aside
        style={{
          width: 280,
          overflowY: "auto",
          padding: 16,
          boxSizing: "border-box",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Lignes</h2>
     {/* Tarif : valable pour les lignes ordinaires seulement (info du site SOTRACO) */}
        <p>Ticket à la course : {FARE_FCFA} F sur les lignes ordinaires</p>

        {/* Un bouton par ligne : un clic sélectionne ou désélectionne */}
        {lines.map((line, index) => (
          <button
            key={line.id}
            onClick={() =>
              setSelectedLineId(line.id === selectedLineId ? null : line.id)
            }
            style={{
              display: "block",
              width: "100%",
              marginBottom: 8,
              padding: 10,
              textAlign: "left",
              cursor: "pointer",
              border: `3px solid ${lineColors[index % lineColors.length]}`,
              background: line.id === selectedLineId ? "#eee" : "white",
              borderRadius: 6,
            }}
          >
            Ligne {line.number} : {line.from} - {line.to}
          </button>
        ))}

        {/* Liste des arrêts, seulement si une ligne est sélectionnée */}
        {selectedLine && (
          <>
            {/* Prochains départs, dans les deux sens (si les horaires existent) */}
            {timetable ? (
              <>
               {/* Les heures sont celles des départs aux terminus, pas aux arrêts intermédiaires */}
                <h3>Prochains départs au terminus</h3>
                <p>Horaire : {DAY_LABELS[dayType]}</p>
                <p style={{ fontSize: 12, color: "#666" }}>
                  Heures de départ aux terminus, elles peuvent varier selon
                  la circulation.
                </p>

                {(["forward", "backward"] as const).map((direction) => {
                  const departures = getNextDepartures(
                    timetable[dayType][direction],
                    now,
                  );
                  return (
                    <div key={direction}>
                      <strong>
                        {direction === "forward"
                          ? `${selectedLine.from} → ${selectedLine.to}`
                          : `${selectedLine.to} → ${selectedLine.from}`}
                      </strong>
                      {departures.length === 0 ? (
                        <p>Plus de départ aujourd'hui</p>
                      ) : (
                        <ul>
                          {departures.map((d) => (
                            <li key={d.time}>
                              {d.time} (dans {d.inMinutes} min)
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <p>Horaires bientôt disponibles.</p>
            )}
            
            <h3>Arrêts</h3>
            <ol>
              {selectedLine.stopIds.map((id) => (
                <li key={id}>{stopsById.get(id)?.name ?? "Arrêt inconnu"}</li>
              ))}
            </ol>
          </>
        )}
          {/* Abréviations utilisées sur le site de la SOTRACO */}
          <p style={{ fontSize: 12, color: "#666", marginTop: 24 }}>
            UJKZ : Université Joseph Ki-Zerbo
          </p>
      </aside>

      {/* ===== CARTE À DROITE ===== */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[12.37, -1.52]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Fond de carte OpenStreetMap */}
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Tracé de chaque ligne (seulement avec les arrêts géolocalisés) */}
          {lines.map((line, index) => {
            const positions = line.stopIds
              .map((id) => stopsById.get(id))
              .filter(hasCoords)
              .map((stop) => [stop.lat, stop.lng] as [number, number]);

            const isSelected = line.id === selectedLineId;
            const isVisible = selectedLineId === null || isSelected;

            return (
              <Polyline
                key={line.id}
                positions={positions}
                pathOptions={{
                  color: lineColors[index % lineColors.length],
                  weight: isSelected ? 7 : 4,
                  opacity: isVisible ? 1 : 0.2,
                }}
              />
            );
          })}

          {/* Un rond par arrêt géolocalisé, avec son nom au clic */}
          {stops.filter(hasCoords).map((stop) => (
            <CircleMarker
              key={stop.id}
              center={[stop.lat, stop.lng]}
              radius={8}
            >
              <Popup>{stop.name}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}