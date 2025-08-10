import { PromotionCreditList, promotionsCredit } from "@/constant/promotions";
import type { CreditScoreKeys } from "@/constant/score";
import type { CreditScoreData, NivelCredito } from "@/models/NivelCredito";
import type { Prestamo } from "@/models/Prestamo";

/**
 * Calcula el nivel crediticio básico de un usuario
 * Clasifica los préstamos por tipo de incidencia según días de retraso
 * @param data - Array de préstamos del usuario
 * @returns Objeto con estadísticas de nivel crediticio
 */
export function getDataNivelCredito(data:Prestamo[]): NivelCredito {
    const dataSuma = data.reduce((acc, item) => {
        // Procesar préstamos pagados
        if (item.estado === "pagado" && item.fechaPago !== undefined) {
            acc.prestamos += 1;
            
            // Calcular días de diferencia entre pago real y fecha de vencimiento
            const diferenciaDias = Math.ceil(
                (item.fechaPago.getTime() - item.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            )
            
            // Clasificar según días de retraso
            if (diferenciaDias <= 0) {
                acc.pagosPuntuales += 1;     // Pago a tiempo o anticipado
            } else if (diferenciaDias <= 1) {
                acc.insidencia += 1;         // Retraso leve (1 día)
            } else if (diferenciaDias <= 3) {
                acc.incidenciaMedia += 1;    // Retraso moderado (2-3 días)
            } else {
                acc.incidenciaAlta += 1;     // Retraso grave (4+ días)
            }
        } else {
            // Procesar préstamos pendientes/vencidos
            const diferenciaDias = Math.ceil(
                (new Date().getTime() - item.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            
            // Solo contar si ya venció
            if (diferenciaDias > 0) {
                acc.prestamos += 1;
                
                // Clasificar préstamos vencidos según días transcurridos
                if (diferenciaDias === 1) {
                    acc.insidencia += 1;         // Vencido 1 día
                } else if (diferenciaDias <= 3) {
                    acc.incidenciaMedia += 1;    // Vencido 2-3 días
                } else if (diferenciaDias > 3) {
                    acc.incidenciaAlta += 1;     // Vencido 4+ días
                }
            } 
        }
        return acc;
    }, {
        prestamos: 0,           // Total de préstamos procesados
        pagosPuntuales: 0,      // Pagos a tiempo
        insidencia: 0,          // Retrasos leves (1 día)
        incidenciaMedia: 0,     // Retrasos moderados (2-3 días)
        incidenciaAlta: 0       // Retrasos graves (4+ días)
    });
    
    return {
        ...dataSuma,
        dni: data[0].dni
    }
}
/**
 * Interfaz extendida para incluir información de promociones
 */
interface CreditScoreData2 extends CreditScoreData {
    currentPromotion: number;  // Nivel actual de promoción
    upPromotion: number;       // Nivel de promoción al que puede ascender
    existIncidnciaGrave: boolean; // Indica si existe una incidencia grave
}

/**
 * Encuentra el intervalo de promoción según el valor de intereses acumulados
 * @param value - Suma total de intereses pagados
 * @returns Objeto con información del nivel promocional
 */
function getPromtionalInterval(value: number) {
    // Buscar el primer nivel que requiere más intereses que el valor actual
    for (let i = 0; i < PromotionCreditList.length; i++) {
        if (value < PromotionCreditList[i].required ) {
            if (i === 0) {
                return PromotionCreditList[0];  // Nivel inicial
            } 
            return PromotionCreditList[i - 1];  // Nivel anterior al requerimiento
        }
    }
    return PromotionCreditList[0];  // Por defecto, nivel inicial
}


/**
 * Analiza si existen incidencias recurrentes en un rango de transacciones previas
 * @param data - Array completo de transacciones ordenadas cronológicamente
 * @param indexLast - Índice de la última transacción a analizar (punto de referencia)
 * @param cantsearch - Cantidad de transacciones previas a revisar
 * @param gravedadMinima - Días mínimos de retraso para considerar como incidencia
 * @returns true si encuentra al menos una incidencia en el rango especificado
 */
function recurrentDataIncidentPreview(data: Prestamo[], indexLast: number,cantsearch: number, gravedadMinima:number) {
    let recurrentIncident = false
    
    // Revisar las últimas 'cantsearch' transacciones previas al índice dado
    for (let i = indexLast-1; i >= 0 && i >= indexLast - (cantsearch-1); i--) {
        const currentItem = data[i];
        
        if (currentItem.fechaPago !== undefined) {
            // Revisar préstamos pagados anteriores
            const diferenciaDias = Math.ceil(
                (currentItem.fechaPago.getTime() - currentItem.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            if (diferenciaDias >= gravedadMinima) {
                recurrentIncident = true;  // Encontró incidencia que cum   ple el criterio de gravedad
            }
        } else {
            // Revisar préstamos vencidos anteriores
            const diferenciaDias = Math.ceil(
                (new Date().getTime() - currentItem.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            if (diferenciaDias >= gravedadMinima) {
                recurrentIncident = true;  // Encontró incidencia que cumple el criterio de gravedad
            }
        }
    }
    return recurrentIncident;
}

/**
 * Calcula el score crediticio avanzado incluyendo promociones y penalizaciones
 * Analiza el comportamiento de pago y determina niveles de promoción
 * @param transactions - Array de transacciones del usuario ordenadas cronológicamente
 * @returns Objeto con datos completos del score crediticio y promociones
 */
export function getCreditoScoreSimple(transactions: Prestamo[]): CreditScoreData2 {
    // Ordenar transacciones por fecha ascendente para análisis cronológico
    const data = transactions.sort((a, b) => a.fechaPrestamo.getTime() - b.fechaPrestamo.getTime());

    // Variables para el cálculo del score
    let diasMora = 0;           // Días totales de mora acumulados
    let prestamos = 0;          // Número total de préstamos
    let pagosPuntuales = 0;     // Número de pagos puntuales
    let incidenciaGrave = 0;    // Incidencias graves (≥5 días de retraso)
    let currentPromotion = 0;   // Monto máximo prestado (nivel actual)
    let sumaIntereses = 0;      // Suma total de intereses pagados
    let indextLastIncident = -1;// Índice del último incidente de pago

    // Procesar cada transacción cronológicamente
    for (let i = 0; i < data.length; i++) {
        const currentItem = data[i];
        
        if (currentItem.estado === "pagado" && currentItem.fechaPago !== undefined) {
            // === PRÉSTAMOS PAGADOS ===
            
            // Calcular días de diferencia entre pago real y vencimiento
            const diferenciaDias = Math.ceil(
                (currentItem.fechaPago.getTime() - currentItem.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            
            prestamos += 1;
            sumaIntereses += currentItem.interes;  // Acumular intereses para promociones
            
            // Clasificar según días de retraso
            if (diferenciaDias > 0 && diferenciaDias < 5) {
                // Retraso leve a moderado (1-4 días)
                indextLastIncident = i;  // Marcar como último incidente
                diasMora += diferenciaDias;
            } else if (diferenciaDias >= 5) {
                // Retraso grave (5+ días)
                incidenciaGrave += 1;
                indextLastIncident = i;
                diasMora += diferenciaDias;
            } else {
                // Pago puntual (a tiempo o anticipado)
                pagosPuntuales += 1;
            }

            // Actualizar nivel de promoción actual (monto máximo prestado)
            if (currentPromotion === 0) {
                currentPromotion = currentItem.monto;  // Primer préstamo
            } else {
                if (currentItem.monto > currentPromotion) {
                    currentPromotion = currentItem.monto;  // Nuevo máximo
                }
            }
        } else {
            // === PRÉSTAMOS PENDIENTES/VENCIDOS ===
            
            // Calcular días desde el vencimiento hasta hoy
            const diferenciaDias = Math.ceil(
                (new Date().getTime() - currentItem.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
            
            // Solo procesar si ya está vencido
            if (diferenciaDias > 0) {
                prestamos += 1;
                diasMora += diferenciaDias;
                indextLastIncident = i;  // Marcar como último incidente
                
                // Si lleva más de 5 días vencido, es incidencia grave
                if (diferenciaDias > 5) {
                    incidenciaGrave += 1;
                }
            }
        }
    }
    // === CÁLCULO DE PROMOCIONES Y PENALIZACIONES ===
    
    const promotionValue = promotionsCredit[currentPromotion];  // Info del nivel actual
    let upPromotionIdx = getPromtionalInterval(sumaIntereses).idx;  // Nivel basado en intereses

    let existIncidnciaGrave = false;
    // Analizar patrones de incidencias si existe al menos una
    if (indextLastIncident >= 0) {
        const lastIncident = data[indextLastIncident];
        
        // Calcular días de retraso del último incidente
        let incidentDiferenceDias = 0;
        if (lastIncident.fechaPago !== undefined) {
            // Incidente ya pagado
            incidentDiferenceDias = Math.ceil(
                (lastIncident.fechaPago.getTime() - lastIncident.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
        } else {
            // Incidente aún pendiente
            incidentDiferenceDias = Math.ceil(
                (new Date().getTime() - lastIncident.fechaVencimiento.getTime()) / (1000 * 3600 * 24)
            );
        }

        // === ANÁLISIS DE PATRONES DE INCIDENCIAS ===
        
        // Buscar incidencias recurrentes en las últimas 5 transacciones (cualquier retraso)
        const recurrentIncident = recurrentDataIncidentPreview(data, indextLastIncident, 5, 0);
        
        // Verificar si existen incidencias graves (≥5 días) en las últimas 3 transacciones
        existIncidnciaGrave = recurrentDataIncidentPreview(data, data.length, 3, 5);

        
        // === APLICAR PENALIZACIONES SEGÚN PATRÓN DE COMPORTAMIENTO ===
        
        if (incidentDiferenceDias <= 1 && recurrentIncident) {
            // PENALIZACIÓN LEVE: Retraso menor a 1 día pero con historial de incidencias
            if (upPromotionIdx > 0) {
                upPromotionIdx -= 1;  // Bajar un nivel de promoción
            }
        } else if (incidentDiferenceDias <= 5 && !recurrentIncident) {
            // MANTENER NIVEL: Retraso moderado pero sin historial previo
            upPromotionIdx = promotionValue.idx;  // Mantener nivel actual
        } else if (incidentDiferenceDias > 5 && recurrentIncident) {
            // PENALIZACIÓN GRAVE: Retraso grave con historial de incidencias
            if (promotionValue.idx > 0) {
                // Bajar el nivel actual de promoción
                currentPromotion = PromotionCreditList[promotionValue.idx-1].nivel;
            }
            upPromotionIdx = promotionValue.idx;  // Mantener este nivel reducido
        }

        // === PENALIZACIÓN ADICIONAL POR INCIDENCIAS GRAVES RECIENTES ===
        // Si hay incidencias graves en las últimas 3 transacciones, reducir nivel actual
        if (existIncidnciaGrave) {
            currentPromotion = PromotionCreditList[upPromotionIdx - 1].nivel;
        }
    }

    // === RETORNAR RESULTADO FINAL ===
    return {
        dni: data[0].dni,
        nombre: data[0].nombre,
        firstPrestamo: data[0].fechaPrestamo,          // Fecha del primer préstamo
        lastPrestamo: data[data.length - 1].fechaPrestamo,  // Fecha del último préstamo
        diasMora,                                      // Total días de mora acumulados
        prestamos,                                     // Total de préstamos procesados
        pagosPuntuales,                               // Número de pagos puntuales
        incidenciaGrave,                              // Número de incidencias graves
        currentPromotion,                             // Nivel actual de promoción
        upPromotion: PromotionCreditList[upPromotionIdx].nivel,  // Nivel al que puede ascender
        existIncidnciaGrave
    }
}

/**
 * Clasifica el score numérico en categorías de riesgo crediticio
 * @param score - Puntaje numérico del 0 al 100
 * @returns Clave de categoría crediticia
 */
export function classifyType(score: number): CreditScoreKeys {
    if (score >= 90) {
        return "excelent";  // 90-100: Excelente historial crediticio
    } else if (score >= 70) {
        return "good";      // 70-89: Buen historial crediticio
    } else if (score >= 45) {
        return "mid";       // 45-69: Historial crediticio regular
    } else if (score >= 20) {
        return "bad";       // 20-44: Mal historial crediticio
    } else {
        return "out";       // 0-19: Muy mal historial crediticio
    }
}
