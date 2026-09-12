// UCSD is in San Diego — Pacific time. Change this if that's ever wrong.
export const SALON_TZ = "America/Los_Angeles";
 
// Converts a slot's local wall-clock date/time (e.g. "2026-09-15", "10:30:00")
// into the actual UTC Date it represents, correctly accounting for PST/PDT.
// Needed anywhere we compare against Google's freebusy data, which is
// returned as real UTC timestamps.
export function pacificToUtcDate(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute, second] = timeStr.split(":").map(Number);
  const naiveUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, second ?? 0));
 
  // Find the real UTC offset for this specific date (handles DST correctly).
  const tzString = naiveUtc.toLocaleString("en-US", { timeZone: SALON_TZ });
  const tzDate = new Date(tzString);
  const offsetMs = naiveUtc.getTime() - tzDate.getTime();
 
  return new Date(naiveUtc.getTime() + offsetMs);
}

// Pure calendar-math addition — adds minutes to a wall-clock date/time
// without any timezone conversion. Used when building the event's end
// time, since we pass the timeZone field separately to Google and let
// Google do the DST-aware interpretation.
export function addMinutesToWallClock(
  dateStr: string,
  timeStr: string,
  minutesToAdd: number
): { date: string; time: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm, ss] = timeStr.split(":").map(Number);
  const neutral = new Date(Date.UTC(y, m - 1, d, hh, mm, ss ?? 0));
  neutral.setUTCMinutes(neutral.getUTCMinutes() + minutesToAdd);
 
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${neutral.getUTCFullYear()}-${pad(neutral.getUTCMonth() + 1)}-${pad(
      neutral.getUTCDate()
    )}`,
    time: `${pad(neutral.getUTCHours())}:${pad(neutral.getUTCMinutes())}:${pad(
      neutral.getUTCSeconds()
    )}`,
  };
}
 
