// ============================================================================
// NEANDERTHALER-AGENT - KI-gesteuerter Agent mit neuronalen Netzen
// ============================================================================

class Neanderthal {
    constructor(x, y, brain = null) {
        this.id = Utils.generateId();
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        
        // Neuronales Netz
        if (brain) {
            this.brain = brain;
        } else {
            this.brain = new NeuralNetwork(
                CONFIG.NEURAL_NETWORK.INPUT_SIZE,
                CONFIG.NEURAL_NETWORK.HIDDEN_LAYERS,
                CONFIG.NEURAL_NETWORK.OUTPUT_SIZE
            );
        }
        
        // Physiologie
        this.health = CONFIG.NEANDERTHAL.INITIAL_HEALTH;
        this.hunger = CONFIG.NEANDERTHAL.INITIAL_HUNGER;
        this.thirst = CONFIG.NEANDERTHAL.INITIAL_THIRST;
        this.energy = CONFIG.NEANDERTHAL.INITIAL_ENERGY;
        this.bodyTemperature = CONFIG.NEANDERTHAL.INITIAL_TEMPERATURE;
        
        // Zustand
        this.age = 0;
        this.isDead = false;
        this.isMature = false;
        this.gender = Utils.chance(0.5) ? 'MALE' : 'FEMALE';
        
        // Inventar
        this.foodInInventory = 0;
        this.hasTool = false;
        this.hasWeapon = false;
        this.woodCount = 0;
        this.stoneCount = 0;
        
        // Soziales
        this.groupId = null;
        this.matingCooldown = 0;
        this.isPregnant = false;
        this.pregnancyTimer = 0;
        
        // Gesundheit
        this.injuries = 0;
        this.diseaseLevel = 0;
        this.isInShelter = false;
        this.nearFire = false;
        
        // Fitness (für Evolution)
        this.fitness = 0;
        this.survivalTime = 0;
        this.foodGathered = 0;
        this.waterDrunk = 0;
        this.successfulHunts = 0;
        this.toolsCrafted = 0;
        this.childrenBorn = 0;
        
        // Sensorik
        this.vision = [];
        this.lastAction = 'IDLE';
        
        // Generation
        this.generation = 1;
    }

    // Reset Physiologie (für neue Generation)
    resetPhysiology() {
        this.health = CONFIG.NEANDERTHAL.INITIAL_HEALTH;
        this.hunger = CONFIG.NEANDERTHAL.INITIAL_HUNGER;
        this.thirst = CONFIG.NEANDERTHAL.INITIAL_THIRST;
        this.energy = CONFIG.NEANDERTHAL.INITIAL_ENERGY;
        this.bodyTemperature = CONFIG.NEANDERTHAL.INITIAL_TEMPERATURE;
        this.age = 0;
        this.isDead = false;
        this.foodInInventory = 0;
        this.fitness = 0;
    }

    // Hauptupdate-Funktion
    update(world, environment, animals, otherNeanderthals) {
        if (this.isDead) return;
        
        this.age++;
        this.survivalTime++;
        
        // Physiologie-Update
        this.updatePhysiology(environment);
        
        // Sensorik - sammle Informationen
        const inputs = this.gatherSensorInputs(world, environment, animals, otherNeanderthals);
        
        // Neuronales Netz - Entscheidung
        const outputs = this.brain.forward(inputs);
        
        // Führe beste Aktion aus
        this.executeAction(outputs, world, environment, animals, otherNeanderthals);
        
        // Update Fitness
        this.updateFitness();
        
        // Reifetest
        if (!this.isMature && this.age >= CONFIG.NEANDERTHAL.MATURITY_AGE) {
            this.isMature = true;
        }
        
        // Schwangerschaft
        if (this.isPregnant) {
            this.pregnancyTimer++;
            if (this.pregnancyTimer >= CONFIG.NEANDERTHAL.PREGNANCY_DURATION) {
                this.giveBirth(otherNeanderthals);
            }
        }
        
        // Paarungs-Cooldown
        if (this.matingCooldown > 0) {
            this.matingCooldown--;
        }
        
        // Tod durch Alter
        if (this.age >= CONFIG.NEANDERTHAL.MAX_AGE) {
            this.isDead = true;
        }
    }

    // Update Physiologie (Hunger, Durst, etc.)
    updatePhysiology(environment) {
        // Hunger
        this.hunger += CONFIG.NEANDERTHAL.HUNGER_DECREASE_RATE;
        if (this.hunger >= 100) {
            this.health -= CONFIG.NEANDERTHAL.STARVATION_DAMAGE;
        }
        
        // Durst
        this.thirst += CONFIG.NEANDERTHAL.THIRST_DECREASE_RATE;
        if (this.thirst >= 100) {
            this.health -= CONFIG.NEANDERTHAL.DEHYDRATION_DAMAGE;
        }
        
        // Energie
        this.energy -= CONFIG.NEANDERTHAL.ENERGY_DECREASE_RATE;
        if (this.energy <= 0) {
            this.energy = 0;
            this.health -= 0.1; // Erschöpfung
        }
        
        // Körpertemperatur - Umgebungseinfluss
        const targetTemp = 37;
        const envTemp = environment.temperature;
        const tempDiff = envTemp - this.bodyTemperature;
        
        // Temperaturausgleich
        if (this.nearFire) {
            this.bodyTemperature += 0.5;
        } else if (this.isInShelter) {
            this.bodyTemperature += tempDiff * 0.01;
        } else {
            this.bodyTemperature += tempDiff * CONFIG.NEANDERTHAL.TEMPERATURE_CHANGE_RATE;
        }
        
        // Temperatur-Schaden
        if (this.bodyTemperature < CONFIG.NEANDERTHAL.COLD_DAMAGE_THRESHOLD) {
            this.health -= 0.2; // Unterkühlung
        }
        if (this.bodyTemperature > CONFIG.NEANDERTHAL.HEAT_DAMAGE_THRESHOLD) {
            this.health -= 0.3; // Überhitzung
        }
        
        // Verletzungen heilen langsam
        if (this.injuries > 0) {
            this.injuries -= CONFIG.NEANDERTHAL.INJURY_HEAL_RATE;
            if (this.injuries < 0) this.injuries = 0;
        }
        
        // Krankheit
        if (this.diseaseLevel > 0) {
            this.health -= this.diseaseLevel * 0.05;
            this.diseaseLevel -= 0.01;
            if (this.diseaseLevel < 0) this.diseaseLevel = 0;
        }
        
        // Tod
        if (this.health <= 0) {
            this.isDead = true;
        }
        
        // Clamp Werte
        this.hunger = Utils.clamp(this.hunger, 0, 100);
        this.thirst = Utils.clamp(this.thirst, 0, 100);
        this.energy = Utils.clamp(this.energy, 0, 100);
        this.health = Utils.clamp(this.health, 0, 100);
        this.bodyTemperature = Utils.clamp(this.bodyTemperature, 25, 45);
    }

    // Sammle Sensor-Inputs für neuronales Netz
    gatherSensorInputs(world, environment, animals, otherNeanderthals) {
        const inputs = [];
        
        // === VISUELLE WAHRNEHMUNG (8 Richtungen) ===
        const directions = Utils.getDirections();
        const visionRange = CONFIG.NEANDERTHAL.VISION_RANGE;
        
        for (const dir of directions) {
            let closestDist = visionRange;
            let objectType = 0; // 0=nichts, 1=wasser, 2=beeren, 3=tier_klein, 4=tier_groß, 5=gefahr, 6=mensch, 7=höhle
            
            // Schaue in Richtung
            for (let d = 1; d <= visionRange; d++) {
                const checkX = this.x + dir.dx * d;
                const checkY = this.y + dir.dy * d;
                
                // Wasser
                if (objectType === 0 && world.hasWater(checkX, checkY)) {
                    closestDist = d;
                    objectType = 1;
                    break;
                }
                
                // Höhle
                if (objectType === 0 && world.isCave(checkX, checkY)) {
                    closestDist = d;
                    objectType = 7;
                    break;
                }
                
                // Beeren
                for (const berry of environment.berries) {
                    if (!berry.depleted && Utils.distance(checkX, checkY, berry.x, berry.y) < 1) {
                        closestDist = d;
                        objectType = 2;
                        break;
                    }
                }
                
                // Tiere
                for (const animal of animals.animals) {
                    if (!animal.isDead && Utils.distance(checkX, checkY, animal.x, animal.y) < animal.size) {
                        closestDist = d;
                        if (animal.dangerLevel >= 7) {
                            objectType = 5; // Gefahr
                        } else if (animal.size >= 2) {
                            objectType = 4; // Großes Tier
                        } else {
                            objectType = 3; // Kleines Tier
                        }
                        break;
                    }
                }
                
                // Andere Neanderthaler
                for (const other of otherNeanderthals) {
                    if (!other.isDead && other !== this && Utils.distance(checkX, checkY, other.x, other.y) < 1) {
                        closestDist = d;
                        objectType = 6;
                        break;
                    }
                }
                
                if (objectType !== 0) break;
            }
            
            // Inputs: Distanz (normalisiert) und Objekttyp (one-hot encoded = 7 inputs)
            inputs.push(1 - closestDist / visionRange);
            for (let i = 1; i <= 7; i++) {
                inputs.push(objectType === i ? 1 : 0);
            }
        }
        // 8 Richtungen × 8 = 64 Inputs
        
        // === KÖRPERZUSTAND (10 Inputs) ===
        inputs.push(this.hunger / 100);
        inputs.push(this.thirst / 100);
        inputs.push(this.health / 100);
        inputs.push(this.energy / 100);
        inputs.push(Utils.normalize(this.bodyTemperature, 25, 45));
        inputs.push(this.injuries / 10);
        inputs.push(this.diseaseLevel);
        inputs.push(Utils.normalize(this.age, 0, CONFIG.NEANDERTHAL.MAX_AGE));
        inputs.push(this.isMature ? 1 : 0);
        inputs.push(this.gender === 'FEMALE' ? 1 : 0);
        
        // === UMWELT (5 Inputs) ===
        inputs.push(environment.isDaytime ? 1 : 0);
        inputs.push(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'].indexOf(environment.currentSeason) / 3);
        inputs.push(Utils.normalize(environment.temperature, -20, 30));
        inputs.push(environment.currentWeather === 'RAIN' ? 1 : 0);
        inputs.push(environment.currentWeather === 'SNOW' ? 1 : 0);
        
        // === INVENTAR (6 Inputs) ===
        inputs.push(this.foodInInventory / 50);
        inputs.push(this.hasTool ? 1 : 0);
        inputs.push(this.hasWeapon ? 1 : 0);
        inputs.push(this.woodCount / 10);
        inputs.push(this.stoneCount / 10);
        inputs.push(this.isInShelter ? 1 : 0);
        
        // Gesamt: 64 + 10 + 5 + 6 = 85 Inputs
        return inputs;
    }

    // Führe Aktion basierend auf NN-Output aus
    executeAction(outputs, world, environment, animals, otherNeanderthals) {
        // Finde beste Aktion (höchster Output-Wert)
        let bestAction = 0;
        let bestValue = outputs[0];
        for (let i = 1; i < outputs.length; i++) {
            if (outputs[i] > bestValue) {
                bestValue = outputs[i];
                bestAction = i;
            }
        }
        
        // Führe Aktion aus (28 mögliche Aktionen)
        switch (bestAction) {
            case 0: this.idle(); break;
            case 1: this.moveNorth(world); break;
            case 2: this.moveNorthEast(world); break;
            case 3: this.moveEast(world); break;
            case 4: this.moveSouthEast(world); break;
            case 5: this.moveSouth(world); break;
            case 6: this.moveSouthWest(world); break;
            case 7: this.moveWest(world); break;
            case 8: this.moveNorthWest(world); break;
            case 9: this.sprint(world); break;
            case 10: this.gatherBerries(environment); break;
            case 11: this.huntSmallAnimal(animals); break;
            case 12: this.huntLargeAnimal(animals); break;
            case 13: this.eatFood(); break;
            case 14: this.drinkWater(world); break;
            case 15: this.craftTool(environment); break;
            case 16: this.craftWeapon(environment); break;
            case 17: this.makeFire(environment); break;
            case 18: this.buildShelter(environment); break;
            case 19: this.rest(); break;
            case 20: this.sleep(); break;
            case 21: this.seekShelter(world); break;
            case 22: this.seekWarmth(); break;
            case 23: this.communicate(otherNeanderthals); break;
            case 24: this.shareFoodWith(otherNeanderthals); break;
            case 25: this.mate(otherNeanderthals); break;
            case 26: this.gatherWood(environment); break;
            case 27: this.gatherStone(environment); break;
        }
    }

    // ========== BEWEGUNGS-AKTIONEN ==========
    
    moveNorth(world) {
        this.move(0, -1, world, false);
        this.lastAction = 'Bewegung Nord';
    }
    
    moveNorthEast(world) {
        this.move(0.707, -0.707, world, false);
        this.lastAction = 'Bewegung NO';
    }
    
    moveEast(world) {
        this.move(1, 0, world, false);
        this.lastAction = 'Bewegung Ost';
    }
    
    moveSouthEast(world) {
        this.move(0.707, 0.707, world, false);
        this.lastAction = 'Bewegung SO';
    }
    
    moveSouth(world) {
        this.move(0, 1, world, false);
        this.lastAction = 'Bewegung Süd';
    }
    
    moveSouthWest(world) {
        this.move(-0.707, 0.707, world, false);
        this.lastAction = 'Bewegung SW';
    }
    
    moveWest(world) {
        this.move(-1, 0, world, false);
        this.lastAction = 'Bewegung West';
    }
    
    moveNorthWest(world) {
        this.move(-0.707, -0.707, world, false);
        this.lastAction = 'Bewegung NW';
    }
    
    sprint(world) {
        // Sprint in aktuelle Bewegungsrichtung
        if (this.vx !== 0 || this.vy !== 0) {
            const length = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            this.move(this.vx / length, this.vy / length, world, true);
            this.lastAction = 'Sprint';
        }
    }
    
    move(dx, dy, world, isSprint) {
        const speed = isSprint ? CONFIG.NEANDERTHAL.SPRINT_SPEED : CONFIG.NEANDERTHAL.MOVE_SPEED;
        const energyCost = isSprint ? CONFIG.NEANDERTHAL.SPRINT_ENERGY_COST : CONFIG.NEANDERTHAL.MOVE_ENERGY_COST;
        
        const newX = this.x + dx * speed;
        const newY = this.y + dy * speed;
        
        if (world.isWalkable(newX, newY)) {
            this.x = newX;
            this.y = newY;
            this.vx = dx * speed;
            this.vy = dy * speed;
            this.energy -= energyCost;
        }
    }
    
    idle() {
        this.vx = 0;
        this.vy = 0;
        this.lastAction = 'Untätig';
    }

    // ========== NAHRUNGSAKTIONEN ==========
    
    gatherBerries(environment) {
        const amount = environment.gatherBerries(this.x, this.y, 3);
        if (amount > 0) {
            this.foodInInventory += amount;
            this.foodGathered += amount;
            this.energy -= CONFIG.NEANDERTHAL.GATHER_BERRIES_ENERGY;
            this.lastAction = 'Beeren sammeln';
        }
    }
    
    huntSmallAnimal(animals) {
        const prey = animals.findAnimalAt(this.x, this.y, 3);
        if (prey && prey.size < 2) {
            if (Utils.chance(CONFIG.NEANDERTHAL.HUNT_SUCCESS_SMALL)) {
                prey.health -= 50;
                if (prey.health <= 0) {
                    prey.isDead = true;
                    this.foodInInventory += prey.meatAmount;
                    this.successfulHunts++;
                    this.lastAction = 'Jagd erfolgreich (klein)';
                }
            } else {
                // Fehlschlag - Tier flieht
                prey.fleeFrom(this.x, this.y);
                this.lastAction = 'Jagd fehlgeschlagen';
            }
            this.energy -= CONFIG.NEANDERTHAL.HUNT_ENERGY_COST;
        }
    }
    
    huntLargeAnimal(animals) {
        const prey = animals.findAnimalAt(this.x, this.y, 4);
        if (prey && prey.size >= 2) {
            const successRate = this.hasWeapon 
                ? CONFIG.NEANDERTHAL.HUNT_SUCCESS_LARGE * 2 
                : CONFIG.NEANDERTHAL.HUNT_SUCCESS_LARGE;
                
            if (Utils.chance(successRate)) {
                prey.health -= 30;
                if (prey.health <= 0) {
                    prey.isDead = true;
                    this.foodInInventory += prey.meatAmount;
                    this.successfulHunts++;
                    this.lastAction = 'Jagd erfolgreich (groß)';
                }
            } else {
                // Gefährlich - könnte verletzt werden
                if (prey.dangerLevel > 5 && Utils.chance(0.3)) {
                    this.injuries += Utils.random(1, 3);
                    this.health -= prey.dangerLevel;
                }
                prey.fleeFrom(this.x, this.y);
                this.lastAction = 'Jagd fehlgeschlagen';
            }
            this.energy -= CONFIG.NEANDERTHAL.HUNT_ENERGY_COST * 1.5;
        }
    }
    
    eatFood() {
        if (this.foodInInventory > 0) {
            const amount = Math.min(this.foodInInventory, CONFIG.NEANDERTHAL.EAT_FOOD_HUNGER_RESTORE);
            this.hunger -= amount;
            this.foodInInventory -= amount;
            this.lastAction = 'Essen';
        }
    }
    
    drinkWater(world) {
        if (world.hasWater(this.x, this.y)) {
            this.thirst -= CONFIG.NEANDERTHAL.DRINK_WATER_AMOUNT;
            this.waterDrunk += CONFIG.NEANDERTHAL.DRINK_WATER_AMOUNT;
            this.lastAction = 'Trinken';
        }
    }

    // ========== HANDWERKS-AKTIONEN ==========
    
    craftTool(environment) {
        if (this.stoneCount >= 2 && !this.hasTool) {
            this.stoneCount -= 2;
            this.hasTool = true;
            this.toolsCrafted++;
            this.lastAction = 'Werkzeug herstellen';
        }
    }
    
    craftWeapon(environment) {
        if (this.stoneCount >= 1 && this.woodCount >= 2 && !this.hasWeapon) {
            this.stoneCount -= 1;
            this.woodCount -= 2;
            this.hasWeapon = true;
            this.toolsCrafted++;
            this.lastAction = 'Waffe herstellen';
        }
    }
    
    makeFire(environment) {
        if (this.woodCount >= 3 && this.hasTool) {
            this.woodCount -= 3;
            this.nearFire = true;
            this.lastAction = 'Feuer machen';
        }
    }
    
    buildShelter(environment) {
        if (this.woodCount >= 5 && this.hasTool) {
            this.woodCount -= 5;
            this.isInShelter = true;
            this.lastAction = 'Unterkunft bauen';
        }
    }
    
    gatherWood(environment) {
        if (environment.gatherWood(this.x, this.y, 3)) {
            this.woodCount++;
            this.lastAction = 'Holz sammeln';
        }
    }
    
    gatherStone(environment) {
        if (environment.gatherStone(this.x, this.y, 3)) {
            this.stoneCount++;
            this.lastAction = 'Stein sammeln';
        }
    }

    // ========== ÜBERLEBENS-AKTIONEN ==========
    
    rest() {
        this.energy += 5;
        this.lastAction = 'Ausruhen';
    }
    
    sleep() {
        this.energy += 10;
        this.health += 0.5;
        this.lastAction = 'Schlafen';
    }
    
    seekShelter(world) {
        const cave = environment.findNearestCave(this.x, this.y);
        if (cave) {
            const dx = cave.x - this.x;
            const dy = cave.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1) {
                this.move(dx / dist, dy / dist, world, false);
            } else {
                this.isInShelter = true;
            }
            this.lastAction = 'Schutz suchen';
        }
    }
    
    seekWarmth() {
        if (this.nearFire || this.isInShelter) {
            this.bodyTemperature += 1;
        }
        this.lastAction = 'Wärme suchen';
    }

    // ========== SOZIALE AKTIONEN ==========
    
    communicate(otherNeanderthals) {
        // Einfache Kommunikation (könnte später komplexer werden)
        for (const other of otherNeanderthals) {
            if (other !== this && !other.isDead) {
                const dist = Utils.distance(this.x, this.y, other.x, other.y);
                if (dist < CONFIG.NEANDERTHAL.COMMUNICATION_RANGE) {
                    // Informationsaustausch (rudimentär)
                    this.lastAction = 'Kommunizieren';
                    break;
                }
            }
        }
    }
    
    shareFoodWith(otherNeanderthals) {
        if (this.foodInInventory > 10) {
            for (const other of otherNeanderthals) {
                if (other !== this && !other.isDead && other.hunger > 70) {
                    const dist = Utils.distance(this.x, this.y, other.x, other.y);
                    if (dist < 3) {
                        const shareAmount = 5;
                        this.foodInInventory -= shareAmount;
                        other.foodInInventory += shareAmount;
                        this.lastAction = 'Nahrung teilen';
                        break;
                    }
                }
            }
        }
    }
    
    mate(otherNeanderthals) {
        if (!this.isMature || this.matingCooldown > 0) return;
        if (this.gender === 'FEMALE' && this.isPregnant) return;
        
        for (const other of otherNeanderthals) {
            if (other === this || !other.isMature || other.isDead) continue;
            if (other.gender === this.gender) continue;
            if (other.matingCooldown > 0) continue;
            
            const dist = Utils.distance(this.x, this.y, other.x, other.y);
            if (dist < 2) {
                // Paarung erfolgreich
                if (this.gender === 'FEMALE') {
                    this.isPregnant = true;
                    this.pregnancyTimer = 0;
                } else {
                    other.isPregnant = true;
                    other.pregnancyTimer = 0;
                }
                
                this.matingCooldown = CONFIG.NEANDERTHAL.MATING_COOLDOWN;
                other.matingCooldown = CONFIG.NEANDERTHAL.MATING_COOLDOWN;
                this.lastAction = 'Paarung';
                break;
            }
        }
    }

    // Geburt
    giveBirth(otherNeanderthals) {
        const childBrain = this.brain.clone();
        childBrain.mutate(0.05, 0.2); // Leichte Mutation
        
        const child = new Neanderthal(
            this.x + Utils.random(-2, 2),
            this.y + Utils.random(-2, 2),
            childBrain
        );
        child.generation = this.generation + 1;
        
        otherNeanderthals.push(child);
        this.childrenBorn++;
        this.isPregnant = false;
        this.pregnancyTimer = 0;
        this.lastAction = 'Geburt';
    }

    // Erzeuge Nachkommen für Evolution
    createOffspring(brain) {
        const child = new Neanderthal(
            Utils.random(10, 190),
            Utils.random(10, 140),
            brain
        );
        child.generation = this.generation + 1;
        return child;
    }

    // Update Fitness-Score
    updateFitness() {
        this.fitness = 0;
        
        // Überlebenszeit (wichtigster Faktor)
        this.fitness += this.survivalTime * 0.1;
        
        // Gesundheit
        this.fitness += this.health * 2;
        
        // Ressourcenmanagement
        this.fitness += this.foodGathered * 0.5;
        this.fitness += this.waterDrunk * 0.3;
        
        // Erfolgreiche Aktionen
        this.fitness += this.successfulHunts * 10;
        this.fitness += this.toolsCrafted * 15;
        
        // Fortpflanzung
        this.fitness += this.childrenBorn * 50;
        
        // Strafen
        this.fitness -= this.injuries * 5;
        this.fitness -= this.diseaseLevel * 10;
    }

    // Render Neanderthaler
    render(ctx, cellSize) {
        if (this.isDead) return;
        
        const screenX = this.x * cellSize;
        const screenY = this.y * cellSize;
        const radius = cellSize * 0.8;
        
        // Körper
        let color = CONFIG.COLORS.NEANDERTHAL;
        if (!this.isMature) {
            color = CONFIG.COLORS.NEANDERTHAL_CHILD;
        } else if (this.age > CONFIG.NEANDERTHAL.MAX_AGE * 0.7) {
            color = CONFIG.COLORS.NEANDERTHAL_ELDER;
        }
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Kontur
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Gender-Marker
        ctx.fillStyle = this.gender === 'MALE' ? '#4169E1' : '#FF69B4';
        ctx.beginPath();
        ctx.arc(screenX + radius * 0.5, screenY - radius * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Werkzeug-Indicator
        if (this.hasTool || this.hasWeapon) {
            ctx.fillStyle = '#A9A9A9';
            ctx.fillRect(screenX - radius, screenY - radius - 3, 4, 4);
        }
        
        // Gesundheitsbalken
        const barWidth = radius * 2;
        const barHeight = 4;
        const barX = screenX - barWidth / 2;
        const barY = screenY - radius - 8;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const healthPercent = this.health / 100;
        ctx.fillStyle = healthPercent > 0.6 ? '#00ff00' : healthPercent > 0.3 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Hunger-Indikator (kleine Linie)
        const hungerY = barY + barHeight + 2;
        ctx.fillStyle = 'rgba(255, 165, 0, 0.7)';
        ctx.fillRect(barX, hungerY, barWidth * (1 - this.hunger / 100), 2);
    }
}

// Exportiere Klasse
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Neanderthal;
}
