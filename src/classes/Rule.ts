import { Neighborhood, Signal } from "../types";
import { Cell } from "./Cell";
import {
    Clause,
    Conjunction,
    ConjunctionOfLiterals,
    Negation,
    simplifyDNF,
} from "./Clause";

export class RuleOutput {
    neighbor: number;
    signal: Signal;
    futureStep: number;

    constructor(neighbor: number, signal: Signal, futureStep = 1) {
        this.neighbor = neighbor;
        this.signal = signal;
        this.futureStep = futureStep;
    }

    toString(): string {
        if (this.futureStep === 1) {
            return `${this.neighbor}.${Symbol.keyFor(this.signal)}`;
        } else {
            return `${this.neighbor}/${this.futureStep}.${Symbol.keyFor(
                this.signal
            )}`;
        }
    }

    equals(other: RuleOutput): boolean {
        return (
            this.neighbor === other.neighbor &&
            this.signal === other.signal &&
            this.futureStep === other.futureStep
        );
    }

    renameSignal(oldSymbol: Signal, newSymbol: Signal): RuleOutput {
        return new RuleOutput(
            this.neighbor,
            this.signal === oldSymbol ? newSymbol : this.signal,
            this.futureStep
        );
    }
}

/**
 * Representation of a cellular automaton rule.
 * A rule consists of two parts: a condition and a list of signal outputs. Outputs are a list of objects
 * {neighbor: {int}, signal: {int}, futureStep: {int}}
 *
 * When executing the rule on a cell c at time t, the condition is evaluated (it depends on the set of signals
 * on the cell). If it is true, then for each output {neighbor, signal, futureStep}, the signal `signal` is added to
 * the cell (c + `neighbor`) at time (t + `futureStep`) in the space-time diagram.
 *
 * In order to correspond to a cellular automaton, `futureStep` should be either strictly positive or can be 0 if
 * `neighbor` is also 0.
 */
export class Rule {
    condition: Clause;
    outputs: RuleOutput[];

    constructor(condition: Clause, outputs: RuleOutput[]) {
        this.condition = condition;
        this.outputs = outputs;
    }

    toString() {
        return `${this.condition.toString()}: ${this.outputs
            .map((output) => output.toString())
            .join(" ")}`;
    }

    getSignals(): Set<Signal> {
        const signals = new Set<Signal>();
        for (const literal of this.condition.getLiterals()) {
            signals.add(literal.signal);
        }
        for (const output of this.outputs) {
            signals.add(output.signal);
        }
        return signals;
    }

    renameSignal(oldSignal: Signal, newSignal: Signal): Rule {
        return new Rule(
            this.condition.renameSignal(oldSignal, newSignal),
            this.outputs.map((output) => output.renameSignal(oldSignal, newSignal))
        );
    }
}

export type ConjunctionRule = Rule & { condition: ConjunctionOfLiterals };

export function adaptRule(
    rule: ConjunctionRule,
    target: ConjunctionRule
): {
    rules: ConjunctionRule[];
    outputs: Set<RuleOutput>;
} {
    const outputs = new Set<RuleOutput>();
    // create the neighborhood to test if the rule matches the targetRule condition
    const neighborhood: Neighborhood = {};
    for (const literal of target.condition.subclauses) {
        if (neighborhood[literal.position] === undefined) {
            neighborhood[literal.position] = new Cell();
        }
        neighborhood[literal.position].addSignal(literal.signal);
    }
    for (const literal of rule.condition.subclauses) {
        if (neighborhood[literal.position] === undefined) {
            neighborhood[literal.position] = new Cell();
        }
    }

    if (!rule.condition.eval(neighborhood)) {
        // the rule does not match the targetRule condition, no change required
        return { rules: [rule], outputs: outputs };
    }

    const newRules: ConjunctionRule[] = [];
    const validOutputs: RuleOutput[] = [];
    const invalidOutputs: RuleOutput[] = [];
    for (const output of rule.outputs) {
        let isValid = false;
        for (const targetOutput of target.outputs) {
            if (output.equals(targetOutput)) {
                isValid = true;
                outputs.add(targetOutput);
                break;
            }
        }
        if (isValid) {
            validOutputs.push(output);
        } else {
            invalidOutputs.push(output);
        }
    }

    if (validOutputs.length > 0) {
        // keep the rule for outputs that remain valid
        newRules.push(
            new Rule(rule.condition, validOutputs) as ConjunctionRule
        );
    }
    if (invalidOutputs.length > 0) {
        // create new rules for the invalid outputs
        const condition = simplifyDNF(
            new Conjunction([
                rule.condition,
                new Negation(target.condition),
            ]).toDNF()
        );
        for (const conjunction of condition.subclauses) {
            newRules.push(
                new Rule(conjunction, invalidOutputs) as ConjunctionRule
            );
        }
    }
    return { rules: newRules, outputs: outputs };
}
