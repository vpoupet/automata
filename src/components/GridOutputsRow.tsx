import { Cell } from "../classes/Cell.ts";
import { Coordinates, Signal } from "../types.ts";
import { DiagramCell } from "./Diagram.tsx";

type GridOutputsRowProps = {
    outputs: Cell[];
    rowIndex: number;
    activeOutputCells: Coordinates[];
    setActiveInputCells: React.Dispatch<React.SetStateAction<number[]>>;
    setActiveOutputCells: React.Dispatch<React.SetStateAction<Coordinates[]>>;
    signalsList: Signal[];
};

export default function GridOutputsRow({
    outputs,
    rowIndex,
    activeOutputCells,
    setActiveInputCells,
    setActiveOutputCells,
    signalsList,
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
                <DiagramCell
                    key={index}
                    cell={cell}
                    onClick={(event) => onClickCell(index, event)}
                    className={
                        activeOutputCells.some(
                            (cell) =>
                                cell.row === rowIndex && cell.col === index
                        )
                            ? "active"
                            : ""
                    }
                    signalsList={signalsList}
                />
            ))}
        </div>
    );
}
