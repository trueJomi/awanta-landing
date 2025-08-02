import { getSecret } from "astro:env/server";

export const SHEET_ID = getSecret("SHEETS_ID") ?? "default-sheet-id";