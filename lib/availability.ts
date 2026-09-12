export const DAILY_START = "10:00:00";
export const DAILY_END = "20:00:00";
export const APPOINTMENT_DURATION_MINUTES = 180; // 3 hours
export const SLOT_INTERVAL_MINUTES = 60;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:00`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Generates every candidate {date, time} slot for a given calendar month
// (month is 1-indexed: January = 1). Skips any date before todayDateStr
// (expects "YYYY-MM-DD", e.g. from pacificTodayDateString()) so past days
// in the current month aren't offered.
export function generateCandidateSlotsForMonth(
  year: number,
  month: number,
  todayDateStr: string
): { date: string; time: string }[] {
  const dailyStartMin = timeToMinutes(DAILY_START);
  const dailyEndMin = timeToMinutes(DAILY_END);
  const lastPossibleStart = dailyEndMin - APPOINTMENT_DURATION_MINUTES;
  const numDays = new Date(year, month, 0).getDate(); // last day of this month

  const candidates: { date: string; time: string }[] = [];

  for (let day = 1; day <= numDays; day++) {
    const dateStr = `${year}-${pad(month)}-${pad(day)}`;
    if (dateStr < todayDateStr) continue;

    for (
      let startMin = dailyStartMin;
      startMin <= lastPossibleStart;
      startMin += SLOT_INTERVAL_MINUTES
    ) {
      candidates.push({ date: dateStr, time: minutesToTime(startMin) });
    }
  }

  return candidates;
}