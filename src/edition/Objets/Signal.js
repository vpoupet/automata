class Signal {
    constructor(value) {
        this.symbol = Symbol.for(String(value));
        this.negation = value.startsWith('!');
    }

    setValue(value) {
        this.symbol = Symbol.for(String(value));
        this.negation = value.startsWith('!');
    }

    getValue() {
        return Symbol.keyFor(this.symbol);
    }

    getNegation(){
        return this.negation;
    }
}

export default Signal;
