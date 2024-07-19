import { Signal } from "../types.ts";
import { Clause, Conjunction } from "./Clause.ts";
import { Configuration } from "./Configuration.ts";
import { Rule, RuleOutput } from "./Rule.ts";

export class Automaton {
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

    constructor(rules: Rule[] = []) {
        this.minNeighbor = 0;
        this.maxNeighbor = 0;
        this.maxFutureDepth = 1;
        this.rules = rules;
        this.updateParameters();
    }

    private updateParameters() {
        this.minNeighbor = Infinity;
        this.maxNeighbor = -Infinity;
        this.maxFutureDepth = 1;
        for (const rule of this.rules) {
            for (const output of rule.outputs) {
                this.maxFutureDepth = Math.max(
                    this.maxFutureDepth,
                    output.futureStep
                );
            }
            for (const literal of rule.condition.getLiterals()) {
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

    parseRules(rulesString: string): Automaton {
        this.rules = [];
        const conditionsStack: { condition: Clause; indent: number }[] = [];
        for (let line of rulesString.split("\n")) {
            const indent = line.search(/\S|$/); // indentation of current line
            line = line.replace(/#.*/, "").trim(); // remove comments and whitespace
            if (line.length === 0) continue;

            let conditionString: string | undefined;
            let outputsString: string;
            if (line.includes(":")) {
                // line has a condition and possible outputs
                [conditionString, outputsString] = line.split(":");
            } else {
                // line has only outputs
                outputsString = line;
            }
            let condition: Clause;
            let outputs: RuleOutput[];
            while (
                conditionsStack.length > 0 &&
                conditionsStack[0].indent >= indent
            ) {
                // remove irrelevant conditions from stack
                conditionsStack.shift();
            }

            // prepare condition
            if (conditionString) {
                // parse condition from line
                const lineCondition = Clause.fromString(conditionString);
                if (conditionsStack.length === 0) {
                    condition = lineCondition;
                } else {
                    condition = new Conjunction([
                        conditionsStack[0].condition,
                        lineCondition,
                    ]);
                }
                conditionsStack.unshift({ condition, indent }); // push condition to stack
            } else {
                // get parent condition from stack
                condition = conditionsStack[0].condition;
            }

            if (outputsString) {
                // parse outputs from line
                outputs = this.parseOutputs(outputsString);
                this.rules.push(new Rule(condition, outputs));
            }
        }
        this.updateParameters();
        return this;
    }

    parseOutputs(outputsString: string): RuleOutput[] {
        const outputs: RuleOutput[] = [];
        for (const outputString of outputsString.trim().split(/\s+/)) {
            if (outputString.includes(".")) {
                let futureStep = 1;
                let futureStepString: string;
                const outputSplit = outputString.split(".");
                let neighborString = outputSplit[0];
                const signalName = outputSplit[1];
                if (neighborString.includes("/")) {
                    [neighborString, futureStepString] =
                        neighborString.split("/");
                    futureStep = parseInt(futureStepString);
                }
                const neighbor =
                    neighborString === "" ? 0 : parseInt(neighborString);
                outputs.push(
                    new RuleOutput(neighbor, Symbol.for(signalName), futureStep)
                );
            } else {
                outputs.push(new RuleOutput(0, Symbol.for(outputString), 1));
            }
        }
        return outputs;
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
                    if (rule.condition.eval(neighborhood)) {
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
