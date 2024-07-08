import Cellule from "./Cellule";

class Grille {
    grid: Cellule[][];

    constructor(rows: number, cols: number) {
        this.grid = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(new Cellule());
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

    getCase(row: number, col: number): Cellule | undefined {
        return this.grid[row]?.[col];
    }
}

export default Grille;
