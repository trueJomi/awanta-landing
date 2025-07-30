export interface DataJson {
    id: string;
    dni: string;
    fechaPrestamo: string;
    fechaVencimiento: string;
    monto: number;
    interes: number;
    fechaPago?: string;
    personaId: string;
    estado: string;
}