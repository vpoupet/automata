import Signal from './Signal';

class Cellule {
    constructor() {
        this.signals = [];
    }

    get(signal) {
        return this.signals.includes(signal);
    }

    addSignal(signalValue) {
        this.removeSignal(signalValue.startsWith('!') ? signalValue.substring(1) : '!' + signalValue);

        if (!this.signals.some(signal => signal.getValue() === signalValue)) {
            const signal = new Signal(signalValue);
            this.signals.push(signal);
        }
    }

    removeSignal(signalValue) {
        this.signals = this.signals.filter(signal => signal.getValue() !== signalValue);
    }

    removeAllSignals() {
        this.signals = [];
    }

    modifySignal(signal, newSignal) {
        if (this.signals.includes(signal)) {
            this.signals[this.signals.indexOf(signal)].setValue(newSignal);
        } else if (this.signals.includes('!' + signal)) {
            this.signals[this.signals.indexOf('!' + signal)].setValue('!' + newSignal);
        }
    }

    // Nouvelle méthode pour convertir en Set
    toSet() {
        return new Set(this.signals.map(signal => Symbol.for(signal.getValue())));
    }

    // Nouvelle méthode pour initialiser à partir d'un Set
    fromSet(signalSet) {
        this.signals = [];
        for (const signal of signalSet) {
            const signalName = Symbol.keyFor(signal);
            if (signalName) {
                this.addSignal(signalName);
            }
        }
    }
}

export default Cellule;
