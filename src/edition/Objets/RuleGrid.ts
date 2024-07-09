
import {Configuration} from "../../classes/Configuration.ts";
import {Cell} from "../../classes/Cell.ts";

class RuleGrid {
    inputs: Cell[];
    outputs : Cell[][];

    constructor(rows: number, cols: number) {
        this.inputs = new Array(cols);
        this.outputs = new Array(rows);
        for (let i=0; i<rows; i++){
            this.outputs[i] = new Array(cols);
           for (let j=0; j<cols; j++){
                this.outputs[i][j] = new Cell();
              if (i===0) {
                  this.inputs[j] = new Cell();
              }
           }
        }
    }



    clone(): RuleGrid {
        const newGrid = new RuleGrid(this.outputs.length, this.outputs[0].length);
        newGrid.inputs = this.inputs.map((cell) => cell.clone());
        newGrid.outputs = this.outputs.map((row) => row.map((cell) => cell.clone()));
        return newGrid;
    }

    getCase(row : number, col: number): Cell | undefined {
        if (row ===-1){
            return this.inputs[col];
        }
        else {
            return this.outputs[row][col];
        }
    }

    equals(ruleGrid: RuleGrid): boolean {
        return this.equalsInputs(ruleGrid.inputs) && this.equalsOutputs(ruleGrid.outputs);
    }
    equalsInputs(inputs: Cell[]): boolean {
        return this.inputs.length === inputs.length && this.inputs.every((v, i) => v.equals(inputs[i]));
    }

    equalsOutputs(outputs: Cell[][]): boolean {
        for (let row = 0; row < this.outputs.length; row++){
            for (let col = 0; col < this.outputs[row].length; col++){
                if (!this.outputs[row][col].equals(outputs[row][col])){
                    return false;
                }
            }
        }
        return true
    }

    getConfigurationFromGrid() : Configuration {
        const conf = new Configuration(this.inputs.length);
        for (let row = 0; row < this.outputs.length+1; row++) {
            for (let col =0 ; col < this.inputs.length; col++) {
                if (row === 0) {
                    new Set(this.inputs[row].signals).forEach((signal) => {
                        conf.cells[row].add(signal);
                    })
                } else {
                    new Set(this.outputs[row-1][col].signals).forEach((signal) => {
                        conf.cells[row].add(signal);
                    })
                }
            }
        }
        return conf;
    }
}

export default RuleGrid;
