// ============================================================================
// UMWELTSYSTEM - Tag/Nacht, Jahreszeiten, Wetter, Ressourcen
// ============================================================================

class Environment {
    constructor(world) {
        this.world = world;
        
        // Zeit-System
        this.tick = 0;
        this.dayTick = 0;
        this.seasonTick = 0;
        this.year = 1;
        
        // Aktueller Zustand
        this.currentSeason = 'SPRING';
        this.currentWeather = 'CLEAR';
        this.weatherDuration = 0;
        this.temperature = 12;
        this.isDaytime = true;
        
        // Ressourcen
        this.berries = [];
        this.stones = [];
        this.woodPiles = [];
        
        this.initializeResources();
    }

    // Initialisiere Ressourcen auf der Karte
    initializeResources() {
        // Beeren-Büsche
        for (let i = 0; i < CONFIG.RESOURCES.BERRIES.INITIAL_COUNT; i++) {
            this.spawnBerry();
        }
        
        // Steine
        for (let i = 0; i < CONFIG.RESOURCES.STONE.INITIAL_COUNT; i++) {
            this.spawnStone();
        }
        
        // Holzhaufen
        for (let i = 0; i < CONFIG.RESOURCES.WOOD.INITIAL_COUNT; i++) {
            this.spawnWood();
        }
    }

    // Spawne Beere an zufälliger guter Position
    spawnBerry() {
        let x, y;
        let attempts = 0;
        do {
            x = Utils.random(0, this.world.width);
            y = Utils.random(0, this.world.height);
            attempts++;
        } while (
            attempts < 50 && 
            (this.world.getTerrain(x, y) === CONFIG.TERRAIN.WATER ||
             this.world.getTerrain(x, y) === CONFIG.TERRAIN.MOUNTAIN)
        );
        
        if (attempts < 50) {
            this.berries.push({
                x: x,
                y: y,
                amount: CONFIG.RESOURCES.BERRIES.NUTRITIONAL_VALUE,
                regrowthTimer: 0,
                depleted: false
            });
        }
    }

    // Spawne Stein
    spawnStone() {
        let x, y;
        let attempts = 0;
        do {
            x = Utils.random(0, this.world.width);
            y = Utils.random(0, this.world.height);
            attempts++;
        } while (
            attempts < 50 && 
            (this.world.getTerrain(x, y) === CONFIG.TERRAIN.WATER)
        );
        
        if (attempts < 50) {
            this.stones.push({ x: x, y: y });
        }
    }

    // Spawne Holz
    spawnWood() {
        let x, y;
        let attempts = 0;
        do {
            x = Utils.random(0, this.world.width);
            y = Utils.random(0, this.world.height);
            attempts++;
        } while (
            attempts < 50 && 
            this.world.getTerrain(x, y) !== CONFIG.TERRAIN.FOREST
        );
        
        if (attempts < 50) {
            this.woodPiles.push({ x: x, y: y });
        }
    }

    // Update Umwelt
    update() {
        this.tick++;
        this.dayTick++;
        this.seasonTick++;
        
        // Tag/Nacht-Zyklus
        if (this.dayTick >= CONFIG.ENVIRONMENT.DAY_LENGTH) {
            this.dayTick = 0;
        }
        this.isDaytime = this.dayTick < CONFIG.ENVIRONMENT.DAY_LENGTH / 2;
        
        // Jahreszeiten
        if (this.seasonTick >= CONFIG.ENVIRONMENT.SEASON_LENGTH) {
            this.seasonTick = 0;
            this.advanceSeason();
        }
        
        // Wetter
        this.updateWeather();
        
        // Temperatur
        this.updateTemperature();
        
        // Ressourcen nachwachsen
        this.updateResources();
    }

    // Wechsel Jahreszeit
    advanceSeason() {
        const seasons = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
        const currentIndex = seasons.indexOf(this.currentSeason);
        this.currentSeason = seasons[(currentIndex + 1) % 4];
        
        if (this.currentSeason === 'SPRING') {
            this.year++;
        }
    }

    // Update Wetter
    updateWeather() {
        if (this.weatherDuration > 0) {
            this.weatherDuration--;
            if (this.weatherDuration === 0) {
                this.currentWeather = 'CLEAR';
            }
        } else {
            // Chance für neues Wetter
            if (this.currentSeason === 'WINTER') {
                if (Utils.chance(CONFIG.ENVIRONMENT.WEATHER.SNOW_CHANCE)) {
                    this.currentWeather = 'SNOW';
                    this.weatherDuration = Utils.randomInt(
                        CONFIG.ENVIRONMENT.WEATHER.WEATHER_DURATION.MIN,
                        CONFIG.ENVIRONMENT.WEATHER.WEATHER_DURATION.MAX
                    );
                }
            } else {
                if (Utils.chance(CONFIG.ENVIRONMENT.WEATHER.RAIN_CHANCE)) {
                    this.currentWeather = 'RAIN';
                    this.weatherDuration = Utils.randomInt(
                        CONFIG.ENVIRONMENT.WEATHER.WEATHER_DURATION.MIN,
                        CONFIG.ENVIRONMENT.WEATHER.WEATHER_DURATION.MAX
                    );
                }
            }
        }
    }

    // Update Temperatur
    updateTemperature() {
        // Basis-Temperatur nach Jahreszeit
        const seasonTemp = CONFIG.ENVIRONMENT.TEMPERATURE[this.currentSeason];
        let targetTemp = Utils.random(seasonTemp.MIN, seasonTemp.MAX);
        
        // Tag/Nacht-Variation
        if (!this.isDaytime) {
            targetTemp -= 5;
        }
        
        // Wetter-Einfluss
        if (this.currentWeather === 'RAIN') {
            targetTemp -= 2;
        } else if (this.currentWeather === 'SNOW') {
            targetTemp -= 5;
        }
        
        // Smooth transition
        this.temperature = Utils.lerp(this.temperature, targetTemp, 0.01);
    }

    // Update Ressourcen
    updateResources() {
        // Beeren nachwachsen
        for (const berry of this.berries) {
            if (berry.depleted) {
                berry.regrowthTimer++;
                if (berry.regrowthTimer >= CONFIG.RESOURCES.BERRIES.REGROWTH_TIME) {
                    berry.depleted = false;
                    berry.amount = CONFIG.RESOURCES.BERRIES.NUTRITIONAL_VALUE;
                    berry.regrowthTimer = 0;
                }
            }
        }
        
        // Neue Beeren im Frühling/Sommer
        if (this.currentSeason === 'SPRING' || this.currentSeason === 'SUMMER') {
            if (Utils.chance(CONFIG.ENVIRONMENT.BERRY_REGROWTH_RATE)) {
                if (this.berries.length < CONFIG.RESOURCES.BERRIES.INITIAL_COUNT * 1.5) {
                    this.spawnBerry();
                }
            }
        }
    }

    // Sammle Beeren
    gatherBerries(x, y, range = 2) {
        for (const berry of this.berries) {
            if (!berry.depleted && Utils.distance(x, y, berry.x, berry.y) < range) {
                berry.depleted = true;
                return berry.amount;
            }
        }
        return 0;
    }

    // Sammle Stein
    gatherStone(x, y, range = 2) {
        for (let i = 0; i < this.stones.length; i++) {
            const stone = this.stones[i];
            if (Utils.distance(x, y, stone.x, stone.y) < range) {
                this.stones.splice(i, 1);
                // Spawne neuen Stein irgendwo
                if (Utils.chance(0.5)) {
                    this.spawnStone();
                }
                return true;
            }
        }
        return false;
    }

    // Sammle Holz
    gatherWood(x, y, range = 2) {
        for (let i = 0; i < this.woodPiles.length; i++) {
            const wood = this.woodPiles[i];
            if (Utils.distance(x, y, wood.x, wood.y) < range) {
                this.woodPiles.splice(i, 1);
                // Spawne neues Holz irgendwo
                if (Utils.chance(0.3)) {
                    this.spawnWood();
                }
                return true;
            }
        }
        return false;
    }

    // Finde nächste Beere
    findNearestBerry(x, y, maxDistance = 50) {
        let nearest = null;
        let minDist = maxDistance;
        
        for (const berry of this.berries) {
            if (!berry.depleted) {
                const dist = Utils.distance(x, y, berry.x, berry.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = berry;
                }
            }
        }
        
        return nearest;
    }

    // Finde nächste Wasserquelle
    findNearestWater(x, y, maxDistance = 50) {
        let nearestDist = maxDistance;
        let nearestPos = null;
        
        // Sample Punkte in der Umgebung
        const samples = 32;
        for (let i = 0; i < samples; i++) {
            const angle = (i / samples) * Math.PI * 2;
            const dist = maxDistance;
            const testX = x + Math.cos(angle) * dist;
            const testY = y + Math.sin(angle) * dist;
            
            // Suche entlang der Linie
            for (let d = 0; d < dist; d += 2) {
                const checkX = x + Math.cos(angle) * d;
                const checkY = y + Math.sin(angle) * d;
                
                if (this.world.hasWater(checkX, checkY)) {
                    const actualDist = Utils.distance(x, y, checkX, checkY);
                    if (actualDist < nearestDist) {
                        nearestDist = actualDist;
                        nearestPos = { x: checkX, y: checkY };
                    }
                    break;
                }
            }
        }
        
        return nearestPos;
    }

    // Finde nächste Höhle
    findNearestCave(x, y, maxDistance = 50) {
        let nearestDist = maxDistance;
        let nearestPos = null;
        
        const samples = 16;
        for (let i = 0; i < samples; i++) {
            const angle = (i / samples) * Math.PI * 2;
            const dist = maxDistance;
            const testX = x + Math.cos(angle) * dist;
            const testY = y + Math.sin(angle) * dist;
            
            for (let d = 0; d < dist; d += 3) {
                const checkX = x + Math.cos(angle) * d;
                const checkY = y + Math.sin(angle) * d;
                
                if (this.world.isCave(checkX, checkY)) {
                    const actualDist = Utils.distance(x, y, checkX, checkY);
                    if (actualDist < nearestDist) {
                        nearestDist = actualDist;
                        nearestPos = { x: checkX, y: checkY };
                    }
                    break;
                }
            }
        }
        
        return nearestPos;
    }

    // Get Info für UI
    getSeasonName() {
        const names = {
            'SPRING': 'Frühling',
            'SUMMER': 'Sommer',
            'AUTUMN': 'Herbst',
            'WINTER': 'Winter'
        };
        return names[this.currentSeason] || this.currentSeason;
    }

    getWeatherName() {
        const names = {
            'CLEAR': 'Klar',
            'RAIN': 'Regen',
            'SNOW': 'Schnee'
        };
        return names[this.currentWeather] || this.currentWeather;
    }

    getDayNumber() {
        return Math.floor(this.tick / CONFIG.ENVIRONMENT.DAY_LENGTH);
    }

    getTimeOfDay() {
        const progress = this.dayTick / CONFIG.ENVIRONMENT.DAY_LENGTH;
        if (progress < 0.25) return 'Morgen';
        if (progress < 0.5) return 'Mittag';
        if (progress < 0.75) return 'Abend';
        return 'Nacht';
    }

    // Render Effekte (Regen, Schnee)
    renderWeatherEffects(ctx, cellSize) {
        if (this.currentWeather === 'RAIN') {
            this.renderRain(ctx, cellSize);
        } else if (this.currentWeather === 'SNOW') {
            this.renderSnow(ctx, cellSize);
        }
    }

    renderRain(ctx, cellSize) {
        ctx.strokeStyle = 'rgba(150, 150, 200, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = (Math.random() + this.tick * 0.1) % ctx.canvas.height;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 2, y + 10);
            ctx.stroke();
        }
    }

    renderSnow(ctx, cellSize) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() * ctx.canvas.width + this.tick * 0.5) % ctx.canvas.width;
            const y = (Math.random() * ctx.canvas.height + this.tick * 0.3) % ctx.canvas.height;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Exportiere Klasse
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Environment;
}
