import { google } from "googleapis";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Used for the one-time setup flow — generates the URL she visits to
// grant calendar access.
export function getAuthUrl() {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline", // required to get a refresh_token back
    prompt: "consent",      // forces Google to always return a refresh_token
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
}

// Used for ongoing calendar reads/writes once GOOGLE_REFRESH_TOKEN is set.
export function getCalendarClient() {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return google.calendar({ version: "v3", auth: oauth2Client });
}