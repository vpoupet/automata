import { Clause, Conjunction, Disjunction, Literal, Negation } from './Clause.ts';
import { Configuration } from './Configuration.ts';
import { Signal } from './types.ts';


class RuleParsingException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RuleParsingException";
    }
}


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
            return `${this.neighbor}/${this.futureStep}.${Symbol.keyFor(this.signal)}`;
        }
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
        return `${this.condition.toString()}: ${this.outputs.map(output => output.toString()).join(" ")}`;
    }
}

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

    constructor() {
        this.rules = [];
        this.minNeighbor = 0;
        this.maxNeighbor = 0;
        this.maxFutureDepth = 1;
    }

    updateParameters() {
        this.minNeighbor = Infinity;
        this.maxNeighbor = -Infinity;
        this.maxFutureDepth = 1;
        for (const rule of this.rules) {
            for (const output of rule.outputs) {
                this.maxFutureDepth = Math.max(this.maxFutureDepth, output.futureStep);
            }
            for (const literal of rule.condition.getLiterals()) {
                this.minNeighbor = Math.min(this.minNeighbor, literal.position);
                this.maxNeighbor = Math.max(this.maxNeighbor, literal.position);
            }
        }
        if (this.minNeighbor === Infinity) this.minNeighbor = 0;
        if (this.maxNeighbor === -Infinity) this.maxNeighbor = 0;
        return this;
    }

    setRules(rules: Rule[]): Automaton {
        this.rules = rules;
        this.updateParameters();
        return this;
    }

    parseRules(rulesString: string): Automaton {
        this.rules = [];
        const conditionsStack: { condition: Clause, indent: number }[] = [];
        for (let line of rulesString.split('\n')) {
            const indent = line.search(/\S|$/);    // indentation of current line
            line = line.replace(/#.*/, '').trim();  // remove comments and whitespace
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
            while (conditionsStack.length > 0 && conditionsStack[0].indent >= indent) {
                // remove irrelevant conditions from stack
                conditionsStack.shift();
            }

            // prepare condition
            if (conditionString) {
                // parse condition from line
                const lineCondition = this.parseCondition(conditionString);
                if (conditionsStack.length === 0) {
                    condition = lineCondition;
                } else {
                    condition = new Conjunction([conditionsStack[0].condition, lineCondition]);
                }
                conditionsStack.unshift({ condition, indent });   // push condition to stack
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

    readConditionTokens(conditionTokens: string[]): Clause {
        const token = conditionTokens.shift();
        if (token === undefined) {
            return new Clause();
        }
        const subclauses: Clause[] = [];
        let negatedCondition: Clause;
        switch (token) {
            case "(":
                while (conditionTokens[0] !== ")") {
                    if (conditionTokens.length === 0) {
                        throw new RuleParsingException("Unbalanced parentheses in condition");
                    }
                    subclauses.push(this.readConditionTokens(conditionTokens));
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
                        throw new RuleParsingException("Unbalanced parentheses in condition");
                    }
                    subclauses.push(this.readConditionTokens(conditionTokens));
                }
                conditionTokens.shift();
                if (subclauses.length === 1) {
                    // disjunction with only one subclause
                    return subclauses[0];
                } else {
                    return new Disjunction(subclauses);
                }
            case "!":
                negatedCondition = this.readConditionTokens(conditionTokens);
                if (negatedCondition instanceof Negation) {
                    return negatedCondition.subclause;
                } else {
                    return new Negation(negatedCondition);
                }
            default:
                return new Literal(Symbol.for(token));
        }
    }

    parseCondition(conditionString: string): Clause {
        // const tokens = conditionString.split(/(\(|\)|\[|\]|\+|-|\w+)/).filter(t => t.length > 0);
        const tokens = conditionString.match(/(\(|\)|\[|\]|\+|-|!|\w+)/g);
        if (tokens === null) {
            throw new RuleParsingException("Invalid condition");
        }
        const condition = this.readConditionTokens(tokens);
        if (tokens.length > 0) {
            throw new RuleParsingException("Invalid condition");
        }
        return condition;
    }

    parseOutputs(outputsString: string): RuleOutput[] {
        const outputs: RuleOutput[] = [];
        for (const outputString of outputsString.trim().split(/\s+/)) {
            if (outputString.includes('.')) {
                let futureStep = 1;
                let futureStepString: string;
                const outputSplit = outputString.split(".");
                let neighborString = outputSplit[0];
                const signalName = outputSplit[1];
                if (neighborString.includes('/')) {
                    [neighborString, futureStepString] = neighborString.split("/");
                    futureStep = parseInt(futureStepString);
                }
                const neighbor = neighborString === '' ? 0 : parseInt(neighborString);
                outputs.push(new RuleOutput(neighbor, Symbol.for(signalName), futureStep));
            } else {
                outputs.push(new RuleOutput(0, Symbol.for(outputString), 1));
            }
        }
        return outputs;
    }

    /**
     * Returns a space-time diagram from a starting configuration
     * 
     * The input is a list of configurations, because some future configurations might already have signals from previous
     * steps (when a rule output sends a signal several time steps ahead). If the list has less than (maxFutureSteps + 1)
     * (corresponding to the current configuration and the `maxFutureSteps` next ones) new empty configurations are added
     *
     * @param {[Rule]} rules list of rules to execute
     * @param {[[Set<int>]]} configs a list of configurations, each configuration being a list of sets of signals (one for
     * each cell in the configuration). `configs[0]` is the configuration at time t (the one to which the rules are
     * applied) and the other ones are configurations at subsequent times (t + 1, t + 2, ...) if they already have signals.
     * New configurations can be added as needed with empty sets for all cells.
     * 
     * @returns {[[Set<int>]]} the list of configurations after applying the rules. Note that because some rules can affect
     * the configuration at time t (rules 0/0) the configuration to which the rules were applied might have changed. The
     * configurations are modified in place (the returned list is not a copy of the input).
     */
    makeDiagram(initialConfiguration: Configuration, nbSteps: number): Configuration[] {
        const nbCells = initialConfiguration.getSize();
        const diagram = [initialConfiguration];
        for (let i = 0; i < nbSteps; i++) {
            diagram.push(new Configuration(nbCells));
        }
        for (let t = 0; t < nbSteps; t++) {
            const config = diagram[t];
            for (let c = 0; c < nbCells; c++) {
                const neighborhood = config.getNeighborhood(c, this.minNeighbor, this.maxNeighbor);
                for (const rule of this.rules) {
                    if (rule.condition.eval(neighborhood)) {
                        rule.outputs.forEach(output => {
                            const targetCell = c + output.neighbor;
                            if (t + output.futureStep < diagram.length && 0 <= targetCell && targetCell < nbCells) {
                                diagram[t + output.futureStep].cells[targetCell].add(output.signal);
                            }
                        });
                    }
                }
            }
        }
        return diagram;
    }

    toString(): string {
        return this.rules.map(rule => rule.toString()).join("\n");
    }
}
