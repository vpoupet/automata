class Signal {
    constructor(value) {
        this.symbol = Symbol.for(String(value));
    }

    setValue(value) {
        this.symbol = Symbol.for(String(value));
    }

    getValue() {
        return Symbol.keyFor(this.symbol);
    }
}

export default Signal;
