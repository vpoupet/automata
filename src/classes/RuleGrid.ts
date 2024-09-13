import Cell, { InputCell } from "./Cell.ts";
import Clause, { Conjunction, Literal } from "./Clause.ts";
import Rule, { RuleOutput } from "./Rule.ts";

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
            if (
                this.outputCells[row].length !== other.outputCells[row].length
            ) {
                return false;
            }
            for (let col = 0; col < this.outputCells[row].length; col++) {
                if (
                    !this.outputCells[row][col].equals(
                        other.outputCells[row][col]
                    )
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    makeRule(centerOrigin: boolean = true): Rule {
        return new Rule(
            this.makeRuleCondition(centerOrigin),
            this.makeRuleOutputs(centerOrigin)
        );
    }

    makeRuleCondition(centerOrigin: boolean = true): Clause {
        const shift = centerOrigin ? -this.getRadius() : 0;
        const literals: Literal[] = [];
        this.inputCells.forEach((cell, cellIndex) => {
            cell.signals.forEach((signal) => {
                const literal = new Literal(signal, cellIndex + shift, true);
                literals.push(literal);
            });
            cell.negatedSignals.forEach((signal) => {
                const literal = new Literal(signal, cellIndex + shift, false);
                literals.push(literal);
            });
        });
        if (literals.length === 1) {
            return literals[0];
        }
        return new Conjunction(literals);
    }

    makeRuleOutputs(centerOrigin: boolean = true): RuleOutput[] {
        const shift = centerOrigin ? -this.getRadius() : 0;
        const outputs: RuleOutput[] = [];
        this.outputCells.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                cellule.signals.forEach((signal) => {
                    const ruleOutput = new RuleOutput(
                        colIndex + shift,
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
