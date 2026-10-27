/**
 * @fileoverview Tabla oficial de nutrición Soul Sensei.
 * Estructura inmutable y congelada para garantizar integridad de datos.
 */

const deepFreeze = (obj) => {
    if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
        Object.freeze(obj);
        Object.keys(obj).forEach((key) => deepFreeze(obj[key]));
    }
    return obj;
};

export const soulSensei = deepFreeze({
    brand: "Soul Sensei",
    conversionFactor: 3.78541, // Litros por galón estadounidense (US Gal)
    phRange: {
        min: 5.5,
        max: 6.5,
        optimal: 6.0
    },
    nutrientsMeta: [
        {
            id: "micro",
            order: 1,
            label: "Soul Sensei Micro",
            shortLabel: "Micro",
            role: "Base de micronutrientes, calcio y nitrógeno quelatado",
            instruction: "Agregar siempre PRIMERO al agua y mezclar bien antes de los demás.",
            className: "micro"
        },
        {
            id: "grow",
            order: 2,
            label: "Soul Sensei Grow",
            shortLabel: "Grow",
            role: "Desarrollo estructural, tallos y follaje vigoroso",
            instruction: "Agregar en segundo lugar tras diluir Micro en el agua.",
            className: "grow"
        },
        {
            id: "bloom",
            order: 3,
            label: "Soul Sensei Bloom",
            shortLabel: "Bloom",
            role: "Potenciador de floración, densidad y producción de resina",
            instruction: "Agregar en tercer lugar y finalizar ajustando el pH (5.5 - 6.5).",
            className: "bloom"
        }
    ],
    stages: {
        vegetative: [
            {
                week: 1,
                label: "Semana 1",
                phaseTitle: "Plántula / Inicio Vegetativo",
                nutrients: {
                    grow: 2.5,
                    bloom: 2.5,
                    micro: 2.5
                }
            },
            {
                week: 2,
                label: "Semana 2",
                phaseTitle: "Crecimiento Temprano",
                nutrients: {
                    grow: 5,
                    bloom: 4,
                    micro: 5
                }
            },
            {
                week: 3,
                label: "Semana 3",
                phaseTitle: "Vegetativo Medio",
                nutrients: {
                    grow: 6.5,
                    bloom: 5,
                    micro: 7
                }
            },
            {
                week: 4,
                label: "Semana 4",
                phaseTitle: "Vegetativo Pleno",
                nutrients: {
                    grow: 8,
                    bloom: 6,
                    micro: 8.5
                }
            }
        ],

        flowering: [
            {
                week: 1,
                label: "Semana 1",
                phaseTitle: "Transición / Pre-floración",
                nutrients: {
                    grow: 6.5,
                    bloom: 8.5,
                    micro: 7.5
                }
            },
            {
                week: 2,
                label: "Semana 2",
                phaseTitle: "Formación de Botones",
                nutrients: {
                    grow: 6.5,
                    bloom: 8.5,
                    micro: 7.5
                }
            },
            {
                week: 3,
                label: "Semana 3",
                phaseTitle: "Floración Temprana",
                nutrients: {
                    grow: 6.5,
                    bloom: 9.5,
                    micro: 6.5
                }
            },
            {
                week: 4,
                label: "Semana 4",
                phaseTitle: "Engorde de Flores I",
                nutrients: {
                    grow: 6.5,
                    bloom: 9.5,
                    micro: 6.5
                }
            },
            {
                week: 5,
                label: "Semana 5",
                phaseTitle: "Engorde Máximo",
                nutrients: {
                    grow: 6.5,
                    bloom: 9.5,
                    micro: 6.5
                }
            },
            {
                week: 6,
                label: "Semana 6",
                phaseTitle: "Maduración I",
                nutrients: {
                    grow: 4.5,
                    bloom: 5.5,
                    micro: 4.5
                }
            },
            {
                week: 7,
                label: "Semana 7",
                phaseTitle: "Maduración II",
                nutrients: {
                    grow: 4.5,
                    bloom: 5.5,
                    micro: 4.5
                }
            },
            {
                week: 8,
                label: "Semana 8",
                phaseTitle: "Finalización",
                nutrients: {
                    grow: 2.5,
                    bloom: 4.5,
                    micro: 2.5
                }
            },
            {
                week: "flush",
                label: "Flush",
                phaseTitle: "Lavado de Raíces (Solo Agua)",
                nutrients: {
                    grow: 0,
                    bloom: 0,
                    micro: 0
                }
            }
        ]
    }
});
