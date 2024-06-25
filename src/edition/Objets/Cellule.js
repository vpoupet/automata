import Signal from './Signal';

class Cellule {
    constructor() {
        this.signals = [];
    }

    get(signal) {
        return this.signals.includes(signal);
    }

    addSignal(signalValue) {
        if (signalValue instanceof Signal) {
            signalValue = signalValue.getValue();
        }
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


    toSet() {
        return new Set(this.signals.map(signal => Symbol.for(signal.getValue())));
    }

    fromSet(signalSet) {
        this.signals = [];
        for (const signal of signalSet) {
            let signalName='';
            if (typeof signal !== 'symbol') {
                signalName = signal.getValue();
            }
            else {
                signalName = Symbol.keyFor(signal);
            }

            if (signalName!=='') {
                this.addSignal(signalName);
            }
        }
    }
}

export default Cellule;
