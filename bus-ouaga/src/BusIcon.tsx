// ===== ICÔNE : un bus vu de côté, dans le vert qu'on voit sur le site SOTRACO =====
interface BusIconProps {
  size?: number; // taille en pixels
}

export default function BusIcon({ size = 32 }: BusIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Bus">
      {/* Carrosserie */}
      <rect x="4" y="14" width="56" height="32" rx="7" fill="#00a651" />
      {/* Fenêtres */}
      <rect x="9" y="19" width="10" height="11" rx="2" fill="#e6f6ee" />
      <rect x="22" y="19" width="10" height="11" rx="2" fill="#e6f6ee" />
      <rect x="35" y="19" width="10" height="11" rx="2" fill="#e6f6ee" />
      {/* Pare-brise */}
      <rect x="48" y="19" width="8" height="16" rx="2" fill="#e6f6ee" />
      {/* Bande blanche */}
      <rect x="4" y="36" width="56" height="4" fill="#ffffff" />
      {/* Roues */}
      <circle cx="18" cy="47" r="6.5" fill="#2b2b2b" />
      <circle cx="18" cy="47" r="2.5" fill="#cfcfcf" />
      <circle cx="46" cy="47" r="6.5" fill="#2b2b2b" />
      <circle cx="46" cy="47" r="2.5" fill="#cfcfcf" />
    </svg>
  );
}