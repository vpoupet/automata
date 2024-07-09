import { Configuration } from "../../classes/Configuration.ts";
import { Cell } from "../../classes/Cell.ts";

class RuleGrid {
    inputs: Cell[];
    outputs: Cell[][];

    /***
     *  Génère rows - 1 lignes d'outputs et une ligne d'inputs
     ***/
    constructor(rows: number, cols: number) {
        this.inputs = new Array(cols);
        this.outputs = new Array(rows - 1);
        for (let i = 0; i < rows - 1; i++) {  // Changement ici : rows - 1
            this.outputs[i] = new Array(cols);
            for (let j = 0; j < cols; j++) {
                this.outputs[i][j] = new Cell();
                if (i === 0) {
                    this.inputs[j] = new Cell();
                }
            }
        }
    }

    clone(): RuleGrid {
        const newGrid = new RuleGrid(this.outputs.length + 1, this.outputs[0].length);  // Changement ici
        newGrid.inputs = this.inputs.map((cell) => cell.clone());
        newGrid.outputs = this.outputs.map((row) => row.map((cell) => cell.clone()));
        return newGrid;
    }

    getCase(row: number, col: number): Cell | undefined {
        if (row === 0) {
            return this.inputs[col];
        } else {
            return this.outputs[row][col];
        }
    }

    getCaseOutput(row: number, col: number): Cell | undefined {
        return this.outputs[row][col];
    }

    equals(ruleGrid: RuleGrid): boolean {
        return this.equalsInputs(ruleGrid.inputs) && this.equalsOutputs(ruleGrid.outputs);
    }

    equalsInputs(inputs: Cell[]): boolean {
        return this.inputs.length === inputs.length && this.inputs.every((v, i) => v.equals(inputs[i]));
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
        const conf = new Configuration(this.inputs.length);
        for (let row = 0; row < this.outputs.length + 1; row++) {
            for (let col = 0; col < this.inputs.length; col++) {
                if (row === 0) {
                    new Set(this.inputs[col].signals).forEach((signal) => {
                        conf.cells[col].signals.add(signal);
                    });
                } else {
                    new Set(this.outputs[row - 1][col].signals).forEach((signal) => {
                        conf.cells[row * this.inputs.length + col].signals.add(signal);
                    });
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
                const row = Math.trunc((i - this.inputs.length) / this.inputs.length);
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
                        this.outputs[row][col].signals = configurations[i].cells[col].signals;
                    }
                }
            }
        }
    }
}

export default RuleGrid;
