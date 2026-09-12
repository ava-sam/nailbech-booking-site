import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resend } from "@/lib/resend";

export async function POST(request: NextRequest) {
  const { booking_id } = await request.json();

  if (!booking_id) {
    return NextResponse.json({ error: "Missing booking_id" }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", booking_id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/bookings/confirm?id=${booking.id}`;

  try {
    await resend.emails.send({
      from: "Nailbech Booking <onboarding@resend.dev>", // swap once a real domain is verified in Resend
      to: process.env.BECKY_EMAIL!,
      subject: `New booking — ${booking.client_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>New booking request</h2>
          <p><strong>${booking.client_name}</strong> booked an appointment.</p>
          <ul>
            <li>Date: ${booking.appointment_date}</li>
            <li>Time: ${booking.appointment_time}</li>
            <li>Length: ${booking.length}</li>
            <li>Design: ${booking.design_tier}</li>
            <li>Removal: ${booking.removal_type}</li>
            <li>Total: $${booking.price}</li>
            <li>Deposit due: $${booking.deposit_amount}</li>
            <li>Phone: ${booking.client_phone}</li>
            <li>Email: ${booking.client_email}</li>
          </ul>
          <p>Once you've received the deposit via Zelle/Apple Cash, tap below to confirm — this adds it to your calendar and sends the client a calendar invite too.</p>
          <a href="${confirmUrl}"
             style="display:inline-block; background:#E3B8BE; color:#0E1917; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:600;">
            Confirm Deposit Received
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("notify-booking email error:", err);
    // Don't fail the booking itself just because the notification email
    // failed — the booking already exists in the database either way.
    return NextResponse.json({ warning: "Booking saved, but notification email failed to send." });
  }

  return NextResponse.json({ success: true });
}