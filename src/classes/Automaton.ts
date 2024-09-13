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
    ruleNames: Set<string>;
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
        multiSignals: Map<Signal, Set<Signal>> = new Map(),
        signals: Set<Signal> = new Set(),
        minNeighbor: number = Infinity,
        maxNeighbor: number = -Infinity,
        maxFutureDepth: number = 1,
        shouldUpdateParameters: boolean = true
    ) {
        this.rules = [];
        this.ruleNames = new Set();
        for (const rule of rules) {
            if (rule.condition.isAlwaysFalse()) {
                // skip rules that never apply
                continue;
            }

            const conditionName = rule.condition.toString();
            const ruleName = rule.toString();
            if (this.ruleNames.has(ruleName)) {
                // skip duplicate rules
                continue;
            }

            // check if the rule should be merged with an existing rule having same condition
            let didMerge = false;
            for (const [i, otherRule] of this.rules.entries()) {
                if (otherRule.condition.toString() === conditionName) {
                    // add outputs to existing rule
                    const newOutputs = [...otherRule.outputs];
                    for (const output of rule.outputs) {
                        if (!newOutputs.some((o) => o.equals(output))) {
                            newOutputs.push(output);
                        }
                    }
                    const mergedRule = new Rule(rule.condition, newOutputs);
                    this.rules.splice(i, 1, mergedRule);
                    this.ruleNames.delete(otherRule.toString());
                    this.ruleNames.add(mergedRule.toString());
                    didMerge = true;
                    break;
                }
            }
            // if the rule was not merged, add it to the list
            if (!didMerge) {
                this.rules.push(rule);
                this.ruleNames.add(ruleName);
            }
        }

        this.multiSignals = multiSignals;
        this.signals = signals;
        this.minNeighbor = minNeighbor;
        this.maxNeighbor = maxNeighbor;
        this.maxFutureDepth = maxFutureDepth;

        if (shouldUpdateParameters) {
            this.updateParameters();
        }
    }

    private updateParameters() {
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

    clone(): Automaton {
        return new Automaton(
            this.rules,
            this.multiSignals,
            this.signals,
            this.minNeighbor,
            this.maxNeighbor,
            this.maxFutureDepth,
            false
        );
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

    addRulesFromString(inputString: string): Automaton {
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

        if (rules.length === 0) {
            return this;
        }

        return new Automaton([...this.rules, ...rules], context.multiSignals);
    }

    hasRule(rule: Rule): boolean {
        return this.ruleNames.has(rule.toString());
    }

    addRule(rule: Rule): Automaton {
        if (this.hasRule(rule)) {
            return this;
        }
        return new Automaton([...this.rules, rule], this.multiSignals);
    }

    addRules(rules: Rule[]): Automaton {
        if (rules.length === 0) {
            return this;
        }
        return new Automaton([...this.rules, ...rules], this.multiSignals);
    }

    deleteRule(rule: Rule): Automaton {
        return new Automaton(
            this.rules.filter((r) => r !== rule),
            this.multiSignals
        );
    }

    replaceRule(oldRule: Rule, newRules: Rule[]) {
        const newRulesNames = new Set(newRules.map((r) => r.toString()));
        if (newRulesNames.has(oldRule.toString())) {
            // keep the old rule
            return this.addRules(newRules.filter((r) => !this.hasRule(r)));
        }

        const resultingRules = [];
        for (const rule of this.rules) {
            if (rule !== oldRule) {
                resultingRules.push(rule);
            } else {
                resultingRules.push(...newRules);
            }
        }
        return new Automaton(resultingRules, this.multiSignals);
    }

    applyRules(
        configuration: Configuration,
        rules: Rule[] | undefined = undefined
    ): Configuration[] {
        if (rules === undefined) {
            rules = this.rules;
        }

        const nbCells = configuration.getSize();
        const nextConfigurations = Array.from(
            { length: this.maxFutureDepth },
            () => Configuration.withSize(nbCells)
        );
        const evalContext = this.getEvalContext();

        for (let c = -this.maxNeighbor; c < nbCells - this.minNeighbor; c++) {
            const neighborhood = configuration.getNeighborhood(
                c,
                this.minNeighbor,
                this.maxNeighbor
            );
            for (const rule of rules) {
                if (rule.condition.eval(neighborhood, evalContext)) {
                    rule.outputs.forEach((output) => {
                        const targetCell = c + output.position;
                        if (
                            output.futureStep - 1 < nextConfigurations.length &&
                            0 <= targetCell &&
                            targetCell < nbCells
                        ) {
                            nextConfigurations[output.futureStep - 1].cells[
                                targetCell
                            ].addSignal(output.signal);
                        }
                    });
                }
            }
        }
        return nextConfigurations;
    }

    /**
     * Returns a space-time diagram from a starting configuration
     */
    makeDiagram(
        initialConfiguration: Configuration,
        nbSteps: number
    ): Configuration[] {
        const nbCells = initialConfiguration.getSize();
        const diagram = [
            initialConfiguration,
            ...Array.from({ length: nbSteps }, () =>
                Configuration.withSize(nbCells)
            ),
        ];
        const evalContext = this.getEvalContext();

        for (let t = 0; t < nbSteps; t++) {
            const config = diagram[t];
            for (let c = -this.maxNeighbor; c < nbCells - this.minNeighbor; c++) {
                const neighborhood = config.getNeighborhood(
                    c,
                    this.minNeighbor,
                    this.maxNeighbor
                );
                for (const rule of this.rules) {
                    if (rule.condition.eval(neighborhood, evalContext)) {
                        rule.outputs.forEach((output) => {
                            const targetCell = c + output.position;
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

    replaceSignal(oldSignal: Signal, newSignal: Signal): Automaton {
        const newRules = this.rules.map((rule) =>
            rule.replaceSignal(oldSignal, newSignal)
        );
        const newMultiSignals = new Map(this.multiSignals);
        if (newMultiSignals.has(oldSignal)) {
            const subSignals = newMultiSignals.get(oldSignal);
            newMultiSignals.delete(oldSignal);
            newMultiSignals.set(newSignal, subSignals!);
        }
        for (const subSignals of newMultiSignals.values()) {
            if (subSignals.has(oldSignal)) {
                subSignals.delete(oldSignal);
                subSignals.add(newSignal);
            }
        }

        return new Automaton(newRules, newMultiSignals);
    }

    toString(): string {
        return this.rules.map((rule) => rule.toString()).join("\n");
    }
}
