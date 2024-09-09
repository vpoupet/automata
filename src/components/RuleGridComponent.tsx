import { MdChangeCircle, MdDelete } from "react-icons/md";
import Cell, { InputCell } from "../classes/Cell";
import RuleGrid from "../classes/RuleGrid";
import { Signal } from "../types";
import Button from "./Button";
import CellComponent from "./CellComponent";

interface RuleGridComponentProps {
    inputCells: InputCell[];
    outputCells: Cell[][];
    colorMap: Map<Signal, string>;
}

export default function RuleGridComponent(props: RuleGridComponentProps) {
    const { inputCells, outputCells, colorMap } = props;
    const grid = new RuleGrid(inputCells, outputCells);
    return (
        <div className="m-2 shadow-md p-2 flex flex-col items-center gap-2 bg-gray-100">
            <div className="flex flex-col items-center">
                <div className="mb-1">
                    {grid.outputCells
                        .slice()
                        .reverse()
                        .map((row, rowIndex) => (
                            <div key={rowIndex} className="flex flex-row">
                                {row.map((cell, colIndex) => (
                                    <CellComponent
                                        key={`${rowIndex + 1}-${colIndex}`}
                                        cell={cell}
                                        hiddenSignalsSet={new Set()}
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
                                    hiddenSignalsSet={new Set()}
                                    colorMap={colorMap}
                                />
                            );
                        })}
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary">
                    <MdDelete />
                </Button>
                <Button variant="secondary">
                    <MdChangeCircle />
                </Button>
            </div>
        </div>
    );
}
