class Cellule {
    constructor() {
        this.signals = new Set();
    }

    get(signal) {
        return this.signals.has(signal);
    }

    addSignal(signal) {
        // Assure que le signal est un Symbol
        if (typeof signal !== 'symbol') {
            signal = Symbol.for(signal);
        }

        // Supprime le signal opposé si présent
        const negatedSignal = Symbol.for('!' + Symbol.keyFor(signal));
        this.removeSignal(negatedSignal);

        // Ajoute le signal si non déjà présent
        if (!this.signals.has(signal)) {
            this.signals.add(signal);
        }
    }

    removeSignal(signal) {
        // Assure que le signal est un Symbol
        if (typeof signal !== 'symbol') {
            signal = Symbol.for(signal);
        }
        this.signals.delete(signal);
    }

    removeAllSignals() {
        this.signals = new Set();
    }

    getSignals() {
        return this.signals;
    }

    initFromSet(signalSet) {
        this.signals = new Set(signalSet);
    }
}

export default Cellule;
