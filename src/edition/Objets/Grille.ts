import { Cell } from "../../classes/Cell";

class Grille {
    grid: Cell[][];

    constructor(rows: number, cols: number) {
        this.grid = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(new Cell());
            }
            this.grid.push(row);
        }
    }

    clone(): Grille {
        const newGrille = new Grille(this.grid.length, this.grid[0].length);
        newGrille.grid = this.grid.map((row) =>
            row.map((cell) => cell.clone())
        );
        return newGrille;
    }

    getCase(row: number, col: number): Cell | undefined {
        return this.grid[row]?.[col];
    }

    equals(grille : Cell[][]): boolean {
        for(let i=0; i<this.grid.length; i++){
            for (let j=0; j<this.grid[0].length; j++){
                if (this.grid[i][j].signals.values()!==grille[i][j].signals.values()){
                    return false;
                }
            }
        }
        return true;
    }
}

export default Grille;
