import Cellule from './Cellule';

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

    getCase(row: number, col: number): Cellule | undefined {
        return this.grid[row]?.[col];
    }
}

export default Grille;
