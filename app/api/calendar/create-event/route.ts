import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCalendarClient } from "@/lib/googleCalendar";
import { addMinutesToWallClock, SALON_TZ } from "@/lib/timezone";
import { APPOINTMENT_DURATION_MINUTES } from "@/lib/availability";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Supports two shapes: a direct { booking_id } call (for manual testing),
  // and a Supabase Database Webhook payload ({ record, old_record }) once
  // that's wired up after deployment.
  const bookingId = body.booking_id ?? body.record?.id;
  const newStatus = body.record?.deposit_status;
  const oldStatus = body.old_record?.deposit_status;

  // If this came from a webhook, only act on the transition into "confirmed"
  // so we don't create duplicate events on every unrelated row update.
  if (body.record && !(newStatus === "confirmed" && oldStatus !== "confirmed")) {
    return NextResponse.json({ skipped: true });
  }

  if (!bookingId) {
    return NextResponse.json({ error: "Missing booking_id" }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.calendar_event_id) {
    return NextResponse.json({ skipped: true, reason: "already synced" });
  }

  const { date: endDate, time: endTime } = addMinutesToWallClock(
    booking.appointment_date,
    booking.appointment_time,
    APPOINTMENT_DURATION_MINUTES
  );

  const calendar = getCalendarClient();
  const event = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all", // actually sends the invite email to the client
    requestBody: {
      summary: `Gel-X — ${booking.client_name}`,
      description:
        `Length: ${booking.length}\n` +
        `Design: ${booking.design_tier}\n` +
        `Removal: ${booking.removal_type}\n` +
        `Phone: ${booking.client_phone}\n` +
        `Email: ${booking.client_email}`,
      start: { dateTime: `${booking.appointment_date}T${booking.appointment_time}`, timeZone: SALON_TZ },
      end: { dateTime: `${endDate}T${endTime}`, timeZone: SALON_TZ },
      attendees: [{ email: booking.client_email }],
    },
  });

  await supabaseAdmin
    .from("bookings")
    .update({ calendar_event_id: event.data.id })
    .eq("id", bookingId);

  return NextResponse.json({ success: true, event_id: event.data.id });
}