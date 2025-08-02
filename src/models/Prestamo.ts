export interface Prestamo {
    id: string;
    dni: string;
    fechaPrestamo: Date;
    fechaVencimiento: Date;
    monto: number;
    interes: number;
    fechaPago?: Date;
    personaId: string;
    estado: "pendiente" | "pagado";
}
