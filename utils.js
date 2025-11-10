// ============================================================================
// UTILITY-FUNKTIONEN - Hilfsfunktionen für die gesamte Simulation
// ============================================================================

class Utils {
    // Zufallszahl zwischen min und max
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Ganzzahl zwischen min und max
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Wahrscheinlichkeits-Check
    static chance(probability) {
        return Math.random() < probability;
    }

    // Wähle zufälliges Element aus Array
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Clamp Wert zwischen min und max
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // Distanz zwischen zwei Punkten
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Manhattan-Distanz (für Gitter)
    static manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }

    // Winkel zwischen zwei Punkten (in Radians)
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    // Normalisiere Wert von [min, max] zu [0, 1]
    static normalize(value, min, max) {
        if (max === min) return 0;
        return (value - min) / (max - min);
    }

    // Interpolation zwischen zwei Werten
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // Sigmoid-Funktion
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    // Tanh-Aktivierungsfunktion
    static tanh(x) {
        return Math.tanh(x);
    }

    // ReLU-Aktivierungsfunktion
    static relu(x) {
        return Math.max(0, x);
    }

    // Gaussian-Random (Box-Muller-Transformation)
    static gaussianRandom(mean = 0, stdDev = 1) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * stdDev + mean;
    }

    // Prüfe ob Punkt im Rechteck ist
    static isInBounds(x, y, width, height) {
        return x >= 0 && x < width && y >= 0 && y < height;
    }

    // Nächste Ganzzahl-Koordinaten
    static gridPos(x, y) {
        return {
            x: Math.floor(x),
            y: Math.floor(y)
        };
    }

    // Richtungsvektor normalisieren
    static normalizeVector(dx, dy) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return { x: 0, y: 0 };
        return {
            x: dx / length,
            y: dy / length
        };
    }

    // 8 Richtungen (N, NE, E, SE, S, SW, W, NW)
    static getDirections() {
        return [
            { dx: 0, dy: -1, name: 'N' },
            { dx: 1, dy: -1, name: 'NE' },
            { dx: 1, dy: 0, name: 'E' },
            { dx: 1, dy: 1, name: 'SE' },
            { dx: 0, dy: 1, name: 'S' },
            { dx: -1, dy: 1, name: 'SW' },
            { dx: -1, dy: 0, name: 'W' },
            { dx: -1, dy: -1, name: 'NW' }
        ];
    }

    // Richtung als Index (0-7)
    static directionToIndex(dx, dy) {
        const directions = this.getDirections();
        for (let i = 0; i < directions.length; i++) {
            if (directions[i].dx === dx && directions[i].dy === dy) {
                return i;
            }
        }
        return 0;
    }

    // Farbe mit Alpha
    static colorWithAlpha(color, alpha) {
        // Konvertiere Hex zu RGBA
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Mische zwei Farben
    static blendColors(color1, color2, ratio) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(this.lerp(r1, r2, ratio));
        const g = Math.round(this.lerp(g1, g2, ratio));
        const b = Math.round(this.lerp(b1, b2, ratio));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Generiere UUID
    static generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Deep Copy von Objekt
    static deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Shuffel Array
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Gewichtete Zufallsauswahl
    static weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[items.length - 1];
    }

    // Perlin-Noise ähnliche Funktion (vereinfacht)
    static noise(x, y, seed = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return n - Math.floor(n);
    }

    // Smooth-Noise für Terrain-Generierung
    static smoothNoise(x, y, seed = 0) {
        const corners = (
            this.noise(x - 1, y - 1, seed) +
            this.noise(x + 1, y - 1, seed) +
            this.noise(x - 1, y + 1, seed) +
            this.noise(x + 1, y + 1, seed)
        ) / 16;
        
        const sides = (
            this.noise(x - 1, y, seed) +
            this.noise(x + 1, y, seed) +
            this.noise(x, y - 1, seed) +
            this.noise(x, y + 1, seed)
        ) / 8;
        
        const center = this.noise(x, y, seed) / 4;
        
        return corners + sides + center;
    }

    // Interpoliertes Noise
    static interpolatedNoise(x, y, seed = 0) {
        const intX = Math.floor(x);
        const fracX = x - intX;
        const intY = Math.floor(y);
        const fracY = y - intY;
        
        const v1 = this.smoothNoise(intX, intY, seed);
        const v2 = this.smoothNoise(intX + 1, intY, seed);
        const v3 = this.smoothNoise(intX, intY + 1, seed);
        const v4 = this.smoothNoise(intX + 1, intY + 1, seed);
        
        const i1 = this.lerp(v1, v2, fracX);
        const i2 = this.lerp(v3, v4, fracX);
        
        return this.lerp(i1, i2, fracY);
    }

    // Perlin-Noise (mehrere Oktaven)
    static perlinNoise(x, y, octaves = 4, persistence = 0.5, seed = 0) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.interpolatedNoise(x * frequency, y * frequency, seed) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        
        return total / maxValue;
    }

    // Formatiere Zeit (Ticks zu Tagen/Jahren)
    static formatTime(ticks) {
        const days = Math.floor(ticks / CONFIG.ENVIRONMENT.DAY_LENGTH);
        const years = Math.floor(days / 365);
        const remainingDays = days % 365;
        
        if (years > 0) {
            return `${years}J ${remainingDays}T`;
        }
        return `${days}T`;
    }

    // Formatiere große Zahlen
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Exportiere Utils
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
