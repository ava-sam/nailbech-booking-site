import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCalendarClient } from "@/lib/googleCalendar";

// Adjust to match her real average appointment length.
const APPOINTMENT_DURATION_MINUTES = 180;

export async function GET() {
  const { data: slots, error } = await supabaseAdmin
    .from("slots")
    .select("id, date, time")
    .eq("is_available", true)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!slots || slots.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  const startTimes = slots.map((s) => new Date(`${s.date}T${s.time}`));
  const timeMin = new Date(Math.min(...startTimes.map((d) => d.getTime())));
  const timeMax = new Date(
    Math.max(...startTimes.map((d) => d.getTime())) + 60 * 60 * 1000
  );

  const calendar = getCalendarClient();
  const freebusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: "primary" }],
    },
  });

  const busyRanges = freebusy.data.calendars?.primary?.busy ?? [];

  const available = slots.filter((slot) => {
    const start = new Date(`${slot.date}T${slot.time}`);
    const end = new Date(
      start.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000
    );

    return !busyRanges.some((busy) => {
      const busyStart = new Date(busy.start!);
      const busyEnd = new Date(busy.end!);
      return start < busyEnd && end > busyStart; // ranges overlap
    });
  });

  return NextResponse.json({ slots: available });
}