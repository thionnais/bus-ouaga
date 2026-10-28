/*import BusMap from "./BusMap";

export default function App() {
  return <BusMap />;
}*/



// ===== APP : choisit entre l'appli normale et l'éditeur d'arrêts =====
import BusMap from "./BusMap";
import StopEditor from "./StopEditor";

export default function App() {
  // L'éditeur s'ouvre avec l'adresse http://localhost:5173/#editeur
  const isEditor = window.location.hash === "#editeur";
  return isEditor ? <StopEditor /> : <BusMap />;
}