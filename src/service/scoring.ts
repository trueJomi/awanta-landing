import data from '@/data/test.json';
import { classifyType, getCreditoScoreSimple} from '@/lib/prestamo';
import type { Score } from '@/models/NivelCredito';
import { getDataFromSheet } from './sheet';

/**
 * Función principal para calcular el score crediticio de un usuario
 * Combina datos de Google Sheets con algoritmos de scoring avanzado
 * @param dni - DNI del usuario a evaluar
 * @returns Objeto Score2 con puntaje, categoría y niveles de promoción
**/
export async function getDataSheet(dni: string): Promise<Score> {
    // === OBTENER Y FILTRAR DATOS ===
    const sheet = await getDataFromSheet();
    const userData = sheet.filter((item) => item.dni === dni);
    
    if (userData.length === 0) {
        throw new Error("No se encontraron datos para el DNI proporcionado");
    }

    // === CALCULAR DATOS BASE DEL SCORE ===
    const nivelCredito = getCreditoScoreSimple(userData);

    if (nivelCredito.prestamos === 0) {
        throw new Error("Todavía no se ha calculado el nivel crediticio porque no hay datos suficientes.");
    }

    // === ALGORITMO DE PUNTUACIÓN (0-100 PUNTOS) ===
    let points = 0;
    
    // Calcular métricas base para el scoring
    const nopuntuales = nivelCredito.prestamos - nivelCredito.pagosPuntuales;
    let promedioMora = 0;
    if (nopuntuales !== 0) {
        promedioMora = nivelCredito.diasMora / nopuntuales;
    }
    
    // === FACTOR 1: PROMEDIO DE MORA (0-40 puntos) ===
    // Evalúa qué tan tarde paga en promedio cuando tiene retrasos
    if (promedioMora < 1) {
        points += 40;  // Excelente: retrasos menores a 1 día
    } else if (promedioMora < 3) {
        points += 20;  // Bueno: retrasos de 1-3 días
    } else if (promedioMora < 5) {
        points += 10;  // Regular: retrasos de 3-5 días
    }
    // Malo: más de 5 días = 0 puntos
    
    // === FACTOR 2: PUNTUALIDAD EN PAGOS (0-50 puntos) ===
    // Evalúa el porcentaje de pagos realizados a tiempo
    const pagosPuntualesPorcentaje = (nivelCredito.pagosPuntuales / nivelCredito.prestamos) * 100;
    if (pagosPuntualesPorcentaje >= 80) {
        points += 50;  // Excelente: 80%+ de pagos puntuales
    } else if (pagosPuntualesPorcentaje >= 50) {
        points += 30;  // Bueno: 50-79% de pagos puntuales
    } else if (pagosPuntualesPorcentaje >= 30) {
        points += 10;  // Regular: 30-49% de pagos puntuales
    }
    // Malo: menos del 30% = 0 puntos
    
    // === FACTOR 3: ACTIVIDAD RECIENTE (0-10 puntos) ===
    // Premia a clientes que han tenido actividad crediticia reciente
    const diferenciaDias = Math.ceil(
        (new Date().getTime() - nivelCredito.lastPrestamo.getTime()) / (1000 * 3600 * 24)
    );
    if (diferenciaDias < 30) {
        points += 10;  // Cliente muy activo (último préstamo hace menos de 30 días)
    } else if (diferenciaDias < 60) {
        points += 5;   // Cliente moderadamente activo (30-60 días)
    }
    // Cliente inactivo: más de 60 días = 0 puntos

    // === FACTOR 4: ANTIGÜEDAD COMO CLIENTE (0-10 puntos) ===
    // Premia la lealtad y experiencia del cliente
    const diferenciaMeses = Math.ceil(
        (new Date().getTime() - nivelCredito.firstPrestamo.getTime()) / (1000 * 3600 * 24 * 30)
    );

    if (diferenciaMeses < 4) {
        points += 10;  // Cliente relativamente nuevo (menos de 4 meses)
    } else if (diferenciaMeses < 2) {
        points += 5;   // Cliente muy nuevo (menos de 2 meses)
    }
    // Cliente con más antigüedad no recibe puntos adicionales por este factor


    // === PENALIZACIÓN POR INCIDENCIAS GRAVES MÚLTIPLES ===
    // Condiciones que llevan automáticamente a score = 0 (sin acceso a crédito)
    if (
        (nivelCredito.incidenciaGrave > 0 && pagosPuntualesPorcentaje < 70) ||  // Incidencias graves + baja puntualidad
        (promedioMora >= 5) ||                                                  // Promedio de mora crítico
        (nivelCredito.incidenciaGrave >= 3)                                     // 3 o más incidencias graves
    ) {
        return {
            puntos: 0,
            dni,
            nombre: nivelCredito.nombre,                                    // Nombre del usuario
            score: "out",                              // Sin acceso a crédito
            puntualidad: pagosPuntualesPorcentaje,
            currentPromotion: 0,                       // Sin promoción actual
            upPromotion: 0,                           // Sin posibilidad de ascenso
            promedioMora: promedioMora,
            insidenciaGrave: nivelCredito.incidenciaGrave  // Número de incidencias graves acumuladas
        }
    }
    
    // === AJUSTES FINALES AL PUNTAJE ===
    // Limitar el puntaje máximo a 100
    if (points > 100) {
        points = 100;
    }
    
    
    
    // === CLASIFICAR SCORE Y RETORNAR RESULTADO ===
    let score = classifyType(points);  // Convertir puntaje a categoría
    
    // === PENALIZACIÓN ADICIONAL POR INCIDENCIAS GRAVES RECIENTES ===
    // Si existen incidencias graves en las últimas 3 transacciones, degradar a "malo"
    if (nivelCredito.existIncidnciaGrave) {
        score = "bad";   // Forzar categoría "malo" independientemente del puntaje calculado
        points = 40;     // Asignar puntaje fijo de 40 (dentro del rango "malo": 20-44)
    }
    
    // === LÓGICA DE PROMOCIONES Y RESTRICCIONES ===
    // Mantener el nivel más alto entre actual y potencial (proteger inversiones del cliente)
    if (nivelCredito.currentPromotion > nivelCredito.upPromotion) {
        nivelCredito.upPromotion = nivelCredito.currentPromotion;
    }
    
    // Penalización por baja puntualidad: no puede ascender de nivel si < 50% puntualidad
    if (pagosPuntualesPorcentaje < 50) {
        nivelCredito.upPromotion = nivelCredito.currentPromotion;  // Mantener nivel actual sin ascenso
    }

    // === RESULTADO FINAL ===
    return {
        puntos: points,                               // Puntaje numérico final (0-100)
        dni,                                         // DNI del usuario evaluado
        nombre: nivelCredito.nombre,                                      // Nombre del usuario
        puntualidad: pagosPuntualesPorcentaje,       // Porcentaje de pagos puntuales
        promedioMora: promedioMora,                  // Promedio de días de mora cuando hay retrasos
        upPromotion: nivelCredito.upPromotion,       // Nivel máximo al que puede ascender
        currentPromotion: nivelCredito.currentPromotion, // Nivel actual de promoción
        score                                        // Categoría final del score (excelent, good, mid, bad, out)
    };
}