import { Signal, Neighborhood } from "../types.ts";

export interface ConjunctionOfLiterals extends Conjunction {
    subclauses: Literal[];
}
export interface DisjunctionOfLiterals extends Disjunction {
    subclauses: Literal[];
}
export interface CNFClause extends Conjunction {
    subclauses: DisjunctionOfLiterals[];
}
export interface DNFClause extends Disjunction {
    subclauses: ConjunctionOfLiterals[];
}

export class EvalContext {
    multiSignals: Map<Signal, Set<Signal>>;

    constructor(multiSignals: Map<Signal, Set<Signal>> = new Map()) {
        this.multiSignals = multiSignals;
    }

    /**
     * Returns the set of simple signals corresponding to a given signal.
     *
     * This returns the singleton { signal } if `signal` is a simple signal,
     * or the total set obtained by calling recursively this function on all
     * signals contained in `signal` if it is a multi-signal.
     *
     * @param signal the signal to resolve
     * @returns a set of simple signals corresponding to the signal passed as
     * parameter
     */
    getSignalsFor(signal: Signal): Set<Signal> {
        const subSignals = this.multiSignals.get(signal);
        if (subSignals === undefined) {
            // simple signal
            return new Set([signal]);
        } else {
            // multi-signal
            const result = new Set<Signal>();
            for (const subSignal of subSignals) {
                this.getSignalsFor(subSignal).forEach((s) => result.add(s));
            }
            return result;
        }
    }
}

export type LiteralTransformation = {
    signal: (Signal: Signal) => Signal;
    position: (position: number) => number;
};

export default abstract class Clause {
    abstract eval(neighborhood: Neighborhood, context: EvalContext): boolean;

    abstract toString(): string;

    abstract getLiterals(): Literal[];

    simplified(): Clause {
        const normalized = this.normalized();
        if (normalized.getComplexity() < this.getComplexity()) {
            return normalized;
        } else {
            return this;
        }
    }

    normalized(): Clause {
        const dnf = simplifyDNF(this.toDNF());
        if (dnf.subclauses.length === 1) {
            if (dnf.subclauses[0].subclauses.length === 1) {
                return dnf.subclauses[0].subclauses[0];
            }
            return dnf.subclauses[0];
        }
        return dnf;
    }

    isAlwaysTrue(): boolean {
        return false;
    }

    isAlwaysFalse(): boolean {
        return false;
    }

    abstract toCNF(): CNFClause;

    abstract toDNF(): DNFClause;

    abstract renameSignal(oldSignal: Signal, newSignal: Signal): Clause;

    abstract transformLiterals(
        transformation: LiteralTransformation,
    ): Clause;

    abstract getComplexity(): number;

    abstract getDepth(): number;
}

/**
 * Atomic clause for rule conditions.
 * A literal is defined by a signal, a position, and a sign.
 *
 * If the sign is `true`, the literal evaluates to true in a given neighborhood if the signal appears at the given
 * position. If the sign is `false`, the literal evaluates to true in a given neighborhood if the signal does not
 * appear at the given position.
 */
export class Literal extends Clause {
    signal: Signal;
    position: number;
    sign: boolean;

    constructor(signal: Signal, position = 0, sign = true) {
        super();
        this.signal = signal;
        this.position = position;
        this.sign = sign;
    }

    eval(neighborhood: Neighborhood, context: EvalContext): boolean {
        const cellSignals = neighborhood[this.position].signals;
        for (const signal of context.getSignalsFor(this.signal)) {
            if (cellSignals.has(signal)) {
                return this.sign;
            }
        }
        return !this.sign;
    }

    toString(): string {
        const signString = this.sign ? "" : "!";
        if (this.position === 0) {
            return `${signString}${Symbol.keyFor(this.signal)}`;
        } else {
            return `${this.position}.${signString}${Symbol.keyFor(
                this.signal
            )}`;
        }
    }

    getLiterals(): Literal[] {
        return [this];
    }

    copy(): Literal {
        return new Literal(this.signal, this.position, this.sign);
    }

    negated(): Literal {
        return new Literal(this.signal, this.position, !this.sign);
    }

    equals(other: Literal): boolean {
        return (
            this.signal === other.signal &&
            this.position === other.position &&
            this.sign === other.sign
        );
    }

    compareTo(other: Literal): number {
        if (this.position !== other.position) {
            return this.position - other.position;
        }
        if (this.sign !== other.sign) {
            return this.sign ? 1 : -1;
        }
        const keyThis = Symbol.keyFor(this.signal);
        const keyOther = Symbol.keyFor(other.signal);
        if (keyThis === undefined || keyOther === undefined) {
            throw new Error("Invalid signal");
        }
        return keyThis.localeCompare(keyOther);
    }

    toCNF(): CNFClause {
        return new Conjunction([new Disjunction([this.copy()])]) as CNFClause;
    }

    toDNF(): DNFClause {
        return new Disjunction([new Conjunction([this.copy()])]) as DNFClause;
    }

    getComplexity(): number {
        return 1;
    }

    getDepth(): number {
        return 1;
    }

    transformLiterals(
        transformation: LiteralTransformation,
    ): Clause {
        return new Literal(
            transformation.signal(this.signal),
            transformation.position(this.position),
            this.sign
        );
    }

    renameSignal(oldSignal: Signal, newSignal: Signal): Clause {
        if (this.signal === oldSignal) {
            return new Literal(newSignal, this.position, this.sign);
        } else {
            return new Literal(this.signal, this.position, this.sign);
        }
    }
}

export class Negation extends Clause {
    subclause: Clause;

    constructor(subclause: Clause) {
        super();
        this.subclause = subclause;
    }

    eval(neighborhood: Neighborhood, context: EvalContext): boolean {
        return !this.subclause.eval(neighborhood, context);
    }

    toString(): string {
        return `!${this.subclause.toString()}`;
    }

    getLiterals(): Literal[] {
        return this.subclause
            .getLiterals()
            .map(
                (literal) =>
                    new Literal(literal.signal, literal.position, !literal.sign)
            );
    }

    // simplified(): Clause {
    //     if (this.subclause instanceof Negation) {
    //         return this.subclause.subclause.simplified();
    //     } else if (this.subclause instanceof Literal) {
    //         return new Literal(
    //             this.subclause.signal,
    //             this.subclause.position,
    //             !this.subclause.sign
    //         );
    //     }
    //     return super.simplified();
    // }

    /**
     * @returns a new Clause that is equivalent to the current clause but in
     * which all negations have been propagated down to the next level
     */
    reduce(): Clause {
        if (this.subclause instanceof Negation) {
            return this.subclause.subclause;
        } else if (this.subclause instanceof Conjunction) {
            return new Disjunction(
                this.subclause.subclauses.map(
                    (subclause) => new Negation(subclause)
                )
            );
        } else if (this.subclause instanceof Disjunction) {
            return new Conjunction(
                this.subclause.subclauses.map(
                    (subclause) => new Negation(subclause)
                )
            );
        } else if (this.subclause instanceof Literal) {
            return this.subclause.negated();
        }
        // this should never happen
        throw new Error("Invalid subclause type");
    }

    toCNF(): CNFClause {
        return this.reduce().toCNF();
    }

    toDNF(): DNFClause {
        return this.reduce().toDNF();
    }

    getComplexity(): number {
        return 1 + this.subclause.getComplexity();
    }

    getDepth(): number {
        return 1 + this.subclause.getDepth();
    }

    transformLiterals(
        transformation: LiteralTransformation,
    ): Clause {
        return new Negation(
            this.subclause.transformLiterals(transformation)
        );
    }

    renameSignal(oldSignal: Signal, newSignal: Signal): Clause {
        return new Negation(this.subclause.renameSignal(oldSignal, newSignal));
    }
}

/**
 * Representation of a conjunctive clause for rule conditions.
 * This evaluates to true if all the subclauses evaluate to true (empty conjunction evaluates to true).
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

    eval(neighborhood: Neighborhood, context: EvalContext): boolean {
        return this.subclauses.every((subclause) =>
            subclause.eval(neighborhood, context)
        );
    }

    toString(): string {
        return `(${this.subclauses
            .map((subclause) => subclause.toString())
            .join(" ")})`;
    }

    getLiterals(): Literal[] {
        return this.subclauses.flatMap((subclause) => subclause.getLiterals());
    }

    // simplified(): Clause {
    //     const newSubclauses = [];
    //     for (const subclause of this.subclauses) {
    //         if (subclause.isAlwaysTrue()) {
    //             continue; // skip TRUE subclauses
    //         } else if (subclause.isAlwaysFalse()) {
    //             return new Disjunction([]); // FALSE
    //         } else if (subclause instanceof Conjunction) {
    //             newSubclauses.push(...subclause.subclauses);
    //         } else {
    //             newSubclauses.push(subclause);
    //         }
    //     }

    //     if (newSubclauses.length === 1) {
    //         return this.subclauses[0];
    //     } else {
    //         return new Conjunction(newSubclauses);
    //     }
    // }

    isAlwaysTrue(): boolean {
        return this.subclauses.every((c) => c.isAlwaysTrue());
    }

    isAlwaysFalse(): boolean {
        return this.subclauses.some((c) => c.isAlwaysFalse());
    }

    toCNF(): CNFClause {
        const newSubclauses = this.subclauses.flatMap(
            (subclause) => subclause.toCNF().subclauses
        );
        return new Conjunction(newSubclauses) as CNFClause;
    }

    toDNF(): DNFClause {
        const dnfSubclauses = this.subclauses.map((subclause) =>
            subclause.toDNF()
        );
        return dnfSubclauses.reduce((acc, dnf) => {
            const clauses: ConjunctionOfLiterals[] = [];
            for (const subclause1 of acc.subclauses) {
                for (const subclause2 of dnf.subclauses) {
                    clauses.push(
                        new Conjunction([
                            ...subclause1.subclauses,
                            ...subclause2.subclauses,
                        ]) as ConjunctionOfLiterals
                    );
                }
            }
            return new Disjunction(clauses) as DNFClause;
        }, new Disjunction([new Conjunction([])]) as DNFClause);
    }

    getComplexity(): number {
        return (
            1 +
            this.subclauses.reduce(
                (acc, subclause) => acc + subclause.getComplexity(),
                0
            )
        );
    }

    getDepth(): number {
        return (
            1 +
            this.subclauses.reduce(
                (acc, subclause) => Math.max(acc, subclause.getDepth()),
                0
            )
        );
    }

    transformLiterals(
        transformation: LiteralTransformation,
    ): Clause {
        return new Conjunction(
            this.subclauses.map((subclause) =>
                subclause.transformLiterals(transformation)
            )
        );
    }

    renameSignal(oldSignal: Signal, newSignal: Signal): Clause {
        return new Conjunction(
            this.subclauses.map((subclause) =>
                subclause.renameSignal(oldSignal, newSignal)
            )
        );
    }
}

/**
 * Representation of a disjunctive clause for rule conditions.
 * This evaluates to true if at least one of the subclauses evaluate to true (empty disjunction evaluates to false).
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

    eval(neighborhood: Neighborhood, context: EvalContext): boolean {
        return this.subclauses.some((subclause) =>
            subclause.eval(neighborhood, context)
        );
    }

    toString(): string {
        return `[${this.subclauses
            .map((subclause) => subclause.toString())
            .join(" ")}]`;
    }

    getLiterals(): Literal[] {
        return this.subclauses.flatMap((subclause) => subclause.getLiterals());
    }

    // simplified(): Clause {
    //     const newSubclauses = [];
    //     for (const subclause of this.subclauses) {
    //         if (subclause.isAlwaysTrue()) {
    //             return new Conjunction([]); // TRUE
    //         } else if (subclause.isAlwaysFalse()) {
    //             continue; // skip FALSE subclauses
    //         } else if (subclause instanceof Disjunction) {
    //             newSubclauses.push(...subclause.subclauses);
    //         } else {
    //             newSubclauses.push(subclause);
    //         }
    //     }

    //     if (newSubclauses.length === 1) {
    //         return this.subclauses[0];
    //     } else {
    //         return new Disjunction(newSubclauses);
    //     }
    // }

    isAlwaysTrue(): boolean {
        return this.subclauses.some((c) => c.isAlwaysTrue());
    }

    isAlwaysFalse(): boolean {
        return this.subclauses.every((c) => c.isAlwaysFalse());
    }

    toDNF(): DNFClause {
        const newSubClauses = this.subclauses.flatMap(
            (subclause) => subclause.toDNF().subclauses
        );
        return new Disjunction(newSubClauses) as DNFClause;
    }

    toCNF(): CNFClause {
        const cnfSubclauses = this.subclauses.map((subclause) =>
            subclause.toCNF()
        );
        return cnfSubclauses.reduce((acc, cnf) => {
            const clauses: DisjunctionOfLiterals[] = [];
            for (const subclause1 of acc.subclauses) {
                for (const subclause2 of cnf.subclauses) {
                    clauses.push(
                        new Disjunction([
                            ...subclause1.subclauses,
                            ...subclause2.subclauses,
                        ]) as DisjunctionOfLiterals
                    );
                }
            }
            return new Conjunction(clauses) as CNFClause;
        }, new Conjunction([new Disjunction([])]) as CNFClause);
    }

    getComplexity(): number {
        return (
            1 +
            this.subclauses.reduce(
                (acc, subclause) => acc + subclause.getComplexity(),
                0
            )
        );
    }

    getDepth(): number {
        return (
            1 +
            this.subclauses.reduce(
                (acc, subclause) => Math.max(acc, subclause.getDepth()),
                0
            )
        );
    }

    transformLiterals(
        transformation: LiteralTransformation,
    ): Clause {
        return new Disjunction(
            this.subclauses.map((subclause) =>
                subclause.transformLiterals(transformation)
            )
        );
    }

    renameSignal(oldSignal: Signal, newSignal: Signal): Clause {
        return new Disjunction(
            this.subclauses.map((subclause) =>
                subclause.renameSignal(oldSignal, newSignal)
            )
        );
    }
}

export function simplifyConjunctionOfLiterals(
    c: ConjunctionOfLiterals
): ConjunctionOfLiterals | null {
    const literals: Literal[] = [];
    for (const literal of c.subclauses) {
        if (literals.some((l) => l.equals(literal))) {
            continue;
        }
        if (literals.some((l) => l.equals(literal.negated()))) {
            return null;
        }
        literals.push(literal);
    }
    literals.sort((l1, l2) => l1.compareTo(l2));
    return new Conjunction(literals) as ConjunctionOfLiterals;
}

export function simplifyDNF(clause: DNFClause): DNFClause {
    const subclauses: ConjunctionOfLiterals[] = [];
    for (const subclause of clause.subclauses) {
        const simplified = simplifyConjunctionOfLiterals(subclause);
        if (simplified !== null) {
            subclauses.push(simplified);
        }
    }
    return new Disjunction(subclauses) as DNFClause;
}
