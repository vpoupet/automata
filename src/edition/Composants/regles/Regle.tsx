import { Cell } from "../../../classes/Cell.ts";
import { DiagramCell } from "../../../components/Diagram.tsx";
import "../../../style/Cell.css";

type RegleProps = {
    grille: Cell[][];
    onLoadRule: () => void;
    onDeleteRule: () => void;
    onUpdateRule: () => void;
    activeRule: boolean;
};

const Regle = ({
    grille,
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
                    gridTemplateColumns: `repeat(${grille[0].length}, 1fr)`,
                    gap: "0px",
                    backgroundColor: activeRule ? "blue" : "white",
                }}
            >
                {grille
                    .slice()
                    .reverse()
                    .map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <DiagramCell
                                key={`${rowIndex}-${colIndex}`}
                                cell={cell}
                                className=""
                            />
                        ))
                    )}
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
