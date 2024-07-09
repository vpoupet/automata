import Cellule from "./Cellule";

class RuleGrid {
    inputs: Cellule[];
    outputs : Cellule[][];

    constructor(inputs: Cellule[], outputs: Cellule[][]) {
        this.inputs = inputs;
        this.outputs = outputs;
    }


    clone(): RuleGrid {
        return new RuleGrid(this.inputs, this.outputs);
    }

    getCase(row : number, col: number): Cellule | undefined {
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
    equalsInputs(inputs: Cellule[]): boolean {
        return this.inputs.length === inputs.length && this.inputs.every((v, i) => v.equals(inputs[i]));
    }

    equalsOutputs(outputs: Cellule[][]): boolean {
        for (let row = 0; row < this.outputs.length; row++){
            for (let col = 0; col < this.outputs[row].length; col++){
                if (!this.outputs[row][col].equals(outputs[row][col])){
                    return false;
                }
            }
        }
        return true
    }
}

export default RuleGrid;
