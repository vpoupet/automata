import Cell from "../classes/Cell.ts";
import type { Coordinates, Signal } from "../types.ts";
import CellComponent from "./CellComponent.tsx";

type GridOutputsRowProps = {
    outputs: Cell[];
    rowIndex: number;
    activeOutputCells: Coordinates[];
    setActiveInputCells: React.Dispatch<React.SetStateAction<number[]>>;
    setActiveOutputCells: React.Dispatch<React.SetStateAction<Coordinates[]>>;
    colorMap: Map<Signal, string>;
};

export default function GridOutputsRow({
    outputs,
    rowIndex,
    activeOutputCells,
    setActiveInputCells,
    setActiveOutputCells,
    colorMap,
}: GridOutputsRowProps): JSX.Element {
    function onClickCell(cellIndex: number, event: React.MouseEvent) {
        if (event.ctrlKey || event.metaKey) {
            if (
                activeOutputCells.some(
                    (coords) =>
                        coords.row === rowIndex && coords.col === cellIndex
                )
            ) {
                setActiveOutputCells(
                    activeOutputCells.filter(
                        (coords) =>
                            coords.row !== rowIndex || coords.col !== cellIndex
                    )
                );
            } else {
                setActiveOutputCells([
                    ...activeOutputCells,
                    { row: rowIndex, col: cellIndex },
                ]);
            }
        } else {
            setActiveInputCells([]);
            setActiveOutputCells([{ row: rowIndex, col: cellIndex }]);
        }
    }

    return (
        <div className="grid-row">
            {outputs.map((cell, index) => (
                <CellComponent
                    key={index}
                    cell={cell}
                    onClick={(event) => onClickCell(index, event)}
                    isActive={activeOutputCells.some(
                        (coords) =>
                            coords.row === rowIndex && coords.col === index
                    )}
                    colorMap={colorMap}
                />
            ))}
        </div>
    );
}
