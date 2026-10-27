// ===== 1. IMPORTS =====
import type { DayType } from "./types";

// ===== 2. JOURS FÉRIÉS =====
// Format "AAAA-MM-JJ". La SOTRACO applique l'horaire "dimanche" ces jours-là.
// Ces deux dates ne sont que des exemples : à compléter avec la liste officielle.
export const HOLIDAYS: string[] = ["2026-12-25", "2027-01-01"];

// ===== 3. LIBELLÉS pour l'affichage =====
export const DAY_LABELS: Record<DayType, string> = {
  weekday: "Lundi au vendredi",
  saturday: "Samedi",
  sundayHoliday: "Dimanche et jours fériés",
};

// ===== 4. DATE → TEXTE "AAAA-MM-JJ" (heure locale) =====
// On évite toISOString(), qui convertit en UTC et peut décaler le jour.
function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() commence à 0 !
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ===== 5. QUEL TYPE DE JOUR SOMMES-NOUS ? =====
export function getDayType(date: Date): DayType {
  const weekday = date.getDay(); // 0 = dimanche, 1 = lundi ... 6 = samedi

  if (weekday === 0 || HOLIDAYS.includes(toDateKey(date))) {
    return "sundayHoliday";
  }
  if (weekday === 6) {
    return "saturday";
  }
  return "weekday";
}

// ===== 6. "17:05" → 1025 (minutes depuis minuit) =====
// Avec des nombres, on peut comparer deux heures facilement.
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// ===== 7. LES PROCHAINS DÉPARTS =====
export interface NextDeparture {
  time: string; // "17:05"
  inMinutes: number; // dans combien de minutes
}

export function getNextDepartures(
  times: string[],
  now: Date,
  count = 3,
): NextDeparture[] {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return times
    .map((time) => ({ time, inMinutes: timeToMinutes(time) - nowMinutes }))
    .filter((departure) => departure.inMinutes >= 0) // on garde ceux pas encore partis
    .sort((a, b) => a.inMinutes - b.inMinutes)
    .slice(0, count); // on ne garde que les `count` premiers


}



