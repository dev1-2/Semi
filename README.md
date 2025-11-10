# 🦴 Neanderthaler Evolution Simulator

Eine **hochrealistische Pleistozän-Simulation** mit neuronalen Netzen und genetischen Algorithmen, die zeigt, wie Neanderthaler durch Evolution lernen, in einer eiszeitzeitlichen Umgebung zu überleben.

## 🎯 Features

### Neuronales Netz & KI
- **85+ Input-Neuronen** für komplexe Sensorik
  - Visuelle Wahrnehmung in 8 Richtungen
  - Objekterkennung (Wasser, Tiere, Beeren, Gefahren, etc.)
  - Körperzustand (Hunger, Durst, Gesundheit, Energie, Temperatur)
  - Umweltwahrnehmung (Tageszeit, Jahreszeit, Wetter)
  - Inventar-Status
- **3 Hidden Layers** (64, 48, 32 Neuronen)
- **28 Output-Neuronen** für verschiedene Aktionen
- **Genetischer Algorithmus** für Evolution über Generationen
- **NEAT-ähnliche Mutation & Crossover**

### Realistische Physiologie
- **Hunger & Durst** mit kontinuierlichem Verbrauch
- **Energie-System** (Bewegung kostet Energie)
- **Körpertemperatur** (Unterkühlung/Überhitzung)
- **Gesundheitssystem** (Verletzungen, Krankheiten)
- **Alterung** (Lebensdauer ca. 40 simulierte Jahre)
- **Fortpflanzung** (Schwangerschaft, Geburt, Vererbung)

### Komplexe Aktionen (28 verschiedene)
1. **Bewegung** - 8 Richtungen + Sprint
2. **Nahrung** - Beeren sammeln, Jagen (klein/groß), Essen, Trinken
3. **Handwerk** - Werkzeuge, Waffen, Feuer, Unterkünfte bauen
4. **Ressourcen** - Holz und Stein sammeln
5. **Überleben** - Ausruhen, Schlafen, Schutz suchen
6. **Sozial** - Kommunizieren, Nahrung teilen, Paarung

### Realistische Pleistozän-Welt
- **Zellulärer Automat** für prozeduale Weltgenerierung
- **Perlin-Noise basiertes Terrain**
  - Berge, Täler, Flüsse, Höhlen
  - Wälder, Steppen, Schnee, Eis
- **200+ Tiere** mit eigenem Verhalten:
  - Mammuts, Wollnashörner
  - Höhlenlöwen, Höhlenbären (Raubtiere)
  - Hirsche, Rentiere, Hasen
  - Fische, Vögel
- **Dynamische Ressourcen**
  - Beeren-Büsche (wachsen nach)
  - Holz und Stein

### Umweltsystem
- **Tag/Nacht-Zyklus** (200 Ticks = 1 Tag)
- **Jahreszeiten** (Frühling, Sommer, Herbst, Winter)
- **Wetter** (Regen, Schnee)
- **Realistische Temperaturen** (Eiszeit-Klima: -15°C bis +22°C)
- **Jahreszeit-abhängige Vegetation**

### Evolution & Genetik
- **Fitness-basierte Selektion**
- **Elite-Preservation** (beste Agents überleben)
- **Tournament-Selection** für Elternwahl
- **Crossover & Mutation** der neuronalen Netze
- **Automatische neue Generation** wenn alle sterben

## 🚀 Starten

1. Öffne `index.html` in einem modernen Browser (Chrome, Firefox, Edge)
2. Klicke auf **"▶️ Simulation Starten"**
3. Beobachte wie die Neanderthaler lernen zu überleben!

## 🎮 Steuerung

### Maus
- **Klick auf Neanderthaler** → Zeigt detaillierte Informationen

### Tastatur
- **Leertaste** → Pausieren/Fortsetzen
- **S** → Start
- **R** → Reset (mit Bestätigung)
- **+** → Geschwindigkeit erhöhen
- **-** → Geschwindigkeit verringern

### UI-Elemente
- **Geschwindigkeits-Slider** → 1x bis 10x Speed
- **Pause-Button** → Simulation anhalten
- **Reset-Button** → Neue Welt generieren

## 📊 Statistiken

### Welt-Statistiken
- Generation
- Lebende/Verstorbene Neanderthaler
- Gesamtbevölkerung
- Simulationstag
- Jahreszeit & Tageszeit
- Temperatur & Wetter
- Anzahl Tiere

### Agent-Details (bei Klick)
- **Grunddaten**: Geschlecht, Alter, Status, Generation
- **Physiologie**: Gesundheit, Hunger, Durst, Energie, Temperatur, Verletzungen
- **Inventar**: Nahrung, Werkzeuge, Waffen, Ressourcen
- **Aktuelle Aktion**: Was macht der Agent gerade?
- **Leistungen**: Überlebenszeit, gesammelte Nahrung, Jagderfolge, Kinder
- **Fitness-Score**: Evolutionärer Erfolg

## 🧬 Wie funktioniert die Evolution?

1. **Simulation läuft** bis alle Neanderthaler sterben
2. **Fitness wird berechnet** basierend auf:
   - Überlebenszeit (wichtigster Faktor)
   - Gesundheit
   - Gesammelte Ressourcen
   - Erfolgreiche Aktionen (Jagd, Handwerk)
   - Fortpflanzung
3. **Genetischer Algorithmus** erstellt neue Generation:
   - Elite-Agents überleben direkt
   - Beste Agents werden als Eltern gewählt (Tournament-Selection)
   - Crossover kombiniert Gehirne zweier Eltern
   - Mutation variiert Gewichte
4. **Neue Generation startet** mit verbesserten neuronalen Netzen

## 🎨 Legende

| Farbe | Bedeutung |
|-------|-----------|
| 🟤 Braun | Neanderthaler |
| 🟫 Dunkelbraun | Mammut |
| 🦌 Hellbraun | Hirsch/Rentier |
| 🐇 Beige | Hase |
| 🦁 Rot | Höhlenlöwe (Gefahr!) |
| 🌲 Dunkelgrün | Wald |
| 🌾 Hellgrün | Steppe/Grasland |
| 💧 Blau | Wasser |
| ⛰️ Grau | Berge/Höhlen |
| 🟡 Gelb | Beeren (Nahrung) |
| ❄️ Weiß | Schnee/Eis |

## 📈 Performance

- **Optimiert** für 30-60 FPS
- **200 Tiere** + **15 Neanderthaler**
- **200x150 Welt** = 30.000 Zellen
- **Geschwindigkeits-Modus** bis 10x für schnelle Evolution

## 🔬 Technische Details

### Architektur
```
Input Layer (85)
    ↓
Hidden Layer 1 (64) - Tanh
    ↓
Hidden Layer 2 (48) - Tanh
    ↓
Hidden Layer 3 (32) - Tanh
    ↓
Output Layer (28) - Sigmoid
```

### Dateien
- `index.html` - HTML-Struktur & Styling
- `config.js` - Alle Konfigurationsparameter
- `utils.js` - Hilfsfunktionen (Mathe, Noise, etc.)
- `neuralNetwork.js` - Deep Neural Network & Genetischer Algorithmus
- `cellularAutomaton.js` - Weltgenerierung
- `environment.js` - Umweltsystem (Zeit, Wetter, Ressourcen)
- `animal.js` - Tier-KI & Management
- `neanderthal.js` - Haupt-Agent mit NN
- `simulation.js` - Orchestrierung aller Systeme
- `ui.js` - UI-Controller
- `main.js` - Entry Point & Game Loop

## 🎓 Lernziele

Diese Simulation demonstriert:
- **Reinforcement Learning** ohne explizites Training
- **Genetische Algorithmen** & Evolution
- **Emergentes Verhalten** aus einfachen Regeln
- **Komplexe Systeme** mit vielen Interaktionen
- **Realistische Simulation** von Überlebensstrategien

## 🐛 Bekannte Limitationen

- Keine Pathfinding-Algorithmen (Agents bewegen sich direktional)
- Vereinfachte Ökologie (keine Nahrungsketten)
- Keine permanente Speicherung (Browser-basiert)
- Performance sinkt bei sehr vielen Agents

## 🚧 Mögliche Erweiterungen

- **Sprache & Kultur**: Kommunikation zwischen Agents
- **Gruppenbildung**: Clans und Territorien
- **Technologie-Baum**: Fortgeschrittene Werkzeuge
- **Krankheiten**: Epidemien und Immunsystem
- **Kriegsführung**: Konflikte zwischen Gruppen
- **Höhlenmalerei**: Kulturelle Artefakte
- **Domestizierung**: Tiere zähmen

## 📝 Lizenz

Bildungsprojekt - Frei verwendbar für Lernen und Forschung

---

**Viel Spaß beim Beobachten der Evolution!** 🦴🧬
