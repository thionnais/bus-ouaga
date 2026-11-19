// ===== 1. IMPORTS =====
import { useEffect, useRef, useState } from "react";
import type { ReactNode, PointerEvent } from "react";
import BusIcon from "./BusIcon";

// ===== 2. CONSTANTES =====
const BUBBLE_SIZE = 48; // diamètre de la bulle (px)
const PANEL_WIDTH = 260; // largeur du panneau ouvert (px)
const EDGE = 8; // marge minimale entre le panneau et le bord de la carte (px)

interface FloatingPanelProps {
  title: string;
  children: ReactNode; // tout ce qu'on met entre <FloatingPanel> et </FloatingPanel>
}

// ===== 3. COMPOSANT =====
export default function FloatingPanel({ title, children }: FloatingPanelProps) {
  // --- 3a. ÉTATS ET RÉFÉRENCES ---
  // Sur petit écran, on démarre réduit en bulle pour ne pas cacher la carte
  const [open, setOpen] = useState(() => window.innerWidth > 768);
  const [pos, setPos] = useState({ x: EDGE, y: EDGE });
  // Taille de la zone de la carte (mesurée juste après, en 3b)
  const [box, setBox] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  // Un calque invisible qui couvre toute la zone de la carte : sert à la mesurer
  const wrapRef = useRef<HTMLDivElement>(null);

  // Le déplacement en cours (useRef : pas de réaffichage à chaque pixel)
  const drag = useRef<{
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  // --- 3b. MESURER LA ZONE, ET REMESURER QUAND ELLE CHANGE DE TAILLE ---
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect(); // nettoyage quand le composant disparaît
  }, []);

  // --- 3c. DIMENSIONS ET LIMITES : le panneau reste dans la carte ---
  const panelWidth = Math.min(PANEL_WIDTH, box.w - 2 * EDGE);
  const width = open ? panelWidth : BUBBLE_SIZE;
  const minVisibleHeight = open ? 120 : BUBBLE_SIZE;

  const x = Math.max(EDGE, Math.min(pos.x, box.w - width - EDGE));
  const y = Math.max(EDGE, Math.min(pos.y, box.h - minVisibleHeight - EDGE));

  // --- 3d. GESTION DU DÉPLACEMENT (souris et doigt) ---
  function onPointerDown(e: PointerEvent<HTMLElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      // Écart entre le pointeur et le coin du panneau, dans la zone de la carte
      offsetX: e.clientX - rect.left - x,
      offsetY: e.clientY - rect.top - y,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!d || !rect) return;

    // Un mouvement de moins de 5 px est un simple clic, pas un déplacement
    if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 5) {
      d.moved = true;
    }
    if (d.moved) {
      setPos({
        x: e.clientX - rect.left - d.offsetX,
        y: e.clientY - rect.top - d.offsetY,
      });
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

  // ===== 4. LA BULLE (panneau réduit) =====
  const bubble = (
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
        pointerEvents: "auto", // le calque est transparent aux clics, pas la bulle
        touchAction: "none", // sur téléphone, le doigt déplace la bulle, pas la page
        userSelect: "none",
      }}
    >
      <BusIcon size={32} />
    </div>
  );

  // ===== 5. LE PANNEAU OUVERT =====
  const panel = (
    <section
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: panelWidth,
        maxHeight: box.h - y - EDGE, // jamais plus haut que la carte
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderRadius: 10,
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        pointerEvents: "auto",
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

  // ===== 6. LE CALQUE : couvre la carte, laisse passer les clics =====
  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none", // la carte reste utilisable sous le calque
        zIndex: 1100, // au-dessus des éléments de la carte
      }}
    >
      {open ? panel : bubble}
    </div>
  );
}