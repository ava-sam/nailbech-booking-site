import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCalendarClient } from "@/lib/googleCalendar";

const APPOINTMENT_DURATION_MINUTES = 180;

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
    .select("*, slots(date, time)")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.calendar_event_id) {
    return NextResponse.json({ skipped: true, reason: "already synced" });
  }

  const slot = booking.slots as { date: string; time: string };
  const start = new Date(`${slot.date}T${slot.time}`);
  const end = new Date(start.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000);

  const calendar = getCalendarClient();
  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `Gel-X — ${booking.client_name}`,
      description:
        `Length: ${booking.length}\n` +
        `Design: ${booking.design_tier}\n` +
        `Removal: ${booking.removal_type}\n` +
        `Phone: ${booking.client_phone}\n` +
        `Email: ${booking.client_email}`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    },
  });

  await supabaseAdmin
    .from("bookings")
    .update({ calendar_event_id: event.data.id })
    .eq("id", bookingId);

  return NextResponse.json({ success: true, event_id: event.data.id });
}