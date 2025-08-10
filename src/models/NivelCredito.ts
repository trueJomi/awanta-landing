import type { CreditScoreKeys } from "@/constant/score";

export interface NivelCredito {
    dni: string;
    prestamos: number;
    pagosPuntuales: number;
    insidencia: number;
    incidenciaMedia: number;
    incidenciaAlta: number;
}

export interface CreditScoreData {
    nombre: string;
    dni: string;
    diasMora: number;
    prestamos: number;
    pagosPuntuales: number;
    firstPrestamo: Date;
    lastPrestamo: Date;
    incidenciaGrave: number;
}

export interface Score {
    puntos: number;
    nombre: string;
    dni: string;
    puntualidad: number;
    promedioMora: number;
    score: CreditScoreKeys;
    insidenciaGrave?: number;
    currentPromotion: number;
    upPromotion: number;
}
