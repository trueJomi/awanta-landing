import type { CreditScoreKeys } from "@/constant/score";
import type { CreditScoreData, NivelCredito } from "@/models/NivelCredito";
import type { Prestamo } from "@/models/Prestamo";

export function getDataNivelCredito(data:Prestamo[]): NivelCredito {
    const dataSuma = data.reduce((acc, item) => {
        if (item.estado === "pagado" && item.fechaPago !== undefined) {
            acc.prestamos += 1;
            const diferenciaDias = Math.ceil(
                (item.fechaPago.getTime() - item.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            )
            if (diferenciaDias <= 0) {
                acc.pagosPuntuales += 1;
            } else if (diferenciaDias <= 1) {
                acc.insidencia += 1;
            } else if (diferenciaDias <= 3) {
                acc.incidenciaMedia += 1;
            } else {
                acc.incidenciaAlta += 1;
            }
        } else {
            const diferenciaDias = Math.ceil(
                (new Date().getTime() - item.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            if (diferenciaDias > 0) {
                acc.prestamos += 1;
                if (diferenciaDias === 1) {
                    acc.insidencia += 1;
                } else if (diferenciaDias <= 3) {
                    acc.incidenciaMedia += 1;
                } else if (diferenciaDias > 3) {
                    acc.incidenciaAlta += 1;
                }
            } 
        }
        // You can add more conditions for insidencia, incidenciaMedia, incidenciaAlta here if needed
        return acc;
    }, {
        prestamos: 0,
        pagosPuntuales: 0,
        insidencia: 0,
        incidenciaMedia: 0,
        incidenciaAlta: 0
    });
    return {
        ...dataSuma,
        dni: data[0].dni
    }
    // You may want to return or use dataSuma here
}

export function getCreditScoreSimple(data: Prestamo[]): CreditScoreData {
    const dataSuma = data.reduce((acc, item) => {
        if (item.estado === "pagado" && item.fechaPago !== undefined) {
            const diferenciaDias = Math.ceil(
                (item.fechaPago.getTime() - item.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            acc.prestamos += 1;
            if (diferenciaDias > 0) {
                acc.diasMora += diferenciaDias;
            } else if (diferenciaDias > 5) {
                acc.insidenciaGrave += 1;
            } else {
                acc.pagosPuntuales += 1;
            }
        } else {
            const diferenciaDias = Math.ceil(
                (new Date().getTime() - item.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            if (diferenciaDias > 0) {
                acc.prestamos += 1;
                acc.diasMora += diferenciaDias;
            }
        }
        return acc;
    }, {
        diasMora: 0,
        prestamos: 0,
        pagosPuntuales: 0,
        insidenciaGrave: 0,
    })
    const sortedData = data.sort((a, b) => a.fechaPrestamo.getTime() - b.fechaPrestamo.getTime());
    return {
        dni: data[0].dni,
        firstPrestamo: sortedData[0].fechaPrestamo,
        lastPrestamo: sortedData[sortedData.length - 1].fechaPrestamo,
        diasMora: dataSuma.diasMora,
        prestamos: dataSuma.prestamos,
        pagosPuntuales: dataSuma.pagosPuntuales,
        incidenciaGrave: dataSuma.insidenciaGrave
    };
}

export function classifyType(score: number): CreditScoreKeys {
    if (score >= 90) {
        return "excelent";
    } else if (score >= 70) {
        return "good";
    } else if (score >= 45) {
        return "mid";
    } else if (score >= 20) {
        return "bad";
    } else {
        return "out";
    }
}