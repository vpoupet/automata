import type { Signal } from "../types";
import Clause, {
    Conjunction,
    ConjunctionOfLiterals,
    Disjunction,
    EvalContext,
    Negation,
} from "./Clause";
import Configuration from "./Configuration";
import RuleGrid from "./RuleGrid";

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

    compare(other: RuleOutput): number {
        if (this.futureStep !== other.futureStep) {
            return this.futureStep - other.futureStep;
        }
        if (this.position !== other.position) {
            return this.position - other.position;
        }
        const s1 = Symbol.keyFor(this.signal) || "";
        const s2 = Symbol.keyFor(other.signal) || "";
        return s1.localeCompare(s2);
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

    fitTarget(targetGrid: RuleGrid, context: EvalContext): Rule[] {
        const targetRule = targetGrid.makeRule();
        const minPosition = targetRule.condition.getMinPosition();
        const maxPosition = targetRule.condition.getMaxPosition();
        const configuration = new Configuration(targetGrid.inputCells);
        const gridWidth = targetGrid.inputCells.length;

        const validOutputs = new Set(this.outputs);
        const invalidOutputs = new Map<RuleOutput, number[]>();

        for (let c = -minPosition; c < gridWidth - minPosition; c++) {
            const neighborhood = configuration.getNeighborhood(
                c,
                minPosition,
                maxPosition
            );
            if (this.condition.eval(neighborhood, context)) {
                for (const output of this.outputs) {
                    if (
                        0 <= c + output.position &&
                        c + output.position < gridWidth &&
                        0 < output.futureStep &&
                        output.futureStep <= targetGrid.outputCells.length
                    ) {
                        if (
                            !targetGrid.outputCells[output.futureStep - 1][
                                c + output.position
                            ].has(output.signal)
                        ) {
                            validOutputs.delete(output);
                            if (!invalidOutputs.has(output)) {
                                invalidOutputs.set(output, []);
                            }
                            invalidOutputs.get(output)!.push(c);
                        }
                    }
                }
            }
        }
        if (validOutputs.size === this.outputs.length) {
            // no need to change the rule
            return [this];
        } else {
            const resultingRules = [];
            if (validOutputs.size > 0) {
                resultingRules.push(
                    new Rule(this.condition, Array.from(validOutputs))
                );
            }
            const gridInputsConjunction = targetGrid.makeRuleCondition(false);
            for (const [output, positions] of invalidOutputs) {
                resultingRules.push(
                    new Rule(
                        new Conjunction([
                            this.condition,
                            new Negation(
                                new Disjunction(
                                    positions.map((p) =>
                                        gridInputsConjunction.shifted(-p)
                                    )
                                )
                            ),
                        ]).simplified(),
                        [output]
                    )
                );
            }
            return resultingRules;
        }
    }
}

export type ConjunctionRule = Rule & { condition: ConjunctionOfLiterals };
