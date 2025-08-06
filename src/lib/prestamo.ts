import { PromotionCreditList, promotionsCredit } from "@/constant/promotions";
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
interface CreditScoreData2 extends CreditScoreData {
    currentPromotion: number;
    upPromotion: number;
}

function getPromtionalInterval(value: number) {
    for (let i = 0; i < PromotionCreditList.length; i++) {
        if (value < PromotionCreditList[i].required ) {
            if (i === 0) {
                return PromotionCreditList[0];
            } 
            return PromotionCreditList[i - 1];
        }
    }
    return PromotionCreditList[0];
}

export function getCreditoScoreSimple2(transactions: Prestamo[]): CreditScoreData2 {
    const data = transactions.sort((a, b) => a.fechaPrestamo.getTime() - b.fechaPrestamo.getTime());

    let diasMora = 0;
    let prestamos = 0;
    let pagosPuntuales = 0;
    let incidenciaGrave = 0;
    let currentPromotion = 0;
    let sumaIntereses = 0;
    let indextLastIncident = -1;

    for (let i = 0; i < data.length; i++) {
        const currentItem = data[i];
        if (currentItem.estado === "pagado" && currentItem.fechaPago !== undefined) {
            const diferenciaDias = Math.ceil(
                (currentItem.fechaPago.getTime() - currentItem.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            // console.log("Diferencia dias", diferenciaDias);
            prestamos += 1;
            sumaIntereses += currentItem.interes;
            if (diferenciaDias > 0 && diferenciaDias < 5) {
                indextLastIncident = i;
                diasMora += diferenciaDias;
            } else if (diferenciaDias >= 5) {
                incidenciaGrave += 1;
                diasMora += diferenciaDias;
            } else {
                pagosPuntuales += 1;
            }

            if (currentPromotion === 0) {
                currentPromotion = currentItem.monto
            } else {
                if (currentItem.monto > currentPromotion) {
                    currentPromotion = currentItem.monto;
                }
            }
        } else {
            const diferenciaDias = Math.ceil(
                (new Date().getTime() - currentItem.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            if (diferenciaDias > 0) {
                prestamos += 1;
                diasMora += diferenciaDias;
                if (diferenciaDias > 5) {
                    incidenciaGrave += 1;
                }
            }
        }
    }
    const promotionValue = promotionsCredit[currentPromotion];
    let upPromotionIdx = getPromtionalInterval(sumaIntereses).idx;
    let recurrentIncident = false

    if (indextLastIncident >= 0) {
        const lastIncident = data[indextLastIncident];
        const incidentDiferenceDias = Math.ceil(
            (lastIncident.fechaPago!.getTime() - lastIncident.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
        );

    
        for (let i = indextLastIncident-1; i < 0; i++) {
            const currentItem = data[i];
            if (currentItem.fechaPago !== undefined) {
                const diferenciaDias = Math.ceil(
                    (currentItem.fechaPago.getTime() - currentItem.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
                );
                if (diferenciaDias > 0) {
                    recurrentIncident = true;
                }
            } else {
                const diferenciaDias = Math.ceil(
                    (new Date().getTime() - currentItem.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
                );
                if (diferenciaDias > 0) {
                    recurrentIncident = true;
                }
            }
        }
        if (incidentDiferenceDias <= 1 && recurrentIncident) {
            if (upPromotionIdx > 0) {
                upPromotionIdx-= 1;
            }
        } else if (incidentDiferenceDias <= 5 && !recurrentIncident) {
            upPromotionIdx = promotionValue.idx;
        } else if (incidentDiferenceDias > 5 && recurrentIncident) {
            if (promotionValue.idx > 0) {
                currentPromotion =PromotionCreditList[promotionValue.idx-1].nivel
            }
            upPromotionIdx = promotionValue.idx;
        }
    }

    return {
        dni: data[0].dni,
        firstPrestamo: data[0].fechaPrestamo,
        lastPrestamo: data[data.length - 1].fechaPrestamo,
        diasMora,
        prestamos,
        pagosPuntuales,
        incidenciaGrave,
        currentPromotion,
        upPromotion: PromotionCreditList[upPromotionIdx].nivel
    }
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