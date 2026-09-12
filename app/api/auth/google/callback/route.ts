import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/googleCalendar";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    return NextResponse.json(
      {
        error:
          "No refresh token returned. This usually means the account already " +
          "granted access before — revoke access at myaccount.google.com/permissions " +
          "and try the /api/auth/google link again.",
      },
      { status: 400 }
    );
  }

  // This route is for one-time manual setup only — it displays the refresh
  // token so you can copy it into .env.local. Delete or protect this route
  // once setup is done so the token never gets shown again.
  return NextResponse.json({
    message: "Copy the refresh_token below into .env.local as GOOGLE_REFRESH_TOKEN, then restart your dev server.",
    refresh_token: tokens.refresh_token,
  });
}