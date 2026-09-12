import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCalendarClient } from "@/lib/googleCalendar";
import { pacificToUtcDate, pacificTodayDateString } from "@/lib/timezone";
import {
  generateCandidateSlotsForMonth,
  APPOINTMENT_DURATION_MINUTES,
} from "@/lib/availability";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const todayStr = pacificTodayDateString();
    const [todayYear, todayMonth] = todayStr.split("-").map(Number);

    const year = Number(searchParams.get("year")) || todayYear;
    const month = Number(searchParams.get("month")) || todayMonth; // 1-indexed

    const now = new Date();
    const candidates = generateCandidateSlotsForMonth(year, month, todayStr).filter(
      (c) => pacificToUtcDate(c.date, c.time).getTime() > now.getTime()
    );

    if (candidates.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    const ranges = candidates.map((c) => ({
      start: pacificToUtcDate(c.date, c.time),
      end: new Date(
        pacificToUtcDate(c.date, c.time).getTime() +
          APPOINTMENT_DURATION_MINUTES * 60 * 1000
      ),
    }));

    const timeMin = new Date(Math.min(...ranges.map((r) => r.start.getTime())));
    const timeMax = new Date(Math.max(...ranges.map((r) => r.end.getTime())));

    const calendar = getCalendarClient();
    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: "primary" }],
      },
    });
    const busyRanges = freebusy.data.calendars?.primary?.busy ?? [];

    const { data: existingBookings, error } = await supabaseAdmin
      .from("bookings")
      .select("appointment_date, appointment_time")
      .gte("appointment_date", timeMin.toISOString().slice(0, 10))
      .lte("appointment_date", timeMax.toISOString().slice(0, 10));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bookedRanges = (existingBookings ?? []).map((b) => {
      const start = pacificToUtcDate(b.appointment_date, b.appointment_time);
      const end = new Date(
        start.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000
      );
      return { start, end };
    });

    const allBusy = [
      ...busyRanges.map((b) => ({
        start: new Date(b.start!),
        end: new Date(b.end!),
      })),
      ...bookedRanges,
    ];

    const available = candidates.filter((candidate, i) => {
      const { start, end } = ranges[i];
      return !allBusy.some((busy) => start < busy.end && end > busy.start);
    });

    return NextResponse.json({ slots: available });
  } catch (err) {
    console.error("available-slots error:", err);
    return NextResponse.json(
      { error: "Failed to load available slots." },
      { status: 500 }
    );
  }
}