// ============================================================================
// KONFIGURATIONSDATEI - Alle Simulationsparameter
// ============================================================================

const CONFIG = {
    // Weltgröße
    WORLD: {
        WIDTH: 200,
        HEIGHT: 150,
        CELL_SIZE: 6, // Pixel pro Zelle für Rendering
    },

    // Neanderthaler-Einstellungen
    NEANDERTHAL: {
        INITIAL_COUNT: 15,
        
        // Physiologische Parameter
        INITIAL_HEALTH: 100,
        INITIAL_HUNGER: 50,
        INITIAL_THIRST: 50,
        INITIAL_ENERGY: 100,
        INITIAL_TEMPERATURE: 37,
        
        // Verbrauchsraten (pro Tick)
        HUNGER_DECREASE_RATE: 0.05,
        THIRST_DECREASE_RATE: 0.08,
        ENERGY_DECREASE_RATE: 0.03,
        TEMPERATURE_CHANGE_RATE: 0.02,
        
        // Bewegung
        MOVE_SPEED: 1,
        SPRINT_SPEED: 2,
        SPRINT_ENERGY_COST: 0.5,
        MOVE_ENERGY_COST: 0.1,
        
        // Aktionen
        GATHER_BERRIES_AMOUNT: 15,
        GATHER_BERRIES_ENERGY: 2,
        DRINK_WATER_AMOUNT: 20,
        EAT_FOOD_HUNGER_RESTORE: 25,
        HUNT_SUCCESS_SMALL: 0.6, // 60% Erfolgsrate kleine Tiere
        HUNT_SUCCESS_LARGE: 0.2, // 20% Erfolgsrate große Tiere
        HUNT_ENERGY_COST: 10,
        
        // Handwerk
        TOOL_CRAFT_TIME: 100, // Ticks
        FIRE_CRAFT_TIME: 150,
        SHELTER_CRAFT_TIME: 300,
        
        // Soziales
        COMMUNICATION_RANGE: 10,
        MATING_COOLDOWN: 500, // Ticks
        PREGNANCY_DURATION: 1000, // Ticks
        MATURITY_AGE: 2000, // Ticks (ca. 15 Jahre)
        
        // Gesundheit
        INJURY_HEAL_RATE: 0.05,
        DISEASE_SPREAD_CHANCE: 0.01,
        COLD_DAMAGE_THRESHOLD: 32, // °C
        HEAT_DAMAGE_THRESHOLD: 42, // °C
        STARVATION_DAMAGE: 0.5,
        DEHYDRATION_DAMAGE: 0.8,
        
        // Lebensdauer
        MAX_AGE: 15000, // Ticks (ca. 40 Jahre)
        
        // Sichtweite
        VISION_RANGE: 15,
        VISION_DIRECTIONS: 8, // N, NE, E, SE, S, SW, W, NW
    },

    // Neuronales Netz
    NEURAL_NETWORK: {
        INPUT_SIZE: 85, // Wird berechnet
        HIDDEN_LAYERS: [64, 48, 32],
        OUTPUT_SIZE: 28,
        ACTIVATION: 'tanh',
        MUTATION_RATE: 0.1,
        MUTATION_STRENGTH: 0.3,
    },

    // Tiere
    ANIMALS: {
        INITIAL_COUNTS: {
            MAMMOTH: 8,
            RHINO: 5,
            CAVE_LION: 6,
            CAVE_BEAR: 4,
            DEER: 40,
            REINDEER: 35,
            RABBIT: 60,
            FISH: 30,
            BIRD: 12,
        },
        
        // Mammut
        MAMMOTH: {
            SIZE: 3,
            SPEED: 0.5,
            HEALTH: 200,
            MEAT_AMOUNT: 150,
            DANGER_LEVEL: 5,
            REPRODUCTION_RATE: 0.001,
        },
        
        // Wollnashorn
        RHINO: {
            SIZE: 3,
            SPEED: 0.7,
            HEALTH: 180,
            MEAT_AMOUNT: 120,
            DANGER_LEVEL: 7,
            REPRODUCTION_RATE: 0.002,
        },
        
        // Höhlenlöwe
        CAVE_LION: {
            SIZE: 2,
            SPEED: 1.5,
            HEALTH: 100,
            MEAT_AMOUNT: 40,
            DANGER_LEVEL: 9,
            REPRODUCTION_RATE: 0.003,
            HUNT_RANGE: 20,
        },
        
        // Höhlenbär
        CAVE_BEAR: {
            SIZE: 2,
            SPEED: 1.0,
            HEALTH: 120,
            MEAT_AMOUNT: 50,
            DANGER_LEVEL: 8,
            REPRODUCTION_RATE: 0.003,
        },
        
        // Hirsch
        DEER: {
            SIZE: 1,
            SPEED: 1.2,
            HEALTH: 50,
            MEAT_AMOUNT: 30,
            DANGER_LEVEL: 0,
            REPRODUCTION_RATE: 0.01,
        },
        
        // Rentier
        REINDEER: {
            SIZE: 1,
            SPEED: 1.3,
            HEALTH: 45,
            MEAT_AMOUNT: 28,
            DANGER_LEVEL: 0,
            REPRODUCTION_RATE: 0.012,
        },
        
        // Hase
        RABBIT: {
            SIZE: 0.5,
            SPEED: 1.8,
            HEALTH: 15,
            MEAT_AMOUNT: 8,
            DANGER_LEVEL: 0,
            REPRODUCTION_RATE: 0.03,
        },
        
        // Fisch
        FISH: {
            SIZE: 0.3,
            SPEED: 1.0,
            HEALTH: 5,
            MEAT_AMOUNT: 5,
            DANGER_LEVEL: 0,
            REPRODUCTION_RATE: 0.05,
        },
        
        // Vogel
        BIRD: {
            SIZE: 0.4,
            SPEED: 2.0,
            HEALTH: 8,
            MEAT_AMOUNT: 4,
            DANGER_LEVEL: 0,
            REPRODUCTION_RATE: 0.02,
        },
    },

    // Umwelt
    ENVIRONMENT: {
        // Jahreszeiten (Ticks pro Jahreszeit)
        SEASON_LENGTH: 2000,
        
        // Temperaturbereich pro Jahreszeit (Pleistozän = kälter)
        TEMPERATURE: {
            SPRING: { MIN: 5, MAX: 15 },
            SUMMER: { MIN: 12, MAX: 22 },
            AUTUMN: { MIN: 3, MAX: 12 },
            WINTER: { MIN: -15, MAX: 5 },
        },
        
        // Tag/Nacht-Zyklus
        DAY_LENGTH: 200, // Ticks
        
        // Wetter
        WEATHER: {
            RAIN_CHANCE: 0.002,
            SNOW_CHANCE: 0.003,
            WEATHER_DURATION: { MIN: 100, MAX: 400 },
        },
        
        // Vegetation
        BERRY_REGROWTH_RATE: 0.01,
        TREE_GROWTH_RATE: 0.001,
        GRASS_SPREAD_RATE: 0.05,
    },

    // Zellulärer Automat - Terrain-Typen
    TERRAIN: {
        WATER: 0,
        SAND: 1,
        GRASS: 2,
        FOREST: 3,
        MOUNTAIN: 4,
        CAVE: 5,
        SNOW: 6,
        ICE: 7,
    },

    // Ressourcen
    RESOURCES: {
        BERRIES: {
            INITIAL_COUNT: 150,
            NUTRITIONAL_VALUE: 15,
            REGROWTH_TIME: 500,
        },
        WOOD: {
            INITIAL_COUNT: 200,
        },
        STONE: {
            INITIAL_COUNT: 180,
        },
    },

    // Rendering
    RENDER: {
        FPS: 30,
        SHOW_VISION: false,
        SHOW_PATHS: false,
        PARTICLE_EFFECTS: true,
        SHADOWS: true,
    },

    // Evolution & Genetik
    EVOLUTION: {
        GENERATION_SIZE: 15,
        ELITE_COUNT: 3, // Beste Agents überleben automatisch
        TOURNAMENT_SIZE: 5,
        CROSSOVER_RATE: 0.7,
    },

    // Farben für Rendering (RGB)
    COLORS: {
        WATER: '#1e5f8f',
        DEEP_WATER: '#0d3d5f',
        SAND: '#c2b280',
        GRASS: '#6b8e23',
        LIGHT_GRASS: '#90b352',
        FOREST: '#2d5016',
        DENSE_FOREST: '#1a3009',
        MOUNTAIN: '#6b6b6b',
        PEAK: '#a0a0a0',
        CAVE: '#3a3a3a',
        SNOW: '#f0f8ff',
        ICE: '#b0e0e6',
        
        NEANDERTHAL: '#d2691e',
        NEANDERTHAL_CHILD: '#e89968',
        NEANDERTHAL_ELDER: '#8b4513',
        
        MAMMOTH: '#8B4513',
        RHINO: '#696969',
        CAVE_LION: '#FF6347',
        CAVE_BEAR: '#8B4513',
        DEER: '#A0522D',
        REINDEER: '#D2691E',
        RABBIT: '#CD853F',
        FISH: '#4682B4',
        BIRD: '#8B7355',
        
        BERRIES: '#FFD700',
        FIRE: '#FF4500',
        SHELTER: '#8B4513',
        TOOL: '#A9A9A9',
    },
};

// Exportiere Config für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
