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
    multiSignalLiterals: Map<symbol, Set<Signal>>;

    constructor() {
        this.multiSignalLiterals = new Map();
    }
}

export type LiteralTransformation = {
    signal: (Signal: Signal) => Signal;
    position: (position: number) => number;
};

class ClauseParsingException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ClauseParsingException";
    }
}

export abstract class Clause {
    abstract eval(neighborhood: Neighborhood, context: EvalContext): boolean;

    abstract toString(): string;

    abstract getLiterals(context: EvalContext): Literal[];

    abstract toCNF(): CNFClause;

    abstract toDNF(): DNFClause;

    abstract renameSignal(oldSignal: Signal, newSignal: Signal): Clause;

    abstract transformLiterals(
        transformation: LiteralTransformation,
        context: EvalContext
    ): Clause;

    private static readTokens(conditionTokens: string[]): Clause {
        const token = conditionTokens.shift();
        if (token === undefined) {
            return new Conjunction([]);
        }
        const subclauses: Clause[] = [];
        let negatedCondition: Clause;
        switch (token) {
            case "(":
                while (conditionTokens[0] !== ")") {
                    if (conditionTokens.length === 0) {
                        throw new ClauseParsingException(
                            "Unbalanced parentheses in condition"
                        );
                    }
                    subclauses.push(this.readTokens(conditionTokens));
                }
                conditionTokens.shift();
                if (subclauses.length === 1) {
                    // conjunction with only one subclause
                    return subclauses[0];
                } else {
                    return new Conjunction(subclauses);
                }
            case "[":
                while (conditionTokens[0] !== "]") {
                    if (conditionTokens.length === 0) {
                        throw new ClauseParsingException(
                            "Unbalanced parentheses in condition"
                        );
                    }
                    subclauses.push(this.readTokens(conditionTokens));
                }
                conditionTokens.shift();
                if (subclauses.length === 1) {
                    // disjunction with only one subclause
                    return subclauses[0];
                } else {
                    return new Disjunction(subclauses);
                }
            case "!":
                negatedCondition = this.readTokens(conditionTokens);
                if (negatedCondition instanceof Negation) {
                    return negatedCondition.subclause;
                } else if (negatedCondition instanceof Literal) {
                    return negatedCondition.negate();
                } else {
                    return new Negation(negatedCondition);
                }
            default:
                if (token.includes(".")) {
                    const [position, signal] = token.split(".");
                    if (signal === undefined) {
                        throw new ClauseParsingException("Invalid condition");
                    }
                    const signalSymbol = Symbol.for(signal);
                    if (signalSymbol === undefined) {
                        throw new ClauseParsingException("Invalid signal");
                    }
                    if (signal.startsWith("$")) {
                        return new MultiSignalLiteral(
                            signalSymbol,
                            parseInt(position)
                        );
                    } else {
                        return new Literal(
                            signalSymbol,
                            parseInt(position),
                            true
                        );
                    }
                } else {
                    if (token.startsWith("$")) {
                        return new MultiSignalLiteral(Symbol.for(token));
                    } else {
                        return new Literal(Symbol.for(token));
                    }
                }
        }
    }

    static fromString(s: string): Clause {
        const tokens = s.match(/(\(|\)|\[|\]|!|[\w+-.$]+)/g);
        if (tokens === null) {
            throw new ClauseParsingException("Invalid condition");
        }
        const condition = this.readTokens(tokens);
        if (tokens.length > 0) {
            throw new ClauseParsingException("Invalid condition");
        }
        return condition;
    }
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

    eval(neighborhood: Neighborhood, _context: EvalContext): boolean {
        return this.sign === neighborhood[this.position].has(this.signal);
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

    getLiterals(_context: EvalContext): Literal[] {
        return [this];
    }

    copy(): Literal {
        return new Literal(this.signal, this.position, this.sign);
    }

    negate(): Literal {
        return new Literal(this.signal, this.position, !this.sign);
    }

    equals(other: Clause): boolean {
        if (!(other instanceof Literal)) {
            return false;
        }
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

    transformLiterals(
        transformation: LiteralTransformation,
        _context: EvalContext
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

    getLiterals(context: EvalContext): Literal[] {
        return this.subclause
            .getLiterals(context)
            .map(
                (literal) =>
                    new Literal(literal.signal, literal.position, !literal.sign)
            );
    }

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
            return this.subclause.negate();
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

    transformLiterals(
        transformation: LiteralTransformation,
        context: EvalContext
    ): Clause {
        return new Negation(
            this.subclause.transformLiterals(transformation, context)
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

    getLiterals(context: EvalContext): Literal[] {
        return this.subclauses.flatMap((subclause) =>
            subclause.getLiterals(context)
        );
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

    transformLiterals(
        transformation: LiteralTransformation,
        context: EvalContext
    ): Clause {
        return new Conjunction(
            this.subclauses.map((subclause) =>
                subclause.transformLiterals(transformation, context)
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

    getLiterals(context: EvalContext): Literal[] {
        return this.subclauses.flatMap((subclause) =>
            subclause.getLiterals(context)
        );
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

    transformLiterals(
        transformation: LiteralTransformation,
        context: EvalContext
    ): Clause {
        return new Disjunction(
            this.subclauses.map((subclause) =>
                subclause.transformLiterals(transformation, context)
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

export class MultiSignalLiteral extends Literal {
    constructor(signal: Signal, position = 0, sign = true) {
        super(signal, position, sign);
    }

    getSignals(context: EvalContext): Set<Signal> {
        const signals = context.multiSignalLiterals.get(this.signal);
        if (signals === undefined) {
            throw new Error("Invalid multi-signal");
        }
        return signals;
    }

    eval(neighborhood: Neighborhood, context: EvalContext): boolean {
        const signals = this.getSignals(context);

        const cellSignals = neighborhood[this.position].signals;
        for (const signal of signals) {
            if (cellSignals.has(signal)) {
                return this.sign;
            }
        }
        return !this.sign;
    }

    getLiterals(context: EvalContext): Literal[] {
        const signals = this.getSignals(context);
        return Array.from(signals).map(
            (signal) => new Literal(signal, this.position)
        );
    }

    copy(): MultiSignalLiteral {
        return new MultiSignalLiteral(this.signal, this.position, this.sign);
    }

    negate(): MultiSignalLiteral {
        return new MultiSignalLiteral(this.signal, this.position, !this.sign);
    }

    asDisjunctionOfLiterals(context: EvalContext): DisjunctionOfLiterals {
        return new Disjunction(
            Array.from(this.getSignals(context)).map(
                (signal) => new Literal(signal, this.position)
            )
        ) as DisjunctionOfLiterals;
    }

    toCNF(): CNFClause {
        return new Conjunction([new Disjunction([this.copy()])]) as CNFClause;
    }

    toDNF(): DNFClause {
        return new Disjunction([new Conjunction([this.copy()])]) as DNFClause;
    }

    transformLiterals(
        transformation: LiteralTransformation,
        context: EvalContext
    ): Clause {
        const newSignal = transformation.signal(this.signal);
        if (newSignal != this.signal) {
            const signals = this.getSignals(context);
            const newSignals = new Set(
                Array.from(signals).map((signal) =>
                    transformation.signal(signal)
                )
            );
            context.multiSignalLiterals.set(newSignal, newSignals);
        }
        return new MultiSignalLiteral(
            transformation.signal(this.signal),
            transformation.position(this.position),
            this.sign
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
        if (literals.some((l) => l.equals(literal.negate()))) {
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
