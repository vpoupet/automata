import type { Neighborhood } from "../types.ts";
import Cell from "./Cell.ts";

export default class Configuration {
    cells: Cell[];

    constructor(cells: Cell[]) {
        this.cells = cells;
    }

    static withSize(nbCells: number): Configuration {
        return new Configuration(
            Array(nbCells)
                .fill(0)
                .map(() => new Cell())
        );
    }

    getSize(): number {
        return this.cells.length;
    }

    getNeighborhood(
        c: number,
        minNeighbor: number,
        maxNeighbor: number
    ): Neighborhood {
        const neighborhood: Neighborhood = {};
        for (let i = minNeighbor; i <= maxNeighbor; i++) {
            neighborhood[i] = this.cells[c + i] ?? new Cell();
        }
        return neighborhood;
    }
}
