import Signal from './Signal';
class Cellule {
    constructor() {
        this.signals = [];
    }

    get(signal){
        return this.signals.includes(signal);
    }

    addSignal(signalValue) {
        // Remove the opposite signal if it exists
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

    modifySignal(signal, newSignal){
        //si la case possède le signal, le modifier pour mettre le nouveau à la place
        if(this.signals.includes(signal)){
            this.signals[this.signals.indexOf(signal)].setValue(newSignal);
        }
        else if (this.signals.includes('!' + signal)){
            this.signals[this.signals.indexOf('!' + signal)].setValue('!' + newSignal);
        }

    }

}

export default Cellule;
