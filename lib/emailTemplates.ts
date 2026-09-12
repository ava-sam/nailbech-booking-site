interface BookingEmailData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "HH:MM:SS"
  length: string;
  designTier: string;
  removalType: string;
  price: number;
  depositAmount: number;
}

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTimeLabel(timeStr: string): string {
  const [hour, minute] = timeStr.split(":").map(Number);
  const d = new Date(2000, 0, 1, hour, minute);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const LABEL_MAP: Record<string, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
  simple: "Tier 1",
  standard: "Tier 2",
  intricate: "Tier 3",
  none: "No removal needed",
  own: "Removal — her previous set",
  foreign: "Removal — another salon's work",
};

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 6px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #94A39C;">
        ${label}
      </td>
      <td style="padding: 6px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #F3EFE9; text-align: right;">
        ${value}
      </td>
    </tr>
  `;
}

export function buildBookingNotificationEmail(
  booking: BookingEmailData,
  confirmUrl: string
): string {
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0; padding:0; background-color:#0E1917;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0E1917; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#16221F; border-radius:16px; overflow:hidden;">
              <tr>
                <td style="padding: 20px 32px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 17px; letter-spacing: 0.5px; color: #F3EFE9;">
                    nailbech
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px 32px 28px 32px;">
                  <p style="margin:0 0 4px 0; font-family: Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8FAFA3;">
                    New Booking
                  </p>
                  <h1 style="margin:0 0 24px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; color: #F3EFE9; font-weight: 500;">
                    ${booking.clientName}
                  </h1>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px;">
                    ${detailRow("Date", formatDateLabel(booking.appointmentDate))}
                    ${detailRow("Time", formatTimeLabel(booking.appointmentTime))}
                    ${detailRow("Length", LABEL_MAP[booking.length] ?? booking.length)}
                    ${detailRow("Design", LABEL_MAP[booking.designTier] ?? booking.designTier)}
                    ${detailRow("Removal", LABEL_MAP[booking.removalType] ?? booking.removalType)}
                    ${detailRow("Starting at", `$${booking.price.toFixed(2)}+`)}
                    ${detailRow("Deposit due", `$${booking.depositAmount.toFixed(2)}`)}
                    ${detailRow("Phone", booking.clientPhone)}
                    ${detailRow("Email", booking.clientEmail)}
                  </table>

                  <p style="margin: 0 0 20px 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #94A39C;">
                    Once you've received the deposit via Zelle or Apple Cash, tap below to confirm — this adds the appointment to your calendar and sends the client a calendar invite automatically.
                  </p>

                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-radius: 999px; background-color: #E3B8BE;">
                        <a href="${confirmUrl}"
                           style="display:inline-block; padding: 14px 28px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0E1917; text-decoration: none;">
                          Confirm Deposit Received
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 32px 24px 32px; border-top: 1px solid rgba(255,255,255,0.05);">
                  <p style="margin:0; font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #94A39C;">
                    &copy; ${new Date().getFullYear()} Nailbech
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}