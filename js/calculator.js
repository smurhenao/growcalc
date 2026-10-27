import { soulSensei } from "./data.js";

/**
 * Límites de seguridad para evitar desbordamientos numéricos (DoS / UI overflow).
 */
export const MAX_WATER_LITERS = 100000;
export const MIN_WATER_LITERS = 0;

/**
 * Sanitiza y valida la cantidad de agua ingresada.
 * @param {number|string} value
 * @returns {number} Cantidad válida entre 0 y MAX_WATER_LITERS
 */
export function sanitizeWaterAmount(value) {
    const parsed = typeof value === "number" ? value : parseFloat(String(value).replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < MIN_WATER_LITERS) {
        return 0;
    }
    if (parsed > MAX_WATER_LITERS) {
        return MAX_WATER_LITERS;
    }
    return parsed;
}

/**
 * Convierte litros a galones estadounidenses (US Gal) usando el factor oficial.
 * @param {number} liters
 * @returns {number}
 */
export function litersToGallons(liters) {
    const validLiters = sanitizeWaterAmount(liters);
    return validLiters / soulSensei.conversionFactor;
}

/**
 * Convierte galones estadounidenses a litros usando el factor oficial.
 * @param {number} gallons
 * @returns {number}
 */
export function gallonsToLiters(gallons) {
    const validGallons = sanitizeWaterAmount(gallons);
    return validGallons * soulSensei.conversionFactor;
}

/**
 * Obtiene la receta base (ml por galón) para una etapa y semana dadas.
 * @param {string} stage
 * @param {number|string} week
 * @returns {object|null}
 */
export function getRecipe(stage, week) {
    if (!Object.prototype.hasOwnProperty.call(soulSensei.stages, stage)) {
        return null;
    }
    const stageWeeks = soulSensei.stages[stage];
    return stageWeeks.find((item) => String(item.week) === String(week)) || null;
}

/*
=================================
CALCULAR NUTRIENTES (API Oficial)
=================================
*/

/**
 * Calcula los mililitros totales de cada nutriente según etapa, semana y litros de agua.
 * Respeta exactamente la fórmula oficial: (litros / 3.78541) * dosis_por_galón.
 *
 * @param {string} stage - "vegetative" | "flowering"
 * @param {number|string} week - Número de semana o "flush"
 * @param {number} liters - Cantidad de agua en litros
 * @returns {{ grow: number, bloom: number, micro: number }}
 */
export function calculateNutrients(stage, week, liters) {
    const recipe = getRecipe(stage, week);

    if (!recipe) {
        return {
            grow: 0,
            bloom: 0,
            micro: 0
        };
    }

    /*
    ============================
    LITROS -> GALONES
    ============================
    */
    const validLiters = sanitizeWaterAmount(liters);
    const gallons = validLiters / soulSensei.conversionFactor;

    /*
    ============================
    DOSIS FINAL
    ============================
    */
    return {
        grow: recipe.nutrients.grow * gallons,
        bloom: recipe.nutrients.bloom * gallons,
        micro: recipe.nutrients.micro * gallons
    };
}

/**
 * Calcula el plan detallado de nutrición incluyendo tasas por galón, por litro y totales.
 * @param {string} stage
 * @param {number|string} week
 * @param {number} liters
 */
export function calculateDetailedPlan(stage, week, liters) {
    const validLiters = sanitizeWaterAmount(liters);
    const gallons = litersToGallons(validLiters);
    const recipe = getRecipe(stage, week);
    const totals = calculateNutrients(stage, week, validLiters);

    const perGallon = recipe
        ? { ...recipe.nutrients }
        : { grow: 0, bloom: 0, micro: 0 };

    const perLiter = {
        grow: perGallon.grow / soulSensei.conversionFactor,
        bloom: perGallon.bloom / soulSensei.conversionFactor,
        micro: perGallon.micro / soulSensei.conversionFactor
    };

    const totalMl = totals.micro + totals.grow + totals.bloom;
    const isFlush = week === "flush" || (perGallon.grow === 0 && perGallon.bloom === 0 && perGallon.micro === 0);

    return {
        stage,
        week,
        recipe,
        liters: validLiters,
        gallons,
        totals,
        perGallon,
        perLiter,
        totalMl,
        isFlush
    };
}
