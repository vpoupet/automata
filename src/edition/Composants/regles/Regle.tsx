import { Cell } from "../../../components/Diagram.tsx";
import "../../../style/Cell.css";
import RuleGrid from "../../Objets/RuleGrid.ts";
import Cellule from "../../Objets/Cellule.ts";

type RegleProps = {
    grid: RuleGrid;
    onLoadRule: () => void;
    onDeleteRule: () => void;
    onUpdateRule: () => void;
    activeRule: boolean;
};

const Regle = ({
    grid,
    onLoadRule,
    onDeleteRule,
    onUpdateRule,
    activeRule,
}: RegleProps): JSX.Element => {
    return (
        <div style={{ display: "inline-block" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${grid.inputs.length}, 1fr)`,
                    gap: "0px",
                    backgroundColor: activeRule ? "blue" : "white",
                }}
            >
                {grid.outputs
                    .slice()
                    .reverse()
                    .map((row : Cellule[], rowIndex : number) =>
                        row.map((cell: { signals: Set<symbol>; }, colIndex: any) => (
                            <Cell
                                key={`${rowIndex}-${colIndex}`}
                                cell={cell.signals}
                                className=""
                            />
                        ))
                    )}
                {grid.inputs.slice().reverse().map((cell: { signals: Set<symbol>; }, colIndex: number) => (
                    <Cell
                        key={`input-${colIndex}`}
                        cell={cell.signals}
                        className=""
                    />
                ))}
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
