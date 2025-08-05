import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet"
import { CLIENT_EMAIL, PRIVATE_KEY, SHEET_ID } from "@/constant/env";
import { adapterSheetToPrestamos } from "@/adapter/adapteJson";
import type { TableData } from "@/types/sheet.type";
import type { Prestamo } from "@/models/Prestamo";

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
];

const auth = new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: SCOPES,
})

export async function getDataFromSheet() {
    const document = new GoogleSpreadsheet(SHEET_ID, auth)
    await document.loadInfo();
    const sheet = document.sheetsByTitle["Nivel crediticio"];
    if (!sheet) {
        throw new Error("No se encontró la hoja 'Nivel crediticio'");
    }
    const rows = await sheet.getRows<TableData>();
    const data: Prestamo[] = []
    for (const row of rows) {
        const rowData = adapterSheetToPrestamos(row.toObject());
        if (rowData) {
            data.push(rowData);
        }
    }
    return data;
}