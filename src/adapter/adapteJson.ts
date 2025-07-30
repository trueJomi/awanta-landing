import type { Prestamo } from "@/models/Prestamo";
import type { DataJson } from "@/types/dataJson.type";

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
        estado: data.estado as "pendiente" | "pagado" | "vencido",
    };
}