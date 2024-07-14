import { DiagramCell } from "./Diagram.tsx";
import "../style/Cell.css";
import RuleGrid from "../classes/RuleGrid.ts";
import { InputCell } from "../classes/Cell.ts";

type RuleGridComponentProps = {
    grid: RuleGrid;
    onLoadRule: () => void;
    onDeleteRule: () => void;
    onUpdateRule: () => void;
};

export default function RuleGridComponent({
    grid, onLoadRule, onDeleteRule, onUpdateRule,
}: RuleGridComponentProps): JSX.Element {
    return (
        <div style={{ display: "inline-block" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${grid.inputs.length}, 1fr)`,
                    gap: "0px",
                }}
            >
                {grid.outputs
                    .slice()
                    .reverse()
                    .map((row, rowIndex) => row.map((cell, colIndex) => (
                        <DiagramCell
                            key={`${rowIndex + 1}-${colIndex}`}
                            cell={cell}
                            className="" />
                    ))
                    )}
                {grid.inputs
                    .slice()
                    .reverse()
                    .map((cell: InputCell, colIndex: number) => {
                        return (
                            <DiagramCell
                                key={`0-${colIndex}`}
                                cell={new InputCell(
                                    cell.signals,
                                    cell.negatedSignals
                                )}
                                className="" />
                        );
                    })}
            </div>
            <div>
                <button onClick={onLoadRule}>Mettre dans grille</button>
                <button onClick={onDeleteRule}>Supprimer</button>
                <button onClick={onUpdateRule}>Mettre à jour</button>
            </div>
        </div>
    );
}
