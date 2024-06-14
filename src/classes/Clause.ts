import { Signal, Neighborhood } from "./types.ts";

export class Clause {
    eval(_signals: Neighborhood): boolean {
        return true;
    }

    toString(): string {
        return "";
    }

    getLiterals(): Literal[] {
        return [];
    }
}

export class Negation extends Clause {
    subclause: Clause;

    constructor(subclause: Clause) {
        super();
        this.subclause = subclause;
    }

    eval(signals: Neighborhood): boolean {
        if (this.subclause === undefined) {
            return false;
        }
        return !this.subclause.eval(signals);
    }

    toString(): string {
        if (this.subclause === undefined) {
            return "!";
        } else {
            return `-${this.subclause.toString()}`;
        }
    }

    getLiterals(): Literal[] {
        return this.subclause.getLiterals();
    }
}

/**
 * Representation of a conjunctive clause for rule conditions.
 * This evaluates to true if all the subclauses evaluate to true.
 */
export class Conjunction extends Clause {
    subclauses: Clause[];

    constructor(subclauses: Clause[]) {
        super();
        this.subclauses = [];
        for (const subclause of subclauses) {
            if (subclause instanceof Conjunction) {
                this.subclauses.push(...subclause.subclauses);
            } else {
                this.subclauses.push(subclause);
            }
        }
    }

    eval(signals: Neighborhood): boolean {
        return this.subclauses.every((subclause) => subclause.eval(signals));
    }

    toString(): string {
        return `(${this.subclauses
            .map((subclause) => subclause.toString())
            .join(" ")})`;
    }

    getLiterals(): Literal[] {
        return this.subclauses.flatMap((subclause) => subclause.getLiterals());
    }
}

/**
 * Representation of a disjunctive clause for rule conditions.
 * This evaluates to true if at least one of the subclauses evaluate to true.
 */
export class Disjunction extends Clause {
    subclauses: Clause[];

    constructor(subclauses: Clause[]) {
        super();
        this.subclauses = [];
        for (const subclause of subclauses) {
            if (subclause instanceof Disjunction) {
                this.subclauses.push(...subclause.subclauses);
            } else {
                this.subclauses = subclauses;
            }
        }
    }

    eval(signals: Neighborhood): boolean {
        return this.subclauses.some((subclause) => subclause.eval(signals));
    }

    toString(): string {
        return `[${this.subclauses
            .map((subclause) => subclause.toString())
            .join(" ")}]`;
    }

    getLiterals(): Literal[] {
        return this.subclauses.flatMap((subclause) => subclause.getLiterals());
    }
}

/**
 * Representation of a positive literal for rule conditions.
 * This evaluates to true if the corresponding signal appears.
 */
export class Literal extends Clause {
    signal: Signal;
    position: number;

    constructor(signal: Signal, position = 0) {
        super();
        this.signal = signal;
        this.position = position;
    }

    eval(signals: Neighborhood): boolean {
        return signals[this.position].has(this.signal);
    }

    toString(): string {
        if (this.position === 0) {
            return `${Symbol.keyFor(this.signal)}`;
        } else {
            return `${this.position}.${Symbol.keyFor(this.signal)}`;
        }
    }

    getLiterals(): Literal[] {
        return [this];
    }
}
