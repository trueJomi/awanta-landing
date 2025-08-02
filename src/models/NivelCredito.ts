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
    dni: string;
    puntualidad: number;
    promedioMora: number;
    score: CreditScoreKeys;
    insidenciaGrave?: number;
}

export interface Score2 extends Score {
    currentPromotion: number;
    upPromotion: number;
}
