import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resend } from "@/lib/resend";
import { buildBookingNotificationEmail } from "@/lib/emailTemplates";

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
      html: buildBookingNotificationEmail(
        {
          clientName: booking.client_name,
          clientPhone: booking.client_phone,
          clientEmail: booking.client_email,
          clientInstagram: booking.client_instagram,
          appointmentDate: booking.appointment_date,
          appointmentTime: booking.appointment_time,
          length: booking.length,
          designTier: booking.design_tier,
          removalType: booking.removal_type,
          price: booking.price,
          depositAmount: booking.deposit_amount,
        },
        confirmUrl
      ),
    });
  } catch (err) {
    console.error("notify-booking email error:", err);
    return NextResponse.json({ warning: "Booking saved, but notification email failed to send." });
  }

  return NextResponse.json({ success: true });
}