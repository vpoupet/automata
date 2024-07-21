import { InputCell } from "../classes/Cell.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import "../style/Cell.scss";
import { DiagramCell } from "./Diagram.tsx";

type RuleGridComponentProps = {
    grid: RuleGrid;
    onDeleteRule: () => void;
    onUpdateRule: () => void;
    onLoadRule: () => void;
    signalIndex: { [key: string]: number };
};

export default function RuleGridComponent({
    grid,
    onDeleteRule,
    onUpdateRule,
    onLoadRule,
    signalIndex,
}: RuleGridComponentProps): JSX.Element {
    return (
        <div style={{ display: "inline-block" }}>
            <div
                onClick={() => onLoadRule()}
                style={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {grid.outputs
                    .slice()
                    .reverse()
                    .map((row, rowIndex) => (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            {row.map((cell, colIndex) => (
                                <DiagramCell
                                    key={`${rowIndex + 1}-${colIndex}`}
                                    cell={cell}
                                    className=""
                                    signalIndex={signalIndex}
                                />
                            ))}
                        </div>
                    ))}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                    }}
                >
                    {grid.inputs
                        .slice()
                        .map((cell: InputCell, colIndex: number) => {
                            return (
                                <DiagramCell
                                    key={`0-${colIndex}`}
                                    cell={
                                        new InputCell(
                                            cell.signals,
                                            cell.negatedSignals
                                        )
                                    }
                                    className=""
                                    signalIndex={signalIndex}
                                />
                            );
                        })}
                </div>
            </div>
            <div>
                <button onClick={onDeleteRule}>Supprimer</button>
                <button onClick={onUpdateRule}>Mettre à jour</button>
            </div>
        </div>
    );
}
