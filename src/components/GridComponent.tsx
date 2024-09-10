import Cell, { InputCell } from "../classes/Cell";
import RuleGrid from "../classes/RuleGrid";
import { Coordinates, Signal } from "../types";
import CellComponent from "./CellComponent";

interface GridComponentProps {
    inputCells: InputCell[];
    outputCells: Cell[][];
    colorMap: Map<Signal, string>;
    activeCellsManager?: {
        activeInputCells: number[];
        activeOutputCells: Coordinates[];
        setActiveInputCells: (input: number[]) => void;
        setActiveOutputCells: (output: Coordinates[]) => void;
    };
}

export default function GridComponent(props: GridComponentProps) {
    const { inputCells, outputCells, colorMap, activeCellsManager } = props;
    const grid = new RuleGrid(inputCells, outputCells);

    function handleClickOutputCell(
        row: number,
        col: number,
        event: React.MouseEvent
    ) {
        if (activeCellsManager === undefined) {
            return;
        }

        const { activeOutputCells, setActiveInputCells, setActiveOutputCells } =
            activeCellsManager;

        if (event.ctrlKey || event.metaKey) {
            if (
                activeOutputCells.some(
                    (coords) => coords.row === row && coords.col === col
                )
            ) {
                setActiveOutputCells(
                    activeOutputCells.filter(
                        (coords) => coords.row !== row || coords.col !== col
                    )
                );
            } else {
                setActiveOutputCells([...activeOutputCells, { row, col }]);
            }
        } else {
            setActiveInputCells([]);
            setActiveOutputCells([{ row, col }]);
        }
    }

    function handleClickInputCell(col: number, event: React.MouseEvent) {
        if (activeCellsManager === undefined) {
            return;
        }

        const { activeInputCells, setActiveInputCells, setActiveOutputCells } =
            activeCellsManager;

        if (event.ctrlKey || event.metaKey) {
            if (activeInputCells.includes(col)) {
                setActiveInputCells(activeInputCells.filter((i) => i !== col));
            } else {
                setActiveInputCells([...activeInputCells, col]);
            }
        } else {
            setActiveInputCells([col]);
            setActiveOutputCells([]);
        }
    }

    return (
        <div className="flex flex-col items-center">
            <div className="mb-1 flex flex-col-reverse">
                {grid.outputCells
                    .slice()
                    .map((row, rowIndex) => (
                        <div key={rowIndex} className="flex flex-row">
                            {row.map((cell, colIndex) => (
                                <CellComponent
                                    key={`${rowIndex + 1}-${colIndex}`}
                                    cell={cell}
                                    isActive={
                                        activeCellsManager &&
                                        activeCellsManager.activeOutputCells.some(
                                            (coordinates) =>
                                                coordinates.row === rowIndex &&
                                                coordinates.col === colIndex
                                        )
                                    }
                                    hiddenSignalsSet={new Set()}
                                    onClick={(event) =>
                                        handleClickOutputCell(
                                            rowIndex,
                                            colIndex,
                                            event
                                        )
                                    }
                                    colorMap={colorMap}
                                />
                            ))}
                        </div>
                    ))}
            </div>
            <div className="flex flex-row">
                {grid.inputCells
                    .slice()
                    .map((cell: InputCell, colIndex: number) => {
                        return (
                            <CellComponent
                                key={`0-${colIndex}`}
                                cell={
                                    new InputCell(
                                        cell.signals,
                                        cell.negatedSignals
                                    )
                                }
                                isActive={
                                    activeCellsManager &&
                                    activeCellsManager.activeInputCells.includes(
                                        colIndex
                                    )
                                }
                                hiddenSignalsSet={new Set()}
                                onClick={(event) =>
                                    handleClickInputCell(colIndex, event)
                                }
                                colorMap={colorMap}
                            />
                        );
                    })}
            </div>
        </div>
    );
}
