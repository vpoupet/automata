import { Cell, InputCell } from "./Cell.ts";
import { Configuration } from "./Configuration.ts";

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
                            (row-1) * this.inputs.length + col
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
}

export default RuleGrid;
