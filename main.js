// ============================================================================
// MAIN - Entry Point und Game Loop
// ============================================================================

// Globale Variablen
let simulation;
let uiController;
let animationFrameId;

// Initialisierung wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦴 Neanderthaler Simulation startet...');
    console.log('Pleistozän-Ära Simulation mit neuronalen Netzen');
    
    init();
});

// Initialisiere Simulation
function init() {
    // Canvas Setup
    const canvas = document.getElementById('gameCanvas');
    
    // Erstelle Simulation
    simulation = new Simulation(canvas);
    
    // Erstelle UI Controller
    uiController = new UIController(simulation);
    
    // Initiales UI Update
    uiController.update();
    
    // Starte Game Loop
    startGameLoop();
    
    console.log('✓ Simulation initialisiert');
    console.log('Klicke auf "Simulation Starten" um zu beginnen');
    console.log('');
    console.log('=== STEUERUNG ===');
    console.log('- Klicke auf einen Neanderthaler für Details');
    console.log('- Nutze den Geschwindigkeits-Slider für schnellere Evolution');
    console.log('- Beobachte wie die KI lernt zu überleben!');
}

// Game Loop
function startGameLoop() {
    function loop() {
        // Update Simulation
        simulation.update();
        
        // Render
        simulation.render();
        
        // Update UI (weniger oft für Performance)
        if (simulation.environment.tick % 10 === 0) {
            uiController.update();
        }
        
        // Nächster Frame
        animationFrameId = requestAnimationFrame(loop);
    }
    
    loop();
}

// Stoppe Game Loop
function stopGameLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case ' ': // Leertaste = Pause
            if (simulation.isRunning) {
                simulation.pause();
                uiController.elements.pauseBtn.textContent = simulation.isPaused ? '▶️ Fortsetzen' : '⏸️ Pausieren';
            }
            e.preventDefault();
            break;
            
        case '+': // Geschwindigkeit erhöhen
            const newSpeed = Math.min(10, simulation.speed + 1);
            simulation.setSpeed(newSpeed);
            uiController.elements.speedSlider.value = newSpeed;
            uiController.elements.speedValue.textContent = `${newSpeed}x`;
            break;
            
        case '-': // Geschwindigkeit verringern
            const lowerSpeed = Math.max(1, simulation.speed - 1);
            simulation.setSpeed(lowerSpeed);
            uiController.elements.speedSlider.value = lowerSpeed;
            uiController.elements.speedValue.textContent = `${lowerSpeed}x`;
            break;
            
        case 'r': // Reset (mit Bestätigung)
            if (confirm('Simulation zurücksetzen?')) {
                simulation.reset();
                uiController.elements.startBtn.disabled = false;
                uiController.elements.pauseBtn.disabled = true;
                uiController.update();
            }
            break;
            
        case 's': // Start
            if (!simulation.isRunning) {
                simulation.start();
                uiController.elements.startBtn.disabled = true;
                uiController.elements.pauseBtn.disabled = false;
            }
            break;
    }
});

// Window Resize Handler
window.addEventListener('resize', () => {
    // Optional: Canvas-Größe anpassen
    // Aktuell feste Größe
});

// Cleanup bei Page Unload
window.addEventListener('beforeunload', () => {
    stopGameLoop();
});

// Zeige Willkommens-Nachricht in Konsole
console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🦴 NEANDERTHALER EVOLUTION SIMULATOR 🦴                ║
║                                                          ║
║   Eine realistische Pleistozän-Simulation mit            ║
║   neuronalen Netzen und genetischen Algorithmen         ║
║                                                          ║
║   Features:                                              ║
║   - 85+ Eingabe-Neuronen für Sensorik                   ║
║   - 28 Ausgabe-Neuronen für komplexe Aktionen           ║
║   - Realistische Physiologie (Hunger, Durst, etc.)      ║
║   - 200+ Tiere mit eigenem Verhalten                    ║
║   - Tag/Nacht-Zyklus & Jahreszeiten                     ║
║   - Evolution über Generationen                          ║
║   - Handwerk, Jagd, soziale Interaktionen               ║
║                                                          ║
║   Entwickelt ${new Date().getFullYear()}                                        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);
