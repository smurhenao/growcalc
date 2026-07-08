export const soulSensei = {

    conversionFactor: 3.78541, // Litros por galón

    stages: {

        vegetative: [

            {
                week: 1,
                nutrients: {
                    grow: 2.5,
                    bloom: 2.5,
                    micro: 2.5
                }
            },

            {
                week: 2,
                nutrients: {
                    grow: 5,
                    bloom: 4,
                    micro: 5
                }
            },

            {
                week: 3,
                nutrients: {
                    grow: 6.5,
                    bloom: 5,
                    micro: 7
                }
            },

            {
                week: 4,
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
                nutrients: {
                    grow: 6.5,
                    bloom: 8.5,
                    micro: 7.5
                }
            },

            {
                week: 2,
                nutrients: {
                    grow: 6.5,
                    bloom: 8.5,
                    micro: 7.5
                }
            },

            {
                week: 3,
                nutrients: {
                    grow: 6.5,
                    bloom: 9.5,
                    micro: 6.5
                }
            },

            {
                week: 4,
                nutrients: {
                    grow: 6.5,
                    bloom: 9.5,
                    micro: 6.5
                }
            },

            {
                week: 5,
                nutrients: {
                    grow: 6.5,
                    bloom: 9.5,
                    micro: 6.5
                }
            },

            {
                week: 6,
                nutrients: {
                    grow: 4.5,
                    bloom: 5.5,
                    micro: 4.5
                }
            },

            {
                week: 7,
                nutrients: {
                    grow: 4.5,
                    bloom: 5.5,
                    micro: 4.5
                }
            },

            {
                week: 8,
                nutrients: {
                    grow: 2.5,
                    bloom: 4.5,
                    micro: 2.5
                }
            },

            {
                week: "flush",
                label: "Flush",
                nutrients: {
                    grow: 0,
                    bloom: 0,
                    micro: 0
                }
            }

        ]

    }

};