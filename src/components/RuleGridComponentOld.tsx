import { MdChangeCircle, MdDelete } from "react-icons/md";
import { InputCell } from "../classes/Cell.ts";
import Rule from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import "../style/Cell.scss";
import type { Signal } from "../types.ts";
import Button from "./Button.tsx";
import CellComponent from "./CellComponent.tsx";

type RuleGridComponentProps = {
    grid: RuleGrid;
    rule: Rule;
    onDeleteRule: () => void;
    onUpdateRule: () => void;
    onLoadRule: () => void;
    signalsList: Signal[];
    colorMap: Map<Signal, string>;
};

export default function RuleGridComponent({
    grid,
    rule,
    onDeleteRule,
    onUpdateRule,
    onLoadRule,
    colorMap,
}: RuleGridComponentProps): JSX.Element {
    return (
        <div className="m-2 shadow-md p-2 w-64 flex flex-col content-center gap-2 bg-gray-200">
            <div
                onClick={() => onLoadRule()}
                className="flex flex-col items-center"
            >
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
            <div>
                <span>{rule.toString()}</span>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={onDeleteRule}>
                    <MdDelete />
                </Button>
                <Button variant="secondary" onClick={onUpdateRule}>
                    <MdChangeCircle />
                </Button>
            </div>
        </div>
    );
}
