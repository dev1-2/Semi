// ============================================================================
// HAUPT-SIMULATION - Orchestriert alle Systeme
// ============================================================================

class Simulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Simulationsstatus
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 1;
        this.generation = 1;
        
        // Welt & Umwelt
        this.world = new CellularAutomaton(CONFIG.WORLD.WIDTH, CONFIG.WORLD.HEIGHT);
        this.environment = new Environment(this.world);
        
        // Tiere
        this.animalManager = new AnimalManager(this.world, this.environment);
        
        // Neanderthaler
        this.neanderthals = [];
        this.deadNeanderthals = 0;
        this.totalBorn = 0;
        
        // Evolution
        this.geneticAlgorithm = new GeneticAlgorithm(
            CONFIG.EVOLUTION.GENERATION_SIZE,
            CONFIG.EVOLUTION.ELITE_COUNT,
            CONFIG.EVOLUTION.TOURNAMENT_SIZE
        );
        
        // Rendering
        this.cellSize = CONFIG.WORLD.CELL_SIZE;
        this.cameraX = 0;
        this.cameraY = 0;
        
        // Auswahl
        this.selectedAgent = null;
        
        // Statistiken
        this.stats = {
            fps: 0,
            frameTime: 0,
            lastFrameTime: Date.now(),
        };
        
        // Initialisierung
        this.initialize();
    }

    initialize() {
        console.log('=== Initialisiere Simulation ===');
        
        // Generiere Welt
        this.world.generateWorld(Date.now());
        
        // Initialisiere Umwelt
        this.environment = new Environment(this.world);
        
        // Initialisiere Tiere
        this.animalManager = new AnimalManager(this.world, this.environment);
        
        // Spawne initiale Neanderthaler
        this.spawnInitialNeanderthals();
        
        console.log(`Simulation bereit: ${this.neanderthals.length} Neanderthaler, ${this.animalManager.getAliveCount()} Tiere`);
    }

    spawnInitialNeanderthals() {
        this.neanderthals = [];
        this.deadNeanderthals = 0;
        this.totalBorn = CONFIG.NEANDERTHAL.INITIAL_COUNT;
        
        for (let i = 0; i < CONFIG.NEANDERTHAL.INITIAL_COUNT; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = Utils.random(20, CONFIG.WORLD.WIDTH - 20);
                y = Utils.random(20, CONFIG.WORLD.HEIGHT - 20);
                attempts++;
            } while (attempts < 100 && !this.world.isWalkable(x, y));
            
            const neanderthal = new Neanderthal(x, y);
            neanderthal.generation = this.generation;
            this.neanderthals.push(neanderthal);
        }
    }

    // Hauptupdate-Schleife
    update() {
        if (!this.isRunning || this.isPaused) return;
        
        // Update mehrfach basierend auf Geschwindigkeit
        for (let i = 0; i < this.speed; i++) {
            this.updateOnce();
        }
    }

    updateOnce() {
        // Update Umwelt
        this.environment.update();
        
        // Update Tiere
        this.animalManager.update(this.neanderthals);
        
        // Update Neanderthaler
        const livingNeanderthals = this.neanderthals.filter(n => !n.isDead);
        for (const neanderthal of livingNeanderthals) {
            neanderthal.update(
                this.world,
                this.environment,
                this.animalManager,
                this.neanderthals
            );
        }
        
        // Zähle Tote
        const nowDead = this.neanderthals.filter(n => n.isDead).length;
        this.deadNeanderthals = nowDead;
        
        // Neue Generation wenn alle tot
        if (livingNeanderthals.length === 0) {
            this.evolveNewGeneration();
        }
        
        // FPS Berechnung
        const now = Date.now();
        this.stats.frameTime = now - this.stats.lastFrameTime;
        this.stats.fps = 1000 / this.stats.frameTime;
        this.stats.lastFrameTime = now;
    }

    // Evolution - Neue Generation
    evolveNewGeneration() {
        console.log(`=== Generation ${this.generation} beendet ===`);
        
        // Statistiken
        const avgFitness = GeneticAlgorithm.getAverageFitness(this.neanderthals);
        const bestFitness = GeneticAlgorithm.getBestFitness(this.neanderthals);
        console.log(`Durchschnittliche Fitness: ${avgFitness.toFixed(2)}`);
        console.log(`Beste Fitness: ${bestFitness.toFixed(2)}`);
        
        // Neue Generation durch Evolution
        this.neanderthals = this.geneticAlgorithm.evolve(this.neanderthals);
        
        // Reset Positionen
        for (const n of this.neanderthals) {
            let x, y;
            let attempts = 0;
            do {
                x = Utils.random(20, CONFIG.WORLD.WIDTH - 20);
                y = Utils.random(20, CONFIG.WORLD.HEIGHT - 20);
                attempts++;
            } while (attempts < 100 && !this.world.isWalkable(x, y));
            
            n.x = x;
            n.y = y;
            n.generation = this.generation + 1;
        }
        
        this.generation++;
        this.deadNeanderthals = 0;
        this.totalBorn = this.neanderthals.length;
        
        console.log(`=== Generation ${this.generation} startet ===`);
    }

    // Render alles
    render() {
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render Welt
        this.renderWorld();
        
        // Render Ressourcen
        this.renderResources();
        
        // Render Tiere
        this.animalManager.render(this.ctx, this.cellSize);
        
        // Render Neanderthaler
        for (const neanderthal of this.neanderthals) {
            neanderthal.render(this.ctx, this.cellSize);
        }
        
        // Render Wetter-Effekte
        if (CONFIG.RENDER.PARTICLE_EFFECTS) {
            this.environment.renderWeatherEffects(this.ctx, this.cellSize);
        }
        
        // Render Selection
        if (this.selectedAgent) {
            this.renderSelection();
        }
        
        // Render Overlay-Info
        this.renderOverlay();
    }

    renderWorld() {
        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                const terrain = this.world.grid[y][x];
                const color = this.world.getTerrainColor(terrain, x, y);
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
            }
        }
    }

    renderResources() {
        // Beeren
        this.ctx.fillStyle = CONFIG.COLORS.BERRIES;
        for (const berry of this.environment.berries) {
            if (!berry.depleted) {
                this.ctx.beginPath();
                this.ctx.arc(
                    berry.x * this.cellSize,
                    berry.y * this.cellSize,
                    this.cellSize * 0.5,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        }
        
        // Steine (grau)
        this.ctx.fillStyle = '#888';
        for (const stone of this.environment.stones) {
            this.ctx.fillRect(
                stone.x * this.cellSize - 2,
                stone.y * this.cellSize - 2,
                4,
                4
            );
        }
        
        // Holz (braun)
        this.ctx.fillStyle = '#654321';
        for (const wood of this.environment.woodPiles) {
            this.ctx.fillRect(
                wood.x * this.cellSize - 2,
                wood.y * this.cellSize - 2,
                5,
                3
            );
        }
    }

    renderSelection() {
        if (!this.selectedAgent || this.selectedAgent.isDead) return;
        
        const x = this.selectedAgent.x * this.cellSize;
        const y = this.selectedAgent.y * this.cellSize;
        const radius = this.cellSize * 1.5;
        
        // Pulsierender Ring
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        this.ctx.strokeStyle = `rgba(255, 255, 0, ${pulse})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    renderOverlay() {
        // Tag/Nacht-Overlay
        if (!this.environment.isDaytime) {
            const nightAlpha = 0.4;
            this.ctx.fillStyle = `rgba(0, 0, 30, ${nightAlpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // FPS Counter (oben links)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 100, 30);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`FPS: ${Math.round(this.stats.fps)}`, 20, 30);
    }

    // Starte Simulation
    start() {
        this.isRunning = true;
        this.isPaused = false;
        console.log('Simulation gestartet');
    }

    // Pausiere Simulation
    pause() {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? 'Simulation pausiert' : 'Simulation fortgesetzt');
    }

    // Reset Simulation
    reset() {
        console.log('Simulation wird zurückgesetzt...');
        this.generation = 1;
        this.initialize();
        this.selectedAgent = null;
    }

    // Setze Geschwindigkeit
    setSpeed(speed) {
        this.speed = Utils.clamp(speed, 1, 10);
        console.log(`Geschwindigkeit: ${this.speed}x`);
    }

    // Klick auf Canvas
    handleClick(canvasX, canvasY) {
        const worldX = canvasX / this.cellSize;
        const worldY = canvasY / this.cellSize;
        
        // Finde nächsten Neanderthaler
        let nearest = null;
        let minDist = 3;
        
        for (const n of this.neanderthals) {
            if (n.isDead) continue;
            const dist = Utils.distance(worldX, worldY, n.x, n.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = n;
            }
        }
        
        this.selectedAgent = nearest;
        return nearest;
    }

    // Get Statistiken
    getStats() {
        return {
            generation: this.generation,
            alive: this.neanderthals.filter(n => !n.isDead).length,
            dead: this.deadNeanderthals,
            totalBorn: this.totalBorn,
            day: this.environment.getDayNumber(),
            season: this.environment.getSeasonName(),
            temperature: Math.round(this.environment.temperature),
            weather: this.environment.getWeatherName(),
            timeOfDay: this.environment.getTimeOfDay(),
            animals: this.animalManager.getAliveCount(),
            avgFitness: GeneticAlgorithm.getAverageFitness(this.neanderthals.filter(n => !n.isDead)),
            bestFitness: GeneticAlgorithm.getBestFitness(this.neanderthals.filter(n => !n.isDead)),
        };
    }
}

// Exportiere Klasse
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Simulation;
}
