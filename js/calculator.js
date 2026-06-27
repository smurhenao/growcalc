import { soulSensei } from "./data.js";

/*
=================================
CALCULAR NUTRIENTES
=================================
*/

export function calculateNutrients(
    stage,
    week,
    liters
) {

    const recipe =
        soulSensei.stages[stage]
            .find(item => item.week === week);

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

    const gallons =
        liters / soulSensei.conversionFactor;

    /*
    ============================
    DOSIS FINAL
    ============================
    */

    return {

        grow:
            recipe.nutrients.grow * gallons,

        bloom:
            recipe.nutrients.bloom * gallons,

        micro:
            recipe.nutrients.micro * gallons

    };

}