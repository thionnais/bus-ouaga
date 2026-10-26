import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Stop } from "./types";
import stopsData from "./data/stops.json";

const stops = stopsData as Stop[];

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
      {stops.map((stop) => (
        <CircleMarker key={stop.id} center={[stop.lat, stop.lng]} radius={8}>
          <Popup>{stop.name}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}