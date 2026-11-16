// ===== 1. IMPORTS =====
import { useRef, useState } from "react";
import type { ReactNode, PointerEvent } from "react";
import BusIcon from "./BusIcon";

// ===== 2. CONSTANTES =====
const BUBBLE_SIZE = 48; // diamètre de la bulle en pixels
const PANEL_WIDTH = 260; // largeur du panneau ouvert (avant : 320)
const EDGE_X = 4; // marge gauche et droite de la page (px)
const EDGE_Y = 6; // marge haut et bas de la page (px)
const GAP = 8; // écart entre le bord de la carte et le panneau au démarrage

interface FloatingPanelProps {
  title: string;
  children: ReactNode; // tout ce qu'on met entre <FloatingPanel> et </FloatingPanel>
}

// ===== 3. COMPOSANT =====
export default function FloatingPanel({ title, children }: FloatingPanelProps) {
  // --- 3a. ÉTATS ---
  // Sur petit écran, on démarre réduit en bulle pour ne pas cacher la carte
  const [open, setOpen] = useState(() => window.innerWidth > 768);
  const [pos, setPos] = useState({ x: EDGE_X + GAP, y: EDGE_Y + GAP });

  // Le déplacement en cours (useRef : pas de réaffichage à chaque pixel)
  const drag = useRef<{
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  // --- 3b. DIMENSIONS ET LIMITES DE L'ÉCRAN ---
  const panelWidth = Math.min(
    PANEL_WIDTH,
    window.innerWidth - 2 * (EDGE_X + GAP),
  );
  const width = open ? panelWidth : BUBBLE_SIZE;
  const minVisibleHeight = open ? 120 : BUBBLE_SIZE;

  // Le panneau (ou la bulle) reste à l'intérieur des marges de la page
  const x = Math.max(
    EDGE_X,
    Math.min(pos.x, window.innerWidth - width - EDGE_X),
  );
  const y = Math.max(
    EDGE_Y,
    Math.min(pos.y, window.innerHeight - minVisibleHeight - EDGE_Y),
  );

  // --- 3c. GESTION DU DÉPLACEMENT (souris et doigt) ---
  function onPointerDown(e: PointerEvent<HTMLElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      offsetX: e.clientX - x,
      offsetY: e.clientY - y,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d) return;

    // Un mouvement de moins de 5 px est un simple clic, pas un déplacement
    if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 5) {
      d.moved = true;
    }
    if (d.moved) {
      setPos({ x: e.clientX - d.offsetX, y: e.clientY - d.offsetY });
    }
  }

  function onPointerUp() {
    drag.current = null;
  }

  // Relâcher la bulle sans l'avoir déplacée = un clic : on ouvre le panneau
  function onBubbleUp() {
    if (drag.current && !drag.current.moved) setOpen(true);
    drag.current = null;
  }

  // ===== 4. AFFICHAGE : LA BULLE (panneau réduit) =====
  if (!open) {
    return (
      <div
        role="button"
        aria-label="Ouvrir le panneau des lignes"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onBubbleUp}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          borderRadius: "50%",
          background: "white",
          border: "3px solid #00a651",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
          zIndex: 1100, // au-dessus des éléments de la carte
          touchAction: "none", // sur téléphone, le doigt déplace la bulle, pas la page
          userSelect: "none",
        }}
      >
        <BusIcon size={32} />
      </div>
    );
  }

  // ===== 5. AFFICHAGE : LE PANNEAU OUVERT =====
  return (
    <section
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: panelWidth,
        maxHeight: window.innerHeight - y - EDGE_Y, // jamais plus haut que l'écran
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderRadius: 10,
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        zIndex: 1100,
        fontFamily: "sans-serif",
      }}
    >
      {/* --- 5a. BARRE DU HAUT : c'est elle qu'on attrape pour déplacer --- */}
      <header
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 4px 0 10px",
          background: "#f1f8f4",
          color: "#00793d",
          borderBottom: "2px solid #00a651",
          borderRadius: "10px 10px 0 0",
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
          fontSize: 14,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <BusIcon size={22} />
          <strong>{title}</strong>
        </span>
        <button
          aria-label="Réduire le panneau"
          // Le bouton ne doit pas déclencher le déplacement de la barre
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setOpen(false)}
          style={{
            width: 36,
            background: "transparent",
            border: "none",
            color: "#00793d",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          —
        </button>
      </header>

      {/* --- 5b. CONTENU : défile s'il est trop long --- */}
      <div className="panel-content" style={{ overflowY: "auto", padding: 10 }}>
        {children}
      </div>
    </section>
  );
}