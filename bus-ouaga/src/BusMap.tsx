import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Stop, Line } from "./types";
import stopsData from "./data/stops.json";
import linesData from "./data/lines.json";

const stops = stopsData as Stop[];
const lines = linesData as Line[];

// Dictionnaire : on retrouve un arrêt directement grâce à son id
const stopsById = new Map(stops.map((stop) => [stop.id, stop]));

const lineColors = ["#e63946", "#2a9d8f", "#f4a261", "#457b9d"];

export default function BusMap() {
  return (
    <MapContainer
      center={[12.37, -1.52]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {lines.map((line, index) => {
        const positions = line.stopIds
          .map((id) => stopsById.get(id))
          .filter((stop): stop is Stop => stop !== undefined)
          .map((stop) => [stop.lat, stop.lng] as [number, number]);

        return (
          <Polyline
            key={line.id}
            positions={positions}
            pathOptions={{
              color: lineColors[index % lineColors.length],
              weight: 4,
            }}
          >
            <Popup>
              Ligne {line.number} : {line.name}
            </Popup>
          </Polyline>
        );
      })}

      {stops.map((stop) => (
        <CircleMarker key={stop.id} center={[stop.lat, stop.lng]} radius={8}>
          <Popup>{stop.name}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}