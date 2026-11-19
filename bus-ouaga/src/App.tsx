// ===== 1. IMPORTS =====
import { useEffect, useState } from "react";
import BusMap from "./BusMap";
import StopEditor from "./StopEditor";
import LinesPage from "./LinesPage";
import AboutPage from "./AboutPage";
import BusIcon from "./BusIcon";

// ===== 2. NOM DE L'APPLI ET PAGES DU MENU =====
// Nom provisoire : change-le ici, il s'affiche partout (en-tête, pied de page)
const APP_NAME = "Trajet Ouaga";

// L'id sert dans l'adresse (#carte), le label s'affiche dans le menu
const PAGES = [
  { id: "carte", label: "Carte" },
  { id: "lignes", label: "Lignes" },
  { id: "apropos", label: "À propos" },
] as const;

type PageId = (typeof PAGES)[number]["id"];

// ===== 3. QUELLE PAGE AFFICHER ? On lit la fin de l'adresse (#lignes...) =====
function readPage(): PageId | "editeur" {
  const hash = window.location.hash.replace("#", "");
  if (hash === "editeur") return "editeur"; // l'outil de placement des arrêts
  const found = PAGES.find((page) => page.id === hash);
  return found ? found.id : "carte"; // par défaut : la carte
}

// ===== 4. COMPOSANT PRINCIPAL =====
export default function App() {
  const [page, setPage] = useState(readPage);

  // Quand l'adresse change (clic sur le menu), on met la page à jour
  useEffect(() => {
    const onHashChange = () => setPage(readPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // L'éditeur garde sa propre mise en page, sans le cadre
  if (page === "editeur") return <StopEditor />;

  return (
    <div className="shell">
      {/* --- 4a. EN-TÊTE : logo, nom et menu --- */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">
            <BusIcon size={24} />
          </span>
          <span className="brand-name">{APP_NAME}</span>
        </div>

        <nav className="menu" aria-label="Menu principal">
          {PAGES.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className={page === p.id ? "active" : ""}
              aria-current={page === p.id ? "page" : undefined}
            >
              {p.label}
            </a>
          ))}
        </nav>
      </header>

      {/* --- 4b. ZONE CENTRALE : la page choisie --- */}
      <main className="content">
        {page === "carte" && <BusMap />}
        {page === "lignes" && <LinesPage />}
        {page === "apropos" && <AboutPage />}
      </main>

      {/* --- 4c. PIED DE PAGE --- */}
      <footer className="footer">
        © {new Date().getFullYear()} {APP_NAME} · Projet indépendant, non officiel
        <span className="footer-extra">
          {" "}
          · Lignes et horaires d'après sotraco.bf · Carte © OpenStreetMap contributors
        </span>
      </footer>
    </div>
  );
}