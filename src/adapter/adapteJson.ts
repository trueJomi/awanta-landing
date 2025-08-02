import type { Prestamo } from "@/models/Prestamo";
import type { DataJson } from "@/types/dataJson.type";
import type { TableData } from '@/types/sheet.type';
import { schemaTableData } from "@/validators/sheet";
import { z } from "astro/zod";

export function adapterJsonToPrestamos(data: DataJson): Prestamo {
    return {
        id: data.id,
        dni: data.dni,
        fechaPrestamo: new Date(data.fechaPrestamo),
        fechaVencimiento: new Date(data.fechaVencimiento),
        monto: data.monto,
        interes: data.interes,
        fechaPago: data.fechaPago ? new Date(data.fechaPago) : undefined,
        personaId: data.personaId,
        estado: data.estado as "pendiente" | "pagado",
    };
}


function formatDate(date: string) {
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day);
}

function formatPrice(price: string): number {
    const cleanComas = price.replace(/,/g, '');
    const cleanPEN = cleanComas.replace('S/.', '').trim();
    return parseFloat(cleanPEN);
}

function formatPorcentaje(porcentaje: string): number {
    const cleanPorcentaje = porcentaje.replace('%', '').trim();
    return parseFloat(cleanPorcentaje);
}

export function adapterSheetToPrestamos(sheet: Partial<TableData>): Prestamo | undefined {
    const result = schemaTableData.safeParse(sheet); // Validate the data against the schema
    if (!result.success) {
        return undefined
    }
    const data = result.data;
    return {
        id: data.DNI,
        dni: data.DNI,
        fechaPrestamo: formatDate(data.Apertura),
        fechaVencimiento: formatDate(data.Vencimiento), // Assuming current date for simplicity
        monto: formatPrice(data.Monto), // Assuming no monto in this context
        interes: formatPrice(data.Intereses), // Assuming no interes in this context
        fechaPago: data.FechaPago ? formatDate(data.FechaPago) : undefined, // Assuming no fechaPago in this context
        personaId: data.DNI, // Assuming no personaId in this context
        estado: data.Estado, // Defaulting to 'pendiente'   
    }
}

// 30/06/202