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
}
