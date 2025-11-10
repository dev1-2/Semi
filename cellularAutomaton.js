// ============================================================================
// ZELLULÄRER AUTOMAT - Weltgenerierung im Pleistozän-Stil
// ============================================================================

class CellularAutomaton {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.heightMap = [];
        this.moistureMap = [];
        this.temperatureMap = [];
        
        this.initialize();
    }

    initialize() {
        // Erstelle leere Grids
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            this.heightMap[y] = [];
            this.moistureMap[y] = [];
            this.temperatureMap[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = CONFIG.TERRAIN.GRASS;
                this.heightMap[y][x] = 0;
                this.moistureMap[y][x] = 0;
                this.temperatureMap[y][x] = 0;
            }
        }
    }

    // Generiere realistische Pleistozän-Landschaft
    generateWorld(seed = Math.random() * 10000) {
        console.log('Generiere Pleistozän-Welt mit Seed:', seed);
        
        // 1. Höhenkarte generieren (Berge, Täler)
        this.generateHeightMap(seed);
        
        // 2. Feuchtigkeitskarte (für Flüsse und Vegetation)
        this.generateMoistureMap(seed + 1000);
        
        // 3. Temperaturkarte (Eiszeit-Klima)
        this.generateTemperatureMap(seed + 2000);
        
        // 4. Kombiniere zu Terrain-Typen
        this.generateTerrain();
        
        // 5. Platziere Flüsse
        this.generateRivers();
        
        // 6. Platziere Höhlen
        this.generateCaves();
        
        // 7. Vegetation-Details
        this.addVegetationDetails();
        
        console.log('Weltgenerierung abgeschlossen!');
    }

    // Generiere Höhenkarte mit Perlin-Noise
    generateHeightMap(seed) {
        const scale = 0.05; // Kleinerer Wert = größere Features
        const octaves = 6;
        const persistence = 0.5;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let height = Utils.perlinNoise(
                    x * scale, 
                    y * scale, 
                    octaves, 
                    persistence, 
                    seed
                );
                
                // Normalisiere zu [0, 1]
                this.heightMap[y][x] = (height + 1) / 2;
            }
        }
    }

    // Generiere Feuchtigkeitskarte
    generateMoistureMap(seed) {
        const scale = 0.08;
        const octaves = 4;
        const persistence = 0.4;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let moisture = Utils.perlinNoise(
                    x * scale, 
                    y * scale, 
                    octaves, 
                    persistence, 
                    seed
                );
                
                this.moistureMap[y][x] = (moisture + 1) / 2;
            }
        }
    }

    // Generiere Temperaturkarte (kälter im Norden für Pleistozän)
    generateTemperatureMap(seed) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Gradient von Nord (kalt) nach Süd (wärmer)
                let baseTemp = y / this.height;
                
                // Füge Noise hinzu für Variation
                let noise = Utils.perlinNoise(x * 0.03, y * 0.03, 3, 0.5, seed);
                
                this.temperatureMap[y][x] = Utils.clamp(
                    baseTemp + noise * 0.3, 
                    0, 
                    1
                );
            }
        }
    }

    // Kombiniere Maps zu Terrain-Typen
    generateTerrain() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const height = this.heightMap[y][x];
                const moisture = this.moistureMap[y][x];
                const temp = this.temperatureMap[y][x];
                
                // Wasser (tiefliegende Bereiche)
                if (height < 0.35) {
                    this.grid[y][x] = CONFIG.TERRAIN.WATER;
                }
                // Eis/Schnee (kalt und hoch oder sehr kalt)
                else if (temp < 0.25 || (height > 0.75 && temp < 0.4)) {
                    this.grid[y][x] = height > 0.8 ? CONFIG.TERRAIN.ICE : CONFIG.TERRAIN.SNOW;
                }
                // Berge (hoch)
                else if (height > 0.7) {
                    this.grid[y][x] = CONFIG.TERRAIN.MOUNTAIN;
                }
                // Wald (feucht und mittlere Höhe)
                else if (moisture > 0.55 && height > 0.4 && height < 0.7) {
                    this.grid[y][x] = CONFIG.TERRAIN.FOREST;
                }
                // Sand (trocken und niedrig)
                else if (moisture < 0.35 && height < 0.45) {
                    this.grid[y][x] = CONFIG.TERRAIN.SAND;
                }
                // Grasland/Steppe (Standard)
                else {
                    this.grid[y][x] = CONFIG.TERRAIN.GRASS;
                }
            }
        }
    }

    // Generiere Flüsse (fließen von Bergen zu Wasser)
    generateRivers() {
        const riverCount = Utils.randomInt(3, 6);
        
        for (let i = 0; i < riverCount; i++) {
            // Starte von hohem Punkt
            let x = Utils.randomInt(10, this.width - 10);
            let y = Utils.randomInt(10, this.height - 10);
            
            // Finde höchsten Punkt in der Nähe
            let maxHeight = 0;
            let startX = x, startY = y;
            for (let dy = -5; dy <= 5; dy++) {
                for (let dx = -5; dx <= 5; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (this.isInBounds(nx, ny)) {
                        if (this.heightMap[ny][nx] > maxHeight) {
                            maxHeight = this.heightMap[ny][nx];
                            startX = nx;
                            startY = ny;
                        }
                    }
                }
            }
            
            // Fließe bergab
            this.carveRiver(startX, startY);
        }
    }

    // Schnitze Fluss in Terrain
    carveRiver(startX, startY) {
        let x = startX;
        let y = startY;
        const maxSteps = 200;
        let steps = 0;
        
        while (steps < maxSteps) {
            if (!this.isInBounds(x, y)) break;
            
            const currentHeight = this.heightMap[y][x];
            
            // Stoppe bei Wasser
            if (this.grid[y][x] === CONFIG.TERRAIN.WATER) break;
            
            // Setze Wasser
            this.grid[y][x] = CONFIG.TERRAIN.WATER;
            
            // Finde niedrigsten Nachbarn
            let lowestHeight = currentHeight;
            let nextX = x;
            let nextY = y;
            
            const directions = Utils.getDirections();
            for (const dir of directions) {
                const nx = x + dir.dx;
                const ny = y + dir.dy;
                
                if (this.isInBounds(nx, ny)) {
                    const neighborHeight = this.heightMap[ny][nx];
                    if (neighborHeight < lowestHeight) {
                        lowestHeight = neighborHeight;
                        nextX = nx;
                        nextY = ny;
                    }
                }
            }
            
            // Keine niedrigeren Nachbarn gefunden
            if (nextX === x && nextY === y) break;
            
            x = nextX;
            y = nextY;
            steps++;
        }
    }

    // Generiere Höhlen in Bergen
    generateCaves() {
        const caveCount = Utils.randomInt(8, 15);
        
        for (let i = 0; i < caveCount; i++) {
            // Finde Bergposition
            let x, y;
            let attempts = 0;
            do {
                x = Utils.randomInt(0, this.width);
                y = Utils.randomInt(0, this.height);
                attempts++;
            } while (
                attempts < 100 && 
                (this.grid[y][x] !== CONFIG.TERRAIN.MOUNTAIN && 
                 this.heightMap[y][x] < 0.6)
            );
            
            if (attempts < 100) {
                // Platziere Höhle
                const caveSize = Utils.randomInt(2, 5);
                this.carveCave(x, y, caveSize);
            }
        }
    }

    // Schnitze Höhle
    carveCave(centerX, centerY, size) {
        for (let dy = -size; dy <= size; dy++) {
            for (let dx = -size; dx <= size; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= size) {
                    const x = centerX + dx;
                    const y = centerY + dy;
                    if (this.isInBounds(x, y)) {
                        this.grid[y][x] = CONFIG.TERRAIN.CAVE;
                    }
                }
            }
        }
    }

    // Füge Vegetations-Details hinzu
    addVegetationDetails() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const terrain = this.grid[y][x];
                const moisture = this.moistureMap[y][x];
                
                // Füge mehr Wald in feuchten Bereichen hinzu
                if (terrain === CONFIG.TERRAIN.GRASS && moisture > 0.65 && Utils.chance(0.3)) {
                    this.grid[y][x] = CONFIG.TERRAIN.FOREST;
                }
            }
        }
    }

    // Prüfe ob Koordinaten in Bounds sind
    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    // Get Terrain an Position
    getTerrain(x, y) {
        const gx = Math.floor(x);
        const gy = Math.floor(y);
        if (!this.isInBounds(gx, gy)) return CONFIG.TERRAIN.MOUNTAIN;
        return this.grid[gy][gx];
    }

    // Prüfe ob Position begehbar ist
    isWalkable(x, y) {
        const terrain = this.getTerrain(x, y);
        return terrain !== CONFIG.TERRAIN.WATER && 
               terrain !== CONFIG.TERRAIN.MOUNTAIN &&
               terrain !== CONFIG.TERRAIN.ICE;
    }

    // Prüfe ob Position Wasser hat (zum Trinken)
    hasWater(x, y) {
        const terrain = this.getTerrain(x, y);
        return terrain === CONFIG.TERRAIN.WATER;
    }

    // Prüfe ob Position Höhle ist (Schutz)
    isCave(x, y) {
        const terrain = this.getTerrain(x, y);
        return terrain === CONFIG.TERRAIN.CAVE;
    }

    // Prüfe ob Position Wald ist (Ressourcen)
    isForest(x, y) {
        const terrain = this.getTerrain(x, y);
        return terrain === CONFIG.TERRAIN.FOREST;
    }

    // Get Farbe für Terrain
    getTerrainColor(terrain, x, y) {
        // Füge Variation hinzu
        const variation = Utils.noise(x, y) * 0.1 - 0.05;
        
        switch (terrain) {
            case CONFIG.TERRAIN.WATER:
                return this.varyColor(CONFIG.COLORS.WATER, variation);
            case CONFIG.TERRAIN.SAND:
                return this.varyColor(CONFIG.COLORS.SAND, variation);
            case CONFIG.TERRAIN.GRASS:
                return this.varyColor(CONFIG.COLORS.GRASS, variation);
            case CONFIG.TERRAIN.FOREST:
                return this.varyColor(CONFIG.COLORS.FOREST, variation);
            case CONFIG.TERRAIN.MOUNTAIN:
                return this.varyColor(CONFIG.COLORS.MOUNTAIN, variation);
            case CONFIG.TERRAIN.CAVE:
                return CONFIG.COLORS.CAVE;
            case CONFIG.TERRAIN.SNOW:
                return this.varyColor(CONFIG.COLORS.SNOW, variation);
            case CONFIG.TERRAIN.ICE:
                return this.varyColor(CONFIG.COLORS.ICE, variation);
            default:
                return CONFIG.COLORS.GRASS;
        }
    }

    // Variiere Farbe leicht
    varyColor(baseColor, variation) {
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        
        const adjust = Math.floor(variation * 30);
        const newR = Utils.clamp(r + adjust, 0, 255);
        const newG = Utils.clamp(g + adjust, 0, 255);
        const newB = Utils.clamp(b + adjust, 0, 255);
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
}

// Exportiere Klasse
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CellularAutomaton;
}
