import { Signal, Neighborhood } from './types.ts';


export class Configuration {
    cells: Set<Signal>[];

    constructor(nbCells: number) {
        this.cells = Array(nbCells).fill(0).map(() => new Set());
    }

    getSize(): number {
        return this.cells.length;
    }

    getNeighborhood(c: number, minNeighbor: number, maxNeighbor: number): Neighborhood {
        const neighborhood: Neighborhood = {};
        for (let i = minNeighbor; i <= maxNeighbor; i++) {
            if (c + i < 0) {
                neighborhood[i] = new Set();
            } else if (c + i >= this.cells.length) {
                neighborhood[i] = new Set();
            } else {
                neighborhood[i] = this.cells[c + i];
            }
        }
        return neighborhood;
    }
}
