// Her working window and appointment length — change these if either ever changes.
export const DAILY_START = "10:00:00";
export const DAILY_END = "20:00:00";
export const APPOINTMENT_DURATION_MINUTES = 180; // 3 hours
export const SLOT_INTERVAL_MINUTES = 60; // how far apart candidate start times are
export const DAYS_AHEAD = 14; // how many days out clients can book

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

function toDateString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Generates every candidate {date, time} slot for the next DAYS_AHEAD days
// where a full appointment fits inside the daily window. This is just the
// raw grid — calendar conflicts and existing bookings are filtered out
// separately.
export function generateCandidateSlots(): { date: string; time: string }[] {
  const dailyStartMin = timeToMinutes(DAILY_START);
  const dailyEndMin = timeToMinutes(DAILY_END);
  const lastPossibleStart = dailyEndMin - APPOINTMENT_DURATION_MINUTES;

  const candidates: { date: string; time: string }[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
    const day = new Date(today);
    day.setDate(day.getDate() + dayOffset);
    const dateStr = toDateString(day);

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