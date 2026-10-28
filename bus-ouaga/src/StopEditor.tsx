// ===== 1. IMPORTS =====
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Stop } from "./types";
import stopsData from "./data/stops.json";

// ===== 2. DONNÉES =====
const stops = stopsData as Stop[];
const STORAGE_KEY = "stop-coords";

// Dictionnaire : id de l'arrêt -> sa position
type Coords = Record<string, { lat: number; lng: number }>;

// ===== 3. CHARGER ET SAUVEGARDER LES POSITIONS =====
// Au démarrage : on reprend les positions de stops.json,
// puis celles sauvegardées dans le navigateur (elles gagnent).
function loadCoords(): Coords {
  const fromFile: Coords = {};
  for (const stop of stops) {
    if (stop.lat !== undefined && stop.lng !== undefined) {
      fromFile[stop.id] = { lat: stop.lat, lng: stop.lng };
    }
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...fromFile, ...JSON.parse(saved) } : fromFile;
  } catch {
    return fromFile;
  }
}

// Sauvegarde dans le navigateur pour ne rien perdre si on ferme la page
function saveCoords(coords: Coords) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
  } catch {
    // si le stockage est indisponible, on continue sans sauvegarde
  }
}

// ===== 4. ÉCOUTER LES CLICS SUR LA CARTE =====
// Ce composant n'affiche rien : il prévient simplement quand on clique.
function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

// ===== 5. COMPOSANT PRINCIPAL =====
export default function StopEditor() {
  // --- 5a. ÉTATS ---
  const [coords, setCoords] = useState<Coords>(loadCoords);
  const [selectedId, setSelectedId] = useState<string | null>(
    stops[0]?.id ?? null,
  );
  const [copied, setCopied] = useState(false);

  // Nombre d'arrêts déjà placés
  const placedCount = stops.filter((stop) => coords[stop.id]).length;

  // --- 5b. UN CLIC SUR LA CARTE : on enregistre la position de l'arrêt choisi ---
  function handlePick(lat: number, lng: number) {
    if (selectedId === null) return;

    // 5 décimales = précision d'environ 1 mètre, c'est largement suffisant
    const position = {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    };
    const next = { ...coords, [selectedId]: position };
    setCoords(next);
    saveCoords(next);

    // On passe automatiquement au prochain arrêt pas encore placé
    const index = stops.findIndex((stop) => stop.id === selectedId);
    const nextStop = stops.slice(index + 1).find((stop) => !next[stop.id]);
    if (nextStop) setSelectedId(nextStop.id);
  }

  // --- 5c. COPIER LE NOUVEAU stops.json DANS LE PRESSE-PAPIERS ---
  async function copyJson() {
    const updated = stops.map((stop) =>
      coords[stop.id] ? { ...stop, ...coords[stop.id] } : stop,
    );
    await navigator.clipboard.writeText(JSON.stringify(updated, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    // --- 5d. MISE EN PAGE : liste à gauche, carte à droite ---
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ===== PANNEAU DE GAUCHE ===== */}
      <aside
        style={{
          width: 300,
          overflowY: "auto",
          padding: 16,
          boxSizing: "border-box",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Placer les arrêts</h2>
        <p>
          {placedCount} / {stops.length} arrêts placés
        </p>
        <p style={{ fontSize: 13, color: "#666" }}>
          1. Choisis un arrêt dans la liste. 2. Clique sur la carte à son
          emplacement.
        </p>

        <button onClick={copyJson} style={{ marginBottom: 12, padding: 8 }}>
          {copied ? "Copié !" : "Copier le stops.json"}
        </button>

        {/* Un bouton par arrêt : ✓ = déjà placé, ○ = pas encore */}
        {stops.map((stop) => (
          <button
            key={stop.id}
            onClick={() => setSelectedId(stop.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: 6,
              marginBottom: 4,
              cursor: "pointer",
              background: stop.id === selectedId ? "#ffe9a8" : "white",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          >
            {coords[stop.id] ? "✓" : "○"} {stop.name}
          </button>
        ))}
      </aside>

      {/* ===== CARTE À DROITE ===== */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[12.37, -1.52]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onPick={handlePick} />

          {/* Un rond par arrêt déjà placé (rouge = celui qui est sélectionné) */}
          {stops
            .filter((stop) => coords[stop.id])
            .map((stop) => (
              <CircleMarker
                key={stop.id}
                center={[coords[stop.id].lat, coords[stop.id].lng]}
                radius={8}
                pathOptions={{
                  color: stop.id === selectedId ? "#e63946" : "#457b9d",
                }}
              >
                <Tooltip>{stop.name}</Tooltip>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}