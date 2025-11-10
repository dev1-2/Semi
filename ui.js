// ============================================================================
// UI CONTROLLER - Verwaltet alle UI-Updates
// ============================================================================

class UIController {
    constructor(simulation) {
        this.simulation = simulation;
        
        // UI Elemente
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            speedSlider: document.getElementById('speedSlider'),
            speedValue: document.getElementById('speedValue'),
            
            generation: document.getElementById('generation'),
            aliveAgents: document.getElementById('aliveAgents'),
            deadAgents: document.getElementById('deadAgents'),
            totalBorn: document.getElementById('totalBorn'),
            dayCount: document.getElementById('dayCount'),
            season: document.getElementById('season'),
            temperature: document.getElementById('temperature'),
            animalCount: document.getElementById('animalCount'),
            
            selectedAgentInfo: document.getElementById('selectedAgentInfo'),
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Start Button
        this.elements.startBtn.addEventListener('click', () => {
            this.simulation.start();
            this.elements.startBtn.disabled = true;
            this.elements.pauseBtn.disabled = false;
        });
        
        // Pause Button
        this.elements.pauseBtn.addEventListener('click', () => {
            this.simulation.pause();
            this.elements.pauseBtn.textContent = this.simulation.isPaused ? '▶️ Fortsetzen' : '⏸️ Pausieren';
        });
        
        // Reset Button
        this.elements.resetBtn.addEventListener('click', () => {
            if (confirm('Simulation wirklich zurücksetzen?')) {
                this.simulation.reset();
                this.elements.startBtn.disabled = false;
                this.elements.pauseBtn.disabled = true;
                this.elements.pauseBtn.textContent = '⏸️ Pausieren';
                this.update();
            }
        });
        
        // Geschwindigkeit Slider
        this.elements.speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            this.simulation.setSpeed(speed);
            this.elements.speedValue.textContent = `${speed}x`;
        });
        
        // Canvas Click
        this.simulation.canvas.addEventListener('click', (e) => {
            const rect = this.simulation.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const selected = this.simulation.handleClick(x, y);
            if (selected) {
                this.updateSelectedAgentInfo(selected);
            }
        });
    }

    // Update alle UI Elemente
    update() {
        const stats = this.simulation.getStats();
        
        // Statistiken
        this.elements.generation.textContent = stats.generation;
        this.elements.aliveAgents.textContent = stats.alive;
        this.elements.deadAgents.textContent = stats.dead;
        this.elements.totalBorn.textContent = stats.totalBorn;
        this.elements.dayCount.textContent = stats.day;
        this.elements.season.textContent = `${stats.season} (${stats.timeOfDay})`;
        this.elements.temperature.textContent = `${stats.temperature}°C (${stats.weather})`;
        this.elements.animalCount.textContent = stats.animals;
        
        // Update Selected Agent (wenn vorhanden)
        if (this.simulation.selectedAgent && !this.simulation.selectedAgent.isDead) {
            this.updateSelectedAgentInfo(this.simulation.selectedAgent);
        }
    }

    // Update Selected Agent Info Panel
    updateSelectedAgentInfo(agent) {
        if (!agent || agent.isDead) {
            this.elements.selectedAgentInfo.innerHTML = 'Kein Agent ausgewählt';
            return;
        }
        
        const ageYears = Math.floor(agent.age / CONFIG.ENVIRONMENT.DAY_LENGTH / 365);
        const ageDays = Math.floor(agent.age / CONFIG.ENVIRONMENT.DAY_LENGTH) % 365;
        
        const html = `
            <div style="margin-bottom: 10px;">
                <strong style="color: #ffd700;">Neanderthaler #${agent.id.slice(0, 8)}</strong>
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>Grunddaten:</strong><br>
                Geschlecht: ${agent.gender === 'MALE' ? '♂ Männlich' : '♀ Weiblich'}<br>
                Alter: ${ageYears}J ${ageDays}T<br>
                Status: ${agent.isMature ? 'Erwachsen' : 'Kind'}<br>
                Generation: ${agent.generation}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>Physiologie:</strong><br>
                <div class="health-bar">
                    <div class="health-bar-fill" style="width: ${agent.health}%; background: ${agent.health > 50 ? '#00ff00' : '#ff0000'};"></div>
                </div>
                Gesundheit: ${agent.health.toFixed(1)}/100<br>
                
                <div class="health-bar">
                    <div class="health-bar-fill" style="width: ${100 - agent.hunger}%; background: #ffa500;"></div>
                </div>
                Hunger: ${agent.hunger.toFixed(1)}/100<br>
                
                <div class="health-bar">
                    <div class="health-bar-fill" style="width: ${100 - agent.thirst}%; background: #4169e1;"></div>
                </div>
                Durst: ${agent.thirst.toFixed(1)}/100<br>
                
                <div class="health-bar">
                    <div class="health-bar-fill" style="width: ${agent.energy}%; background: #ffff00;"></div>
                </div>
                Energie: ${agent.energy.toFixed(1)}/100<br>
                
                Temperatur: ${agent.bodyTemperature.toFixed(1)}°C<br>
                Verletzungen: ${agent.injuries.toFixed(1)}<br>
                ${agent.diseaseLevel > 0 ? `⚠️ Krankheit: ${agent.diseaseLevel.toFixed(1)}` : ''}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>Inventar:</strong><br>
                Nahrung: ${agent.foodInInventory.toFixed(0)}<br>
                Werkzeug: ${agent.hasTool ? '✓' : '✗'}<br>
                Waffe: ${agent.hasWeapon ? '✓' : '✗'}<br>
                Holz: ${agent.woodCount}<br>
                Stein: ${agent.stoneCount}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>Aktuelle Aktion:</strong><br>
                ${agent.lastAction}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>Leistungen:</strong><br>
                Überlebenszeit: ${Math.floor(agent.survivalTime / CONFIG.ENVIRONMENT.DAY_LENGTH)}T<br>
                Nahrung gesammelt: ${agent.foodGathered.toFixed(0)}<br>
                Erfolgreiche Jagden: ${agent.successfulHunts}<br>
                Werkzeuge hergestellt: ${agent.toolsCrafted}<br>
                Kinder geboren: ${agent.childrenBorn}<br>
                <strong style="color: #ffd700;">Fitness: ${agent.fitness.toFixed(1)}</strong>
            </div>
            
            ${agent.isPregnant ? `
                <div style="background: rgba(255, 105, 180, 0.3); padding: 5px; border-radius: 3px;">
                    🤰 Schwanger (${Math.floor((CONFIG.NEANDERTHAL.PREGNANCY_DURATION - agent.pregnancyTimer) / CONFIG.ENVIRONMENT.DAY_LENGTH)}T verbleibend)
                </div>
            ` : ''}
            
            <div style="margin-top: 8px; font-size: 10px; color: #888;">
                Position: (${agent.x.toFixed(1)}, ${agent.y.toFixed(1)})<br>
                NN-Parameter: ${agent.brain.getParameterCount()}
            </div>
        `;
        
        this.elements.selectedAgentInfo.innerHTML = html;
    }
}

// Exportiere Klasse
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
