import nearley from "nearley";
import grammar from "../grammar/grammar.js";
import type { ParsedLine } from "../grammar/types.ts";
import type { Signal } from "../types.ts";
import Clause, { Conjunction, EvalContext } from "./Clause.ts";
import Configuration from "./Configuration.ts";
import Rule from "./Rule.ts";
import { transformations } from "./transformations/Transformation.ts";

export default class Automaton {
    signals: Set<Signal>;
    multiSignals: Map<Signal, Set<Signal>>;
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
        multiSignals: Map<Signal, Set<Signal>> = new Map()
    ) {
        this.rules = rules;
        this.multiSignals = multiSignals;

        this.signals = new Set([]);
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

            for (const literal of rule.condition.getLiterals()) {
                this.minNeighbor = Math.min(this.minNeighbor, literal.position);
                this.maxNeighbor = Math.max(this.maxNeighbor, literal.position);
            }

            for (const signal of rule.getSignals()) {
                this.signals.add(signal);
            }
        }

        for (const [signal, subSignals] of this.multiSignals.entries()) {
            this.signals.add(signal);
            for (const subSignal of subSignals) {
                this.signals.add(subSignal);
            }
        }

        if (this.minNeighbor === Infinity) this.minNeighbor = 0;
        if (this.maxNeighbor === -Infinity) this.maxNeighbor = 0;
    }

    getEvalContext(): EvalContext {
        return new EvalContext(this.multiSignals);
    }

    copyEvalContext(): EvalContext {
        return new EvalContext(new Map(this.multiSignals));
    }

    getSignalsList(extraSignals?: Set<Signal>): Signal[] {
        if (extraSignals === undefined) {
            extraSignals = new Set();
        }

        return Array.from(this.signals.union(extraSignals)).sort((a, b) => {
            const descriptionA = a.description || "";
            const descriptionB = b.description || "";
            return descriptionA.localeCompare(descriptionB);
        });
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

            for (const literal of rule.condition.getLiterals()) {
                this.minNeighbor = Math.min(this.minNeighbor, literal.position);
                this.maxNeighbor = Math.max(this.maxNeighbor, literal.position);
            }

            for (const signal of rule.getSignals()) {
                this.signals.add(signal);
            }
        }

        for (const [signal, subSignals] of this.multiSignals.entries()) {
            this.signals.add(signal);
            for (const subSignal of subSignals) {
                this.signals.add(subSignal);
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

    parseRules(inputString: string): Automaton {
        let context = this.copyEvalContext();
        const parser = new nearley.Parser(
            nearley.Grammar.fromCompiled(grammar)
        );
        try {
            parser.feed(inputString);
            if (parser.results.length !== 1) {
                throw new Error("Ambiguous grammar!");
            }
        } catch (e) {
            console.log(e);
        }
        const outputLines = parser.results[0] as ParsedLine[];
        const functionsStack: {
            name: string | undefined;
            parameters: string[];
            rules: Rule[];
        }[] = [
            {
                name: undefined,
                parameters: [],
                rules: [],
            },
        ];
        let rules = functionsStack[0].rules;
        const conditionsStack: { condition: Clause; indent: number }[] = [];
        for (const line of outputLines) {
            if (line.type !== "empty_line") {
                // remove irrelevant conditions from stack
                while (
                    conditionsStack.length > 0 &&
                    conditionsStack[0].indent >= line.indent
                ) {
                    conditionsStack.shift();
                }
            }
            switch (line.type) {
                case "rule_line": {
                    let condition: Clause;
                    if (line.condition !== undefined) {
                        if (conditionsStack.length === 0) {
                            condition = line.condition;
                        } else {
                            condition = new Conjunction([
                                conditionsStack[0].condition,
                                line.condition,
                            ]);
                        }
                        conditionsStack.unshift({
                            condition,
                            indent: line.indent,
                        });
                    } else {
                        condition = conditionsStack[0].condition;
                    }
                    if (line.outputs !== undefined) {
                        rules.push(new Rule(condition, line.outputs));
                    }
                    break;
                }
                case "begin_function": {
                    functionsStack.unshift({
                        name: line.function_name,
                        parameters: line.parameters,
                        rules: [],
                    });
                    rules = functionsStack[0].rules;
                    break;
                }
                case "end_function": {
                    const functionData = functionsStack.shift(); // pop stack frame
                    if (
                        functionData === undefined ||
                        functionData.name === undefined
                    ) {
                        throw new Error("Not currently in a function");
                    }
                    const transformation = transformations.get(
                        functionData.name
                    );
                    if (transformation === undefined) {
                        throw new Error(
                            `Unknown transformation: ${functionData.name}`
                        );
                    }

                    const { rules: newRules, context: newContext } =
                        transformation(rules, context, functionData.parameters);

                    context = newContext;
                    rules = functionsStack[0].rules;
                    rules.push(...newRules);
                    break;
                }
                case "multi_signal": {
                    context.multiSignals.set(line.signal, new Set(line.values));
                    break;
                }
                case "empty_line":
                    break;
            }
        }
        if (functionsStack.length > 1) {
            throw new Error("Function not closed");
        }
        return new Automaton(rules, context.multiSignals);
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

    replaceSignal(oldSignal: Signal, newSignal: Signal): Automaton {
        return new Automaton(
            this.rules.map((rule) => rule.replaceSignal(oldSignal, newSignal))
        );
    }

    toString(): string {
        return this.rules.map((rule) => rule.toString()).join("\n");
    }
}
