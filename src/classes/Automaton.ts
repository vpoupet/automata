import { Signal } from "../types.ts";
import { EvalContext } from "./Clause.ts";
import { Configuration } from "./Configuration.ts";
import { Rule } from "./Rule.ts";

export class Automaton {
    multiSignals: Map<symbol, Set<Signal>>;
    /**
     * List of rules of the automaton (the rules are executed on each cell in the order they appear in the list)
     */
    rules: Rule[];
    minNeighbor: number;
    maxNeighbor: number;
    /**
     * Number of steps that are computed ahead of time. This is 1 by default but if some rules affect times further down
     * (e.g. a 0/2 rule will add a signal to the cell two steps ahead) it is necessary to start preparing the
     * configuration at time (t + maxFutureSteps) when applying the rules to the configuration at time t.
     * This value is automatically updated when parsing the rules.
     */
    maxFutureDepth: number;

    constructor(
        rules: Rule[] = [],
        multiSignals: Map<symbol, Set<Signal>> = new Map()
    ) {
        this.minNeighbor = 0;
        this.maxNeighbor = 0;
        this.maxFutureDepth = 1;
        this.rules = rules;
        this.multiSignals = multiSignals;
        this.updateParameters();
    }

    getEvalContext(): EvalContext {
        return new EvalContext(this.multiSignals);
    }

    private updateParameters() {
        this.minNeighbor = Infinity;
        this.maxNeighbor = -Infinity;
        this.maxFutureDepth = 1;
        const evalContext = this.getEvalContext();

        for (const rule of this.rules) {
            for (const output of rule.outputs) {
                this.maxFutureDepth = Math.max(
                    this.maxFutureDepth,
                    output.futureStep
                );
            }
            for (const literal of rule.condition.getLiterals(evalContext, false)) {
                this.minNeighbor = Math.min(this.minNeighbor, literal.position);
                this.maxNeighbor = Math.max(this.maxNeighbor, literal.position);
            }
        }
        if (this.minNeighbor === Infinity) this.minNeighbor = 0;
        if (this.maxNeighbor === -Infinity) this.maxNeighbor = 0;
    }

    setRules(rules: Rule[]): Automaton {
        this.rules = rules;
        this.updateParameters();
        return this;
    }

    /**
     * Returns a space-time diagram from a starting configuration
     */
    makeDiagram(
        initialConfiguration: Configuration,
        nbSteps: number
    ): Configuration[] {
        const nbCells = initialConfiguration.getSize();
        const diagram = [initialConfiguration];
        const evalContext = this.getEvalContext();

        for (let i = 0; i < nbSteps; i++) {
            diagram.push(Configuration.withSize(nbCells));
        }
        for (let t = 0; t < nbSteps; t++) {
            const config = diagram[t];
            for (let c = 0; c < nbCells; c++) {
                const neighborhood = config.getNeighborhood(
                    c,
                    this.minNeighbor,
                    this.maxNeighbor
                );
                for (const rule of this.rules) {
                    if (rule.condition.eval(neighborhood, evalContext)) {
                        rule.outputs.forEach((output) => {
                            const targetCell = c + output.neighbor;
                            if (
                                t + output.futureStep < diagram.length &&
                                0 <= targetCell &&
                                targetCell < nbCells
                            ) {
                                diagram[t + output.futureStep].cells[
                                    targetCell
                                ].addSignal(output.signal);
                            }
                        });
                    }
                }
            }
        }
        return diagram;
    }

    getRules(): Rule[] {
        return this.rules;
    }

    renameSignal(oldSignal: Signal, newSignal: Signal): Automaton {
        return new Automaton(
            this.rules.map((rule) => rule.renameSignal(oldSignal, newSignal))
        );
    }

    toString(): string {
        return this.rules.map((rule) => rule.toString()).join("\n");
    }
}
