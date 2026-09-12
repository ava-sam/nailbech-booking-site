import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleCalendar";
 
export async function GET() {
  return NextResponse.redirect(getAuthUrl());
}
