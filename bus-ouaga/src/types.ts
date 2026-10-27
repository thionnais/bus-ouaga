// ===== TYPES DES ARRÊTS ET DES LIGNES =====

// Les trois types de jours utilisés par la SOTRACO
export type DayType = "weekday" | "saturday" | "sundayHoliday";

// Horaires d'un type de jour : un tableau pour chaque sens
// "forward" = de `from` vers `to` (ex. Karpala → Naba Koom)
// "backward" = de `to` vers `from` (ex. Naba Koom → Karpala)
export interface DayTimetable {
  forward: string[]; // heures au format "HH:MM", ex. "05:30"
  backward: string[];
}

export interface Stop {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  neighborhood?: string;
}

export interface Line {
  id: string;
  number: string;
  category: "urbaine" | "intercommunale" | "speciale";
  from: string;
  to: string;
  via?: string;
  stopIds: string[];
  timetable: Record<DayType, DayTimetable>;
}