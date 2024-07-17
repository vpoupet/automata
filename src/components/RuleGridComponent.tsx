import { DiagramCell } from "./Diagram.tsx";
import "../style/Cell.css";
import RuleGrid from "../classes/RuleGrid.ts";
import { InputCell } from "../classes/Cell.ts";

type RuleGridComponentProps = {
    grid: RuleGrid;
    onDeleteRule: () => void;
    onUpdateRule: () => void;
    onLoadRule: () => void;
};

export default function RuleGridComponent({
    grid, onDeleteRule, onUpdateRule, onLoadRule
}: RuleGridComponentProps): JSX.Element {
    return (
        <div style={{ display: "inline-block" }}>
            <div  onClick={() =>onLoadRule()}
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
                <button onClick={onDeleteRule}>Supprimer</button>
                <button onClick={onUpdateRule}>Mettre à jour</button>
            </div>
        </div>
    );
}
