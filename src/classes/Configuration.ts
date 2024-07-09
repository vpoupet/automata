import { Cell } from './Cell.ts';
import { Neighborhood } from './types.ts';


export class Configuration {
    cells: Cell[];

    constructor(nbCells: number) {
        this.cells = Array(nbCells).fill(0).map(() => new Cell());
    }

    getSize(): number {
        return this.cells.length;
    }

    getNeighborhood(c: number, minNeighbor: number, maxNeighbor: number): Neighborhood {
        const neighborhood: Neighborhood = {};
        for (let i = minNeighbor; i <= maxNeighbor; i++) {
            neighborhood[i] = this.cells[c + i] ?? new Cell();
        }
        return neighborhood;
    }
}
