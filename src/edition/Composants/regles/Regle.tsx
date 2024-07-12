import { DiagramCell } from "../../../components/Diagram.tsx";
import "../../../style/Cell.css";
import RuleGrid from "../../Objets/RuleGrid.ts";
import {InputCell} from "../../../classes/Cell.ts";

type RegleProps = {
    grid: RuleGrid;
    onLoadRule: () => void;
    onDeleteRule: () => void;
    onUpdateRule: () => void;
};

const Regle = ({
    grid,
    onLoadRule,
    onDeleteRule,
    onUpdateRule,
}: RegleProps): JSX.Element => {
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
                    .map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <DiagramCell
                                key={`${rowIndex+1}-${colIndex}`}
                                cell={cell}
                                className=""
                            />
                        ))
                    )}
                {grid.inputs.slice().reverse().map((cell : InputCell, colIndex : number) => {
                    return (
                        <DiagramCell
                            key={`0-${colIndex}`}
                            cell={new InputCell(cell.signals, cell.negatedSignals)}
                            className=""
                        />
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
};

export default Regle;
