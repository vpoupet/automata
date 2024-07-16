import { Cell, InputCell } from "./Cell.ts";
import { Conjunction, ConjunctionOfLiterals, Literal } from "./Clause.ts";
import { Configuration } from "./Configuration.ts";
import { ConjunctionRule, Rule, RuleOutput } from "./Rule.ts";

class RuleGrid {
    inputs: InputCell[];
    outputs: Cell[][];

    constructor(inputs: InputCell[], outputs: Cell[][]) {
        this.inputs = inputs;
        this.outputs = outputs;
    }

    static withSize(nbCells: number, nbFutureSteps: number): RuleGrid {
        const inputs = Array.from({ length: nbCells }, () => new InputCell());
        const outputs = Array.from({ length: nbFutureSteps }, () =>
            Array.from({ length: nbCells }, () => new Cell())
        );
        return new RuleGrid(inputs, outputs);
    }

    clone(): RuleGrid {
        return new RuleGrid(
            this.inputs.map((cell) => cell.clone()),
            this.outputs.map((row) => row.map((cell) => cell.clone()))
        );
    }

    getCaseInput(col: number): InputCell {
        return this.inputs[col];
    }

    getCaseOutput(row: number, col: number): Cell {
        return this.outputs[row][col];
    }

    equals(ruleGrid: RuleGrid): boolean {
        return (
            this.equalsInputs(ruleGrid.inputs) &&
            this.equalsOutputs(ruleGrid.outputs)
        );
    }

    equalsInputs(inputs: InputCell[]): boolean {
        return (
            this.inputs.length === inputs.length &&
            this.inputs.every((v, i) => v.equals(inputs[i]))
        );
    }

    equalsOutputs(outputs: Cell[][]): boolean {
        for (let row = 0; row < this.outputs.length; row++) {
            for (let col = 0; col < this.outputs[row].length; col++) {
                if (!this.outputs[row][col].equals(outputs[row][col])) {
                    return false;
                }
            }
        }
        return true;
    }

    getConfigurationFromGrid(): Configuration {
        const conf = Configuration.withSize(this.inputs.length);
        for (let row = 0; row < this.outputs.length + 1; row++) {
            for (let col = 0; col < this.inputs.length; col++) {
                if (row === 0) {
                    new Set(this.inputs[col].signals).forEach((signal) => {
                        conf.cells[col].signals.add(signal);
                    });
                } else {
                    new Set(this.outputs[row - 1][col].signals).forEach(
                        (signal) => {
                            conf.cells[
                                (row - 1) * this.inputs.length + col
                            ].signals.add(signal);
                        }
                    );
                }
            }
        }
        return conf;
    }

    setGridFromConfiguration(conf: Configuration) {
        for (let i = 0; i < conf.cells.length; i++) {
            if (i < this.inputs.length) {
                this.inputs[i].signals = conf.cells[i].signals;
            } else {
                const row = Math.trunc(
                    (i - this.inputs.length) / this.inputs.length
                );
                const col = (i - this.inputs.length) % this.inputs.length;
                this.outputs[row][col].signals = conf.cells[i].signals;
            }
        }
    }

    setGridFromConfigurations(configurations: Configuration[]) {
        for (let i = 0; i < configurations.length; i++) {
            if (i === 0) {
                for (let j = 0; j < this.inputs.length; j++) {
                    this.inputs[j].signals = configurations[0].cells[j].signals;
                }
            } else {
                for (let row = 0; row < this.outputs.length; row++) {
                    for (let col = 0; col < this.outputs[row].length; col++) {
                        this.outputs[row][col].signals =
                            configurations[i].cells[col].signals;
                    }
                }
            }
        }
    }

    static makeRule(grid: RuleGrid): ConjunctionRule {
        const gridRadius = (grid.outputs[0].length - 1) / 2;
        const outputs = RuleGrid.makeRuleOutputs(grid.outputs, gridRadius);
        const condition = RuleGrid.makeRuleCondition(grid.inputs, gridRadius);
        return new Rule(condition, outputs) as ConjunctionRule;
    }

    static makeRuleOutputs(gridOutputs: Cell[][], gridRadius: number) {
        const outputs: RuleOutput[] = [];

        gridOutputs.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                cellule.signals.forEach((signal) => {
                    const ruleOutput = new RuleOutput(
                        colIndex - gridRadius,
                        signal,
                        rowIndex + 1
                    );
                    outputs.push(ruleOutput);
                });
            });
        });

        return outputs;
    }

    static makeRuleCondition(
        gridInputs: InputCell[],
        gridRadius: number
    ): ConjunctionOfLiterals {
        const literals: Literal[] = [];
        gridInputs.forEach((cellule, cellIndex) => {
            cellule.signals.forEach((signal) => {
                const literal = new Literal(
                    signal,
                    cellIndex - gridRadius,
                    true
                );
                literals.push(literal);
            });
            cellule.negatedSignals.forEach((signal) => {
                const literal = new Literal(
                    signal,
                    cellIndex - gridRadius,
                    false
                );
                literals.push(literal);
            });
        });
        return new Conjunction(literals) as ConjunctionOfLiterals;
    }

    static makeGridFromRule(rule: Rule, radius: number, futureStep: number) {
        const grid = RuleGrid.withSize(2 * radius + 1, futureStep);
        const ruleOutputs = rule.outputs;
        ruleOutputs.forEach((ruleOutput) => {
            const row = ruleOutput.futureStep - 1;
            const col = ruleOutput.neighbor + radius;
            grid.outputs[row][col].signals.add(ruleOutput.signal);
        });
        const ruleCondition = rule.condition;
        ruleCondition.getLiterals().forEach((literal) => {
            const col = literal.position + radius;
            if (literal.sign) {
                grid.inputs[col].signals.add(literal.signal);
            } else {
                grid.inputs[col].negatedSignals.add(literal.signal);
            }
        });
        return grid;
    }

    static makeGridsFromTabRules(
        rules: Rule[],
        radius: number,
        futureStep: number
    ) {
        const tabRuleGrid: RuleGrid[] = [];
        for (const rule of rules) {
            const grid = RuleGrid.makeGridFromRule(rule, radius, futureStep);
            tabRuleGrid.push(grid);
        }
        return tabRuleGrid;
    }
}

export default RuleGrid;
