import data from '@/data/test.json';
import { classifyType, getCreditoScoreSimple2} from '@/lib/prestamo';
import type { Score2 } from '@/models/NivelCredito';
import { getDataFromSheet } from './sheet';



export async function getDataSheet(dni: string): Promise<Score2> {
    const sheet = await getDataFromSheet()
    const userData = sheet.filter((item) => item.dni === dni);
    if (userData.length === 0) {
        throw new Error("No se encontraron datos para el DNI proporcionado");
    }
    const nivelCredito = getCreditoScoreSimple2(userData);
    // console.log("Nivel de credito", nivelCredito);
    let points = 0;
    const nopuntuales = nivelCredito.prestamos - nivelCredito.pagosPuntuales;
    let promedioMora = 0;
    if (nopuntuales !== 0) {
        promedioMora = nivelCredito.diasMora / nopuntuales;
    }
    if (promedioMora < 1) {
        points += 40;
    } else if (promedioMora < 3) {
        points += 20;
    } else if (promedioMora < 5) {
        points += 10;
    }
    const pagosPuntualesPorcentaje = (nivelCredito.pagosPuntuales / nivelCredito.prestamos) * 100;
    if (pagosPuntualesPorcentaje >= 80) {
        points += 50;
    } else if (pagosPuntualesPorcentaje >= 50) {
        points += 30;
    } else if (pagosPuntualesPorcentaje >= 30) {
        points += 10;
    }
    const diferenciaDias = Math.ceil(
        (new Date().getTime() - nivelCredito.lastPrestamo.getTime()) / (1000 * 3600 * 24)
    );
    if (diferenciaDias < 30) {
        points += 10;
    } else if (diferenciaDias < 60) {
        points += 5;
    }

    const diferenciaMeses = Math.ceil(
        (new Date().getTime() - nivelCredito.firstPrestamo.getTime()) / (1000 * 3600 * 24 * 30)
    );

    if (diferenciaMeses < 4) {
        points += 10;
    } else if (diferenciaMeses < 2) {
        points += 5;
    }

    if (nivelCredito.incidenciaGrave > 0) {
        return {
            puntos: 0,
            dni,
            score: "out",
            puntualidad: pagosPuntualesPorcentaje,
            currentPromotion: 20,
            upPromotion: 20,
            promedioMora: promedioMora,
            insidenciaGrave: nivelCredito.incidenciaGrave
        }
    }
    if (points > 100) {
        points = 100;
    }
    const score = classifyType(points);
    return {
        puntos: points,
        dni,
        puntualidad: pagosPuntualesPorcentaje,
        promedioMora: promedioMora,
        upPromotion: nivelCredito.upPromotion,
        currentPromotion: nivelCredito.currentPromotion,
        score,
    };

}