// app/api/bookings/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCalendarClient } from "@/lib/googleCalendar";

function htmlResponse(message: string, note?: string) {
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background:#0E1917; color:#F3EFE9; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; padding: 0 24px; text-align:center;">
        <div>
          <p style="font-size:1.2rem; margin:0 0 8px 0;">${message}</p>
          ${note ? `<p style="font-size:0.9rem; color:#94A39C; margin:0;">${note}</p>` : ""}
        </div>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return htmlResponse("Missing booking id.");
  }

  const { data: booking, error: fetchError } = await supabaseAdmin
    .from("bookings")
    .select("id, client_name, calendar_event_id")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    return htmlResponse("Booking not found.");
  }

  // Remove the calendar event first so the slot stops showing as busy in
  // /api/available-slots. If the event is already gone, carry on.
  if (booking.calendar_event_id) {
    try {
      const calendar = getCalendarClient();
      await calendar.events.delete({
        calendarId: "primary",
        eventId: booking.calendar_event_id,
        sendUpdates: "all", // tells the client their appointment was cancelled
      });
    } catch (err) {
      const code = (err as { code?: number }).code;
      if (code !== 404 && code !== 410) {
        return htmlResponse("Something went wrong removing the calendar event.");
      }
    }
  }

  const { error: deleteError } = await supabaseAdmin
    .from("bookings")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return htmlResponse("Something went wrong cancelling this booking.");
  }

  return htmlResponse(
    `Cancelled. ${booking.client_name}'s appointment has been removed and the time slot is open again.`
  );
}
