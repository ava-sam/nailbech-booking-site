import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function htmlResponse(message: string) {
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background:#0E1917; color:#F3EFE9; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
        <p style="font-size:1.2rem;">${message}</p>
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
    .select("id, deposit_status, client_name")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    return htmlResponse("Booking not found.");
  }

  if (booking.deposit_status === "confirmed") {
    return htmlResponse(`Already confirmed for ${booking.client_name}. Nothing more to do.`);
  }

  // Updating this triggers the Supabase Database Webhook, which calls
  // /api/calendar/create-event to add it to the calendar automatically.
  const { error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ deposit_status: "confirmed" })
    .eq("id", id);

  if (updateError) {
    return htmlResponse("Something went wrong confirming this booking.");
  }

  return htmlResponse(
    `Confirmed! ${booking.client_name}'s appointment has been added to your calendar, and they'll get a calendar invite too.`
  );
}