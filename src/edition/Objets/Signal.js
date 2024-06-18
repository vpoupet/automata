class Signal {
    constructor(value) {
        this.symbol = Symbol.for(String(value));
        this.negation = false;
    }

    setValue(value) {
        this.symbol = Symbol.for(String(value));
    }

    getValue() {
        return Symbol.keyFor(this.symbol);
    }

    getNegation(){
        return this.negation;
    }
}

export default Signal;
