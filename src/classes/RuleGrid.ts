import Cell, { InputCell } from "./Cell.ts";
import { Conjunction, ConjunctionOfLiterals, Literal } from "./Clause.ts";
import Rule, { ConjunctionRule, RuleOutput } from "./Rule.ts";

class RuleGrid {
    inputCells: InputCell[];
    outputCells: Cell[][];

    constructor(inputCells: InputCell[], outputCells: Cell[][]) {
        this.inputCells = inputCells;
        this.outputCells = outputCells;
    }

    static withSize(nbCells: number, nbFutureSteps: number): RuleGrid {
        const inputs = Array.from({ length: nbCells }, () => new InputCell());
        const outputs = Array.from({ length: nbFutureSteps }, () =>
            Array.from({ length: nbCells }, () => new Cell())
        );
        return new RuleGrid(inputs, outputs);
    }

    getRadius(): number {
        return (this.outputCells[0].length - 1) / 2;
    }

    clone(): RuleGrid {
        return new RuleGrid(
            this.inputCells.map((cell) => cell.clone()),
            this.outputCells.map((row) => row.map((cell) => cell.clone()))
        );
    }

    equals(other: RuleGrid): boolean {
        // compare inputs
        if (this.inputCells.length !== other.inputCells.length) {
            return false;
        }
        for (let i = 0; i < this.inputCells.length; i++) {
            if (!this.inputCells[i].equals(other.inputCells[i])) {
                return false;
            }
        }
        // compare outputs
        if (this.outputCells.length !== other.outputCells.length) {
            return false;
        }
        for (let row = 0; row < this.outputCells.length; row++) {
            if (this.outputCells[row].length !== other.outputCells[row].length) {
                return false;
            }
            for (let col = 0; col < this.outputCells[row].length; col++) {
                if (!this.outputCells[row][col].equals(other.outputCells[row][col])) {
                    return false;
                }
            }
        }

        return true;
    }

    makeRule(): ConjunctionRule {
        return new Rule(
            this.makeRuleCondition(),
            this.makeRuleOutputs()
        ) as ConjunctionRule;
    }

    makeRuleCondition(): ConjunctionOfLiterals {
        const radius = this.getRadius();
        const literals: Literal[] = [];
        this.inputCells.forEach((cellule, cellIndex) => {
            cellule.signals.forEach((signal) => {
                const literal = new Literal(signal, cellIndex - radius, true);
                literals.push(literal);
            });
            cellule.negatedSignals.forEach((signal) => {
                const literal = new Literal(signal, cellIndex - radius, false);
                literals.push(literal);
            });
        });
        return new Conjunction(literals) as ConjunctionOfLiterals;
    }

    makeRuleOutputs(): RuleOutput[] {
        const outputs: RuleOutput[] = [];
        this.outputCells.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                cellule.signals.forEach((signal) => {
                    const ruleOutput = new RuleOutput(
                        colIndex - this.getRadius(),
                        signal,
                        rowIndex + 1
                    );
                    outputs.push(ruleOutput);
                });
            });
        });
        return outputs;
    }
}

export default RuleGrid;
