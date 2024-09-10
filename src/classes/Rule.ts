import type { Neighborhood, Signal } from "../types";
import Cell from "./Cell";
import Clause, {
    Conjunction,
    ConjunctionOfLiterals,
    EvalContext,
    Negation
} from "./Clause";

export class RuleOutput {
    position: number;
    signal: Signal;
    futureStep: number;

    constructor(position: number, signal: Signal, futureStep = 1) {
        this.position = position;
        this.signal = signal;
        this.futureStep = futureStep;
    }

    toString(): string {
        const positionStr = this.position === 0 ? "" : `${this.position}`;
        const futureStepStr =
            this.futureStep === 1 ? "" : `/${this.futureStep}`;
        const dotStr = positionStr !== "" || futureStepStr !== "" ? "." : "";

        return `${positionStr}${futureStepStr}${dotStr}${Symbol.keyFor(
            this.signal
        )}`;
    }

    equals(other: RuleOutput): boolean {
        return (
            this.position === other.position &&
            this.signal === other.signal &&
            this.futureStep === other.futureStep
        );
    }

    renameSignal(oldSymbol: Signal, newSymbol: Signal): RuleOutput {
        return new RuleOutput(
            this.position,
            this.signal === oldSymbol ? newSymbol : this.signal,
            this.futureStep
        );
    }
}

/**
 * Representation of a cellular automaton rule.
 * A rule consists of two parts: a condition and a list of signal outputs. Outputs are a list of objects
 * {position: {int}, signal: {int}, futureStep: {int}}
 *
 * When executing the rule on a cell c at time t, the condition is evaluated (it depends on the set of signals
 * on the cell). If it is true, then for each output {position, signal, futureStep}, the signal `signal` is added to
 * the cell (c + `position`) at time (t + `futureStep`) in the space-time diagram.
 *
 * In order to correspond to a cellular automaton, `futureStep` should be either strictly positive or can be 0 if
 * `position` is also 0.
 */
export default class Rule {
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

    replaceSignal(oldSignal: Signal, newSignal: Signal): Rule {
        return new Rule(
            this.condition.renameSignal(oldSignal, newSignal),
            this.outputs.map((output) =>
                output.renameSignal(oldSignal, newSignal)
            )
        );
    }

    fitTarget(
        target: ConjunctionRule,
        context: EvalContext
    ): { rules: Rule[]; matchedOutputs: Set<RuleOutput> } {
        const matchedOutputs = new Set<RuleOutput>();
        // create the neighborhood to test if the rule matches the targetRule condition
        const neighborhood: Neighborhood = {};
        for (const literal of target.condition.subclauses) {
            if (neighborhood[literal.position] === undefined) {
                neighborhood[literal.position] = new Cell();
            }
            neighborhood[literal.position].addSignal(literal.signal);
        }

        if (!this.condition.eval(neighborhood, context)) {
            // the rule does not match the targetRule condition, no change required
            return { rules: [this], matchedOutputs };
        }

        const validOutputs: RuleOutput[] = [];
        const invalidOutputs: RuleOutput[] = [];
        for (const output of this.outputs) {
            let isValid = false;
            for (const targetOutput of target.outputs) {
                if (output.equals(targetOutput)) {
                    isValid = true;
                    matchedOutputs.add(targetOutput);
                    break;
                }
            }
            if (isValid) {
                validOutputs.push(output);
            } else {
                invalidOutputs.push(output);
            }
        }

        const newRules: Rule[] = [];
        if (validOutputs.length > 0) {
            // keep the rule for outputs that remain valid
            newRules.push(new Rule(this.condition, validOutputs));
        }
        if (invalidOutputs.length > 0) {
            // create a new rules for the invalid outputs
            const condition = new Conjunction([
                this.condition,
                new Negation(target.condition),
            ]).simplified();
            newRules.push(new Rule(condition, invalidOutputs));
        }
        return { rules: newRules, matchedOutputs };
    }
}

export type ConjunctionRule = Rule & { condition: ConjunctionOfLiterals };
