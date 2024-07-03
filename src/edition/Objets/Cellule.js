class Cellule {
    constructor() {
        this.signals = [];
    }

    get(signal) {
        return this.signals.includes(signal);
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
        if (!this.signals.includes(signal)) {
            this.signals.push(signal);
        }
    }

    removeSignal(signal) {
        // Assure que le signal est un Symbol
        if (typeof signal !== 'symbol') {
            signal = Symbol.for(signal);
        }
        this.signals = this.signals.filter(s => s !== signal);
    }

    removeAllSignals() {
        this.signals = [];
    }

    toSet() {
        return new Set(this.signals);
    }

    fromSet(signalSet) {
        this.signals = [];
        for (const signal of signalSet) {
            if (typeof signal === 'symbol') {
                this.addSignal(signal);
            }
        }
    }
}

export default Cellule;
