// ============================================================================
// TIER-SYSTEM - Realistische Pleistozän-Fauna
// ============================================================================

class Animal {
    constructor(type, x, y) {
        this.id = Utils.generateId();
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        
        // Eigenschaften basierend auf Typ
        const config = CONFIG.ANIMALS[type];
        this.size = config.SIZE;
        this.speed = config.SPEED;
        this.maxHealth = config.HEALTH;
        this.health = config.HEALTH;
        this.meatAmount = config.MEAT_AMOUNT;
        this.dangerLevel = config.DANGER_LEVEL;
        this.reproductionRate = config.REPRODUCTION_RATE;
        
        // Zustand
        this.age = 0;
        this.isDead = false;
        this.hunger = 50;
        this.fear = 0;
        
        // Verhalten
        this.behaviorState = 'IDLE';
        this.behaviorTimer = 0;
        this.targetX = x;
        this.targetY = y;
        this.fleeFromX = null;
        this.fleeFromY = null;
        
        // Spezielle Eigenschaften für Raubtiere
        this.huntRange = config.HUNT_RANGE || 15;
        this.preyTarget = null;
    }

    // Update Tier
    update(world, environment, allAnimals, neanderthals) {
        if (this.isDead) return;
        
        this.age++;
        this.behaviorTimer++;
        
        // Hunger steigt
        this.hunger = Math.min(100, this.hunger + 0.02);
        
        // Fear nimmt ab
        this.fear = Math.max(0, this.fear - 0.5);
        
        // Verhaltensentscheidung
        this.decideBehavior(world, environment, allAnimals, neanderthals);
        
        // Bewege Tier
        this.move(world);
        
        // Fressen (Pflanzenfresser)
        if (this.behaviorState === 'GRAZING') {
            this.hunger = Math.max(0, this.hunger - 0.5);
        }
        
        // Jagen (Raubtiere)
        if (this.behaviorState === 'HUNTING' && this.preyTarget) {
            this.huntPrey(allAnimals, neanderthals);
        }
        
        // Fortpflanzung
        if (Utils.chance(this.reproductionRate)) {
            this.attemptReproduction(allAnimals);
        }
        
        // Tod durch Hunger
        if (this.hunger >= 100) {
            this.health -= 0.1;
        }
        
        if (this.health <= 0) {
            this.isDead = true;
        }
    }

    // Entscheide Verhalten
    decideBehavior(world, environment, allAnimals, neanderthals) {
        // Flucht vor Gefahr (höchste Priorität)
        if (this.fear > 50 && this.dangerLevel < 5) {
            this.behaviorState = 'FLEEING';
            return;
        }
        
        // Raubtier-Verhalten
        if (this.dangerLevel >= 7) {
            this.decidePredatorBehavior(allAnimals, neanderthals);
            return;
        }
        
        // Beutetier-Verhalten
        if (this.hunger > 60) {
            this.behaviorState = 'GRAZING';
            if (this.behaviorTimer > 50) {
                this.wander(world);
            }
        } else if (this.behaviorTimer > 100) {
            this.wander(world);
        }
    }

    // Raubtier-Verhalten
    decidePredatorBehavior(allAnimals, neanderthals) {
        if (this.hunger > 70) {
            // Suche Beute
            this.preyTarget = this.findPrey(allAnimals, neanderthals);
            if (this.preyTarget) {
                this.behaviorState = 'HUNTING';
                this.targetX = this.preyTarget.x;
                this.targetY = this.preyTarget.y;
            } else {
                this.wander(null);
            }
        } else {
            this.behaviorState = 'IDLE';
            if (this.behaviorTimer > 150) {
                this.wander(null);
            }
        }
    }

    // Finde Beute
    findPrey(allAnimals, neanderthals) {
        let nearest = null;
        let minDist = this.huntRange;
        
        // Suche schwächere Tiere
        for (const animal of allAnimals) {
            if (animal.isDead || animal === this) continue;
            if (animal.dangerLevel >= this.dangerLevel) continue;
            
            const dist = Utils.distance(this.x, this.y, animal.x, animal.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = animal;
            }
        }
        
        // Höhlenlöwen könnten auch Neanderthaler jagen (selten)
        if (this.type === 'CAVE_LION' && Utils.chance(0.3)) {
            for (const human of neanderthals) {
                if (human.isDead) continue;
                
                const dist = Utils.distance(this.x, this.y, human.x, human.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = human;
                }
            }
        }
        
        return nearest;
    }

    // Jage Beute
    huntPrey(allAnimals, neanderthals) {
        if (!this.preyTarget || this.preyTarget.isDead) {
            this.preyTarget = null;
            this.behaviorState = 'IDLE';
            return;
        }
        
        this.targetX = this.preyTarget.x;
        this.targetY = this.preyTarget.y;
        
        const dist = Utils.distance(this.x, this.y, this.preyTarget.x, this.preyTarget.y);
        
        // Angriff wenn nah genug
        if (dist < 2) {
            this.attack(this.preyTarget);
        }
    }

    // Angriff
    attack(target) {
        const damage = this.dangerLevel * Utils.random(0.5, 1.5);
        target.health -= damage;
        
        if (target.health <= 0) {
            target.isDead = true;
            // Fressen
            this.hunger = Math.max(0, this.hunger - 30);
            this.preyTarget = null;
            this.behaviorState = 'IDLE';
        }
    }

    // Wandere zufällig
    wander(world) {
        this.behaviorTimer = 0;
        this.behaviorState = 'WANDERING';
        
        // Neues Ziel
        this.targetX = this.x + Utils.random(-20, 20);
        this.targetY = this.y + Utils.random(-20, 20);
        
        if (world) {
            // Halte in Grenzen
            this.targetX = Utils.clamp(this.targetX, 0, world.width);
            this.targetY = Utils.clamp(this.targetY, 0, world.height);
        }
    }

    // Bewegung
    move(world) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 1) {
            // Normalisiere Richtung
            const dirX = dx / dist;
            const dirY = dy / dist;
            
            // Geschwindigkeitsmodifikator
            let speedMod = 1.0;
            if (this.behaviorState === 'FLEEING') {
                speedMod = 1.5;
            } else if (this.behaviorState === 'HUNTING') {
                speedMod = 1.3;
            }
            
            // Bewege
            this.vx = dirX * this.speed * speedMod;
            this.vy = dirY * this.speed * speedMod;
            
            this.x += this.vx;
            this.y += this.vy;
            
            // Prüfe ob Position valid
            if (world && !world.isWalkable(this.x, this.y)) {
                // Zurücksetzen
                this.x -= this.vx;
                this.y -= this.vy;
                this.wander(world);
            }
        } else {
            this.vx = 0;
            this.vy = 0;
            if (this.behaviorState === 'WANDERING') {
                this.behaviorState = 'IDLE';
            }
        }
    }

    // Fortpflanzung
    attemptReproduction(allAnimals) {
        if (this.age < 500) return; // Zu jung
        
        // Finde Partner in der Nähe
        for (const other of allAnimals) {
            if (other.type === this.type && other !== this && !other.isDead) {
                const dist = Utils.distance(this.x, this.y, other.x, other.y);
                if (dist < 5 && other.age >= 500) {
                    // Geburt
                    const offspring = this.reproduce();
                    allAnimals.push(offspring);
                    return;
                }
            }
        }
    }

    // Erzeuge Nachkommen
    reproduce() {
        const offsetX = Utils.random(-2, 2);
        const offsetY = Utils.random(-2, 2);
        return new Animal(this.type, this.x + offsetX, this.y + offsetY);
    }

    // Fliehe von Position
    fleeFrom(fromX, fromY) {
        this.fear = 100;
        this.behaviorState = 'FLEEING';
        
        // Fliehe in entgegengesetzte Richtung
        const dx = this.x - fromX;
        const dy = this.y - fromY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.targetX = this.x + (dx / dist) * 30;
            this.targetY = this.y + (dy / dist) * 30;
        }
    }

    // Render Tier
    render(ctx, cellSize) {
        if (this.isDead) return;
        
        const screenX = this.x * cellSize;
        const screenY = this.y * cellSize;
        const radius = this.size * cellSize;
        
        // Körper
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Kontur
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Richtungs-Indikator
        if (this.vx !== 0 || this.vy !== 0) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX + this.vx * 3, screenY + this.vy * 3);
            ctx.stroke();
        }
        
        // Gesundheitsbalken (nur wenn verletzt)
        if (this.health < this.maxHealth) {
            const barWidth = radius * 2;
            const barHeight = 3;
            const barX = screenX - barWidth / 2;
            const barY = screenY - radius - 5;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
    }

    // Get Farbe basierend auf Typ
    getColor() {
        const colorMap = {
            'MAMMOTH': CONFIG.COLORS.MAMMOTH,
            'RHINO': CONFIG.COLORS.RHINO,
            'CAVE_LION': CONFIG.COLORS.CAVE_LION,
            'CAVE_BEAR': CONFIG.COLORS.CAVE_BEAR,
            'DEER': CONFIG.COLORS.DEER,
            'REINDEER': CONFIG.COLORS.REINDEER,
            'RABBIT': CONFIG.COLORS.RABBIT,
            'FISH': CONFIG.COLORS.FISH,
            'BIRD': CONFIG.COLORS.BIRD,
        };
        return colorMap[this.type] || '#888888';
    }

    // Get Name (für UI)
    getName() {
        const names = {
            'MAMMOTH': 'Mammut',
            'RHINO': 'Wollnashorn',
            'CAVE_LION': 'Höhlenlöwe',
            'CAVE_BEAR': 'Höhlenbär',
            'DEER': 'Hirsch',
            'REINDEER': 'Rentier',
            'RABBIT': 'Hase',
            'FISH': 'Fisch',
            'BIRD': 'Vogel',
        };
        return names[this.type] || this.type;
    }
}

// ============================================================================
// ANIMAL MANAGER - Verwaltet alle Tiere
// ============================================================================

class AnimalManager {
    constructor(world, environment) {
        this.world = world;
        this.environment = environment;
        this.animals = [];
        
        this.initializeAnimals();
    }

    // Initialisiere Tiere
    initializeAnimals() {
        const counts = CONFIG.ANIMALS.INITIAL_COUNTS;
        
        for (const [type, count] of Object.entries(counts)) {
            for (let i = 0; i < count; i++) {
                this.spawnAnimal(type);
            }
        }
        
        console.log(`${this.animals.length} Tiere gespawnt`);
    }

    // Spawne Tier an passender Position
    spawnAnimal(type) {
        let x, y;
        let attempts = 0;
        
        do {
            x = Utils.random(5, this.world.width - 5);
            y = Utils.random(5, this.world.height - 5);
            attempts++;
        } while (
            attempts < 100 &&
            !this.world.isWalkable(x, y)
        );
        
        if (attempts < 100) {
            const animal = new Animal(type, x, y);
            this.animals.push(animal);
        }
    }

    // Update alle Tiere
    update(neanderthals) {
        // Update
        for (const animal of this.animals) {
            animal.update(this.world, this.environment, this.animals, neanderthals);
        }
        
        // Entferne tote Tiere (nach einiger Zeit)
        this.animals = this.animals.filter(animal => {
            if (animal.isDead) {
                animal.age++;
                return animal.age < 100; // Körper bleiben kurz liegen
            }
            return true;
        });
        
        // Spawne neue Tiere wenn Population zu niedrig
        this.maintainPopulation();
    }

    // Halte Populationen aufrecht
    maintainPopulation() {
        const counts = {};
        for (const animal of this.animals) {
            if (!animal.isDead) {
                counts[animal.type] = (counts[animal.type] || 0) + 1;
            }
        }
        
        const targetCounts = CONFIG.ANIMALS.INITIAL_COUNTS;
        for (const [type, target] of Object.entries(targetCounts)) {
            const current = counts[type] || 0;
            if (current < target * 0.5 && Utils.chance(0.01)) {
                this.spawnAnimal(type);
            }
        }
    }

    // Render alle Tiere
    render(ctx, cellSize) {
        for (const animal of this.animals) {
            animal.render(ctx, cellSize);
        }
    }

    // Finde Tier an Position (für Jagd)
    findAnimalAt(x, y, radius = 3) {
        for (const animal of this.animals) {
            if (!animal.isDead) {
                const dist = Utils.distance(x, y, animal.x, animal.y);
                if (dist < radius) {
                    return animal;
                }
            }
        }
        return null;
    }

    // Get lebende Tiere nach Typ
    getAnimalsByType(type) {
        return this.animals.filter(a => a.type === type && !a.isDead);
    }

    // Get Anzahl lebende Tiere
    getAliveCount() {
        return this.animals.filter(a => !a.isDead).length;
    }
}

// Exportiere Klassen
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Animal, AnimalManager };
}
