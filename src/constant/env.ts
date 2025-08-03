import { getSecret } from "astro:env/server";

export const SHEET_ID = getSecret("SHEETS_ID") ?? "default-sheet-id";
export const CLIENT_EMAIL = getSecret("CLIENT_EMAIL") ?? "default-client-email";
export const PRIVATE_KEY = getSecret("PRIVATE_KEY") ?? "default-private-key";