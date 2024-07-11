import { Signal } from "./types";

export class Cell {
    signals: Set<Signal>;

    constructor(signals: Set<Signal> = new Set()) {
        this.signals = new Set(signals);
    }

    has(signal: Signal): boolean {
        return this.signals.has(signal);
    }

    clone(): Cell {
        return new Cell(new Set(this.signals));
    }
    
    addSignal(signal: Signal) {
        this.signals.add(signal);
    }

    removeSignal(signal: Signal): boolean {
        return this.signals.delete(signal);
    }

    removeAllSignals() {
        this.signals.clear();
    }

    equals(cell: Cell): boolean {
        return(cell.signals===this.signals);
    }

    isInput(): boolean {
        return false;
    }
}

export class InputCell extends Cell {
    negatedSignals: Set<Signal>;

    constructor(signals: Set<Signal> = new Set(), negatedSignals: Set<Signal> = new Set()) {
        super(signals);
        this.negatedSignals = new Set(negatedSignals);
    }

    addSignal(signal: Signal) {
        this.negatedSignals.delete(signal);
        super.addSignal(signal);
    }

    addNegatedSignal(signal: Signal) {
        this.signals.delete(signal);
        this.negatedSignals.add(signal);
    }

    removeNegatedSignal(signal: Signal): boolean {
        return this.negatedSignals.delete(signal);
    }

    isInput(): boolean {
        return true;
    }

    clone(): InputCell {
        return new InputCell(this.signals, this.negatedSignals)
    }
}
