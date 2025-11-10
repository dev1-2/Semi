// ============================================================================
// NEURONALES NETZ - Deep Neural Network mit Evolution
// ============================================================================

class NeuralNetwork {
    constructor(inputSize, hiddenLayers, outputSize) {
        this.inputSize = inputSize;
        this.hiddenLayers = hiddenLayers;
        this.outputSize = outputSize;
        
        // Erstelle Netzwerk-Architektur
        this.layers = [inputSize, ...hiddenLayers, outputSize];
        this.weights = [];
        this.biases = [];
        
        // Initialisiere Gewichte und Biases
        this.initializeWeights();
    }

    initializeWeights() {
        // Xavier-Initialisierung
        for (let i = 0; i < this.layers.length - 1; i++) {
            const inputSize = this.layers[i];
            const outputSize = this.layers[i + 1];
            
            // Gewichte-Matrix
            const weightMatrix = [];
            for (let j = 0; j < outputSize; j++) {
                const neuronWeights = [];
                const scale = Math.sqrt(2.0 / inputSize); // He-Initialisierung
                for (let k = 0; k < inputSize; k++) {
                    neuronWeights.push(Utils.gaussianRandom(0, scale));
                }
                weightMatrix.push(neuronWeights);
            }
            this.weights.push(weightMatrix);
            
            // Biases
            const biasVector = [];
            for (let j = 0; j < outputSize; j++) {
                biasVector.push(0);
            }
            this.biases.push(biasVector);
        }
    }

    // Forward-Pass durch das Netzwerk
    forward(inputs) {
        let activations = inputs;
        
        // Durch alle Layer
        for (let i = 0; i < this.weights.length; i++) {
            const newActivations = [];
            
            // Für jedes Neuron im aktuellen Layer
            for (let j = 0; j < this.weights[i].length; j++) {
                let sum = this.biases[i][j];
                
                // Gewichtete Summe
                for (let k = 0; k < activations.length; k++) {
                    sum += activations[k] * this.weights[i][j][k];
                }
                
                // Aktivierungsfunktion
                const activation = this.activate(sum, i === this.weights.length - 1);
                newActivations.push(activation);
            }
            
            activations = newActivations;
        }
        
        return activations;
    }

    // Aktivierungsfunktion
    activate(x, isOutputLayer = false) {
        if (isOutputLayer) {
            // Output-Layer: Sigmoid für Wahrscheinlichkeiten
            return Utils.sigmoid(x);
        } else {
            // Hidden-Layer: Tanh
            return Utils.tanh(x);
        }
    }

    // Mutation für genetischen Algorithmus
    mutate(mutationRate, mutationStrength) {
        // Mutiere Gewichte
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    if (Utils.chance(mutationRate)) {
                        // Addiere Gaussian-Noise
                        this.weights[i][j][k] += Utils.gaussianRandom(0, mutationStrength);
                    }
                }
            }
        }
        
        // Mutiere Biases
        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].length; j++) {
                if (Utils.chance(mutationRate)) {
                    this.biases[i][j] += Utils.gaussianRandom(0, mutationStrength);
                }
            }
        }
    }

    // Crossover zwischen zwei Netzwerken
    static crossover(parent1, parent2) {
        const child = new NeuralNetwork(
            parent1.inputSize,
            parent1.hiddenLayers,
            parent1.outputSize
        );
        
        // Crossover für Gewichte
        for (let i = 0; i < parent1.weights.length; i++) {
            for (let j = 0; j < parent1.weights[i].length; j++) {
                for (let k = 0; k < parent1.weights[i][j].length; k++) {
                    // 50% Chance von jedem Elternteil
                    child.weights[i][j][k] = Utils.chance(0.5) 
                        ? parent1.weights[i][j][k] 
                        : parent2.weights[i][j][k];
                }
            }
        }
        
        // Crossover für Biases
        for (let i = 0; i < parent1.biases.length; i++) {
            for (let j = 0; j < parent1.biases[i].length; j++) {
                child.biases[i][j] = Utils.chance(0.5)
                    ? parent1.biases[i][j]
                    : parent2.biases[i][j];
            }
        }
        
        return child;
    }

    // Kopiere Netzwerk
    clone() {
        const clone = new NeuralNetwork(
            this.inputSize,
            this.hiddenLayers,
            this.outputSize
        );
        
        // Deep Copy Gewichte
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                clone.weights[i][j] = [...this.weights[i][j]];
            }
        }
        
        // Deep Copy Biases
        for (let i = 0; i < this.biases.length; i++) {
            clone.biases[i] = [...this.biases[i]];
        }
        
        return clone;
    }

    // Serialisiere zu JSON
    toJSON() {
        return {
            inputSize: this.inputSize,
            hiddenLayers: this.hiddenLayers,
            outputSize: this.outputSize,
            weights: this.weights,
            biases: this.biases
        };
    }

    // Lade von JSON
    static fromJSON(json) {
        const nn = new NeuralNetwork(
            json.inputSize,
            json.hiddenLayers,
            json.outputSize
        );
        nn.weights = json.weights;
        nn.biases = json.biases;
        return nn;
    }

    // Berechne Netzwerk-Größe (Anzahl Parameter)
    getParameterCount() {
        let count = 0;
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                count += this.weights[i][j].length;
            }
            count += this.biases[i].length;
        }
        return count;
    }
}

// ============================================================================
// NEAT-ähnlicher Genetischer Algorithmus
// ============================================================================

class GeneticAlgorithm {
    constructor(populationSize, eliteCount, tournamentSize) {
        this.populationSize = populationSize;
        this.eliteCount = eliteCount;
        this.tournamentSize = tournamentSize;
    }

    // Wähle Eltern durch Tournament-Selection
    tournamentSelection(population) {
        const tournament = [];
        for (let i = 0; i < this.tournamentSize; i++) {
            tournament.push(Utils.randomChoice(population));
        }
        
        // Sortiere nach Fitness (höher ist besser)
        tournament.sort((a, b) => b.fitness - a.fitness);
        return tournament[0];
    }

    // Erstelle neue Generation
    evolve(population) {
        // Sortiere nach Fitness
        population.sort((a, b) => b.fitness - a.fitness);
        
        const newPopulation = [];
        
        // Elite übernimmt direkt
        for (let i = 0; i < this.eliteCount && i < population.length; i++) {
            const elite = population[i];
            elite.brain = elite.brain.clone();
            elite.age = 0;
            elite.resetPhysiology();
            newPopulation.push(elite);
        }
        
        // Fülle Rest durch Crossover und Mutation
        while (newPopulation.length < this.populationSize) {
            const parent1 = this.tournamentSelection(population);
            const parent2 = this.tournamentSelection(population);
            
            let childBrain;
            if (Utils.chance(CONFIG.EVOLUTION.CROSSOVER_RATE)) {
                childBrain = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            } else {
                childBrain = parent1.brain.clone();
            }
            
            // Mutation
            childBrain.mutate(
                CONFIG.NEURAL_NETWORK.MUTATION_RATE,
                CONFIG.NEURAL_NETWORK.MUTATION_STRENGTH
            );
            
            // Erstelle neuen Agent mit dem Brain
            const child = parent1.createOffspring(childBrain);
            newPopulation.push(child);
        }
        
        return newPopulation;
    }

    // Berechne durchschnittliche Fitness
    static getAverageFitness(population) {
        if (population.length === 0) return 0;
        const sum = population.reduce((total, agent) => total + agent.fitness, 0);
        return sum / population.length;
    }

    // Berechne beste Fitness
    static getBestFitness(population) {
        if (population.length === 0) return 0;
        return Math.max(...population.map(agent => agent.fitness));
    }
}

// Exportiere Klassen
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NeuralNetwork, GeneticAlgorithm };
}
