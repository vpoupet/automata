import { Signal } from "../../classes/types";

class Cellule {
    signals: Set<Signal>;

    constructor() {
        this.signals = new Set();
    }

    get(signal: Signal): boolean {
        return this.signals.has(signal);
    }

    addSignal(signal: Signal) {
        // Assure que le signal est un Symbol
        if (typeof signal !== 'symbol') {
            signal = Symbol.for(signal);
        }

        // Supprime le signal opposé si présent
        // TODO reprendre ce passage avec un ensemble de signaux et un ensemble de négations de signaux
        if (Symbol.keyFor(signal)!.startsWith('!')) {
            const nonNegatedSignal = Symbol.for(Symbol.keyFor(signal)!.substring(1));
            this.removeSignal(nonNegatedSignal);
        }
        else {
            const negatedSignal = Symbol.for('!' + Symbol.keyFor(signal));
            this.removeSignal(negatedSignal);
        }


        const negatedSignal = Symbol.for('!' + Symbol.keyFor(signal));
        this.removeSignal(negatedSignal);

        // Ajoute le signal si non déjà présent
        if (!this.signals.has(signal)) {
            this.signals.add(signal);
        }
    }

    removeSignal(signal: Signal) {
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

    initFromSet(signalSet: Set<Signal>) {
        this.signals = new Set(signalSet);
    }
}

export default Cellule;
