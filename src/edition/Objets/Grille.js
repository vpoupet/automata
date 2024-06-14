import Cellule from './Cellule';

class Grille {
    constructor(rows, cols) {
        this.grid = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(new Cellule());
            }
            this.grid.push(row);
        }
    }

    getCase(row, col) {
        if (row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[row].length) {
            return this.grid[row][col];
        }
        return null;
    }


}

export default Grille;
