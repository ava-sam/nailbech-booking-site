export const DAILY_START = "10:00:00";
export const DAILY_END = "20:00:00";
export const APPOINTMENT_DURATION_MINUTES = 180; // 3 hours
export const SLOT_INTERVAL_MINUTES = 60;

// Her real availability: "YYYY-MM-DD" (Pacific) -> appointment start times.
// Any date not listed here is unavailable. Add new months here as she sends them.
export const AVAILABILITY: Record<string, string[]> = {
  // October 2026
  "2026-10-23": ["10:00", "13:00"], // Fri
  "2026-10-24": ["10:00", "13:00"], // Sat
  "2026-10-25": ["10:00", "13:00"], // Sun
  // November 2026
  "2026-11-06": ["10:00"], // Fri (10 am only)
  "2026-11-13": ["10:00", "13:00"], // Fri
  "2026-11-14": ["10:00", "13:00"], // Sat
  "2026-11-15": ["10:00", "13:00"], // Sun
  "2026-11-20": ["10:00", "13:00"], // Fri
  "2026-11-21": ["10:00", "13:00"], // Sat
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${pad(h)}:${pad(m)}:00`;
}

// True if the date has at least one listed start time.
export function isBookableDate(dateStr: string): boolean {
  return (AVAILABILITY[dateStr]?.length ?? 0) > 0;
}

// Generates every candidate {date, time} slot for a given calendar month
// (month is 1-indexed: January = 1), based on AVAILABILITY. Skips any date
// before todayDateStr (expects "YYYY-MM-DD", e.g. from
// pacificTodayDateString()) so past days in the current month aren't offered.
// Months with no entries in AVAILABILITY return an empty array.
export function generateCandidateSlotsForMonth(
  year: number,
  month: number,
  todayDateStr: string
): { date: string; time: string }[] {
  const prefix = `${year}-${pad(month)}-`;
  const dailyStartMin = timeToMinutes(DAILY_START);
  const lastPossibleStart =
    timeToMinutes(DAILY_END) - APPOINTMENT_DURATION_MINUTES;

  const candidates: { date: string; time: string }[] = [];

  for (const dateStr of Object.keys(AVAILABILITY).sort()) {
    if (!dateStr.startsWith(prefix)) continue;
    if (dateStr < todayDateStr) continue;

    for (const start of [...AVAILABILITY[dateStr]].sort()) {
      const startMin = timeToMinutes(start);
      // Safety: ignore times outside her working window or that would run past close.
      if (startMin < dailyStartMin || startMin > lastPossibleStart) continue;
      candidates.push({ date: dateStr, time: minutesToTime(startMin) });
    }
  }

  return candidates;
}