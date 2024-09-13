import nearley from "nearley";
import grammar from "../grammar/grammar.js";
import type { ParsedLine } from "../grammar/types.ts";
import type { Signal } from "../types.ts";
import Clause, { Conjunction, EvalContext } from "./Clause.ts";
import Configuration from "./Configuration.ts";
import Rule from "./Rule.ts";
import { transformations } from "./transformations/Transformation.ts";
import DirectedGraph from "./Graph.ts";

export default class Automaton {
    /**
     * List of signals used by the automaton
     */
    signals: Set<Signal>;
    /**
     * Map of multi-signals (a multi-signal is a single name that can represent multiple signals)
     */
    multiSignals: Map<Signal, Set<Signal>>;
    /**
     * List of rules of the automaton
     * (the rules are executed on each cell in the order they appear in the list)
     */
    rules: Rule[];
    /**
     * List of strings representing the rules. Used to avoid duplicate rules.
     */
    ruleNames: Set<string>;
    /**
     * Position of the leftmost neighbor used in the rules
     */
    minNeighbor: number;
    /**
     * Position of the rightmost neighbor used in the rules
     */
    maxNeighbor: number;
    /**
     * Number of steps that are computed ahead of time. This is 1 by default but if some rules affect times further down
     * (e.g. a 0/2 rule will add a signal to the cell two steps ahead) it is necessary to start preparing the
     * configuration at time (t + maxFutureSteps) when applying the rules to the configuration at time t.
     */
    maxFutureDepth: number;

    constructor(
        rules: Rule[] = [],
        multiSignals: Map<Signal, Set<Signal>> = new Map()
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
        this.signals = new Set();
        this.minNeighbor = 0;
        this.maxNeighbor = 0;
        this.maxFutureDepth = 1;

        // parse rules to update signals, minNeighbor, maxNeighbor and maxFutureDepth
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
    }

    /**
     * @returns the automaton's context needed to evaluate rules
     */
    getEvalContext(): EvalContext {
        return new EvalContext(this.multiSignals);
    }

    /**
     * Returns the list of signals used by the automaton in alphabetical order
     *
     * @param extraSignals an optional set of signals to add to the list (for signals that are not used in the rules)
     * @returns an ordered list of signals
     */
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

    /**
     * Adds rules to the automaton from a string describing the rules.
     * The string is parsed with the grammar defined in grammar.ne
     *
     * @param inputString a string describing the rules to add to the automaton
     * @returns a new Automaton with the added rules
     */
    addRulesFromString(inputString: string): Automaton {
        let context = new EvalContext(new Map(this.multiSignals));
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

    /**
     * Tests whether the Automaton already has a rule with the same description as the given rule
     *
     * @param rule the rule to check
     * @returns true if the rule is already in the automaton, false otherwise
     */
    hasRule(rule: Rule): boolean {
        return this.ruleNames.has(rule.toString());
    }

    /**
     * Adds a list of rules to the automaton
     *
     * @param rules list of rules to add
     * @returns a new Automaton with the added rules
     */
    addRules(rules: Rule[]): Automaton {
        if (rules.length === 0) {
            return this;
        }
        return new Automaton([...this.rules, ...rules], this.multiSignals);
    }

    /**
     * Deletes a rule from the automaton
     *
     * @param rule the rule to delete
     * @returns a new Automaton without the rule
     */
    deleteRule(rule: Rule): Automaton {
        return new Automaton(
            this.rules.filter((r) => r !== rule),
            this.multiSignals
        );
    }

    /**
     * Replaces a rule with a list of rules
     *
     * @param oldRule the rule to replace
     * @param newRules the list of rules to replace it with
     * @returns a new Automaton with the rule replaced
     */
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

    /**
     * Returns a list of configurations resulting from applying rules once to the given configuration.
     * The number of configurations returns is equal to the maxFutureDepth of the automaton (so that all possible
     * rule outputs can be represented).
     *
     * @param configuration the configuration to which the rules should be applied
     * @param rules the rules to apply (defaults to the automaton's rules)
     * @returns a list of configurations (one for each successive time step) resulting from applying the rules
     */
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
     * Generates a space-time diagram of the automaton starting from the given configuration
     *
     * @param initialConfiguration the initial configuration
     * @param nbSteps the number of steps to compute
     * @returns a list of configurations representing the space-time diagram
     */
    makeDiagram(
        initialConfiguration: Configuration,
        nbSteps: number
    ): Configuration[] {
        const nbCells = initialConfiguration.getSize();
        const diagram = [
            ...Array.from({ length: nbSteps + 1 }, () =>
                Configuration.withSize(nbCells)
            ),
        ];
        for (const [i, c] of initialConfiguration.cells.entries()) {
            for (const signal of c.signals) {
                diagram[0].cells[i].addSignal(signal);
            }
        }
        const evalContext = this.getEvalContext();

        for (let t = 0; t < nbSteps; t++) {
            const config = diagram[t];
            for (
                let c = -this.maxNeighbor;
                c < nbCells - this.minNeighbor;
                c++
            ) {
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

    makeDependencyGraph(): DirectedGraph<Signal> {
        const graph = new DirectedGraph<Signal>();
        const evalContext = this.getEvalContext();

        for (const signal of this.signals) {
            graph.addVertex(signal);
        }
        for (const rule of this.rules) {
            for (const inputLiteral of rule.condition.getLiterals()) {
                for (const inputSignal of evalContext.getSignalsFor(inputLiteral.signal)) {
                    for (const output of rule.outputs) {
                        graph.addEdge(inputSignal, output.signal);
                    }
                }
            }
        }
        return graph;
    }

    toString(): string {
        return this.rules.map((rule) => rule.toString()).join("\n");
    }
}
