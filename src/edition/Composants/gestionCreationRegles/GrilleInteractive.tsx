import { Signal } from "../../../classes/types.ts";
import { Cell } from "../../../components/Diagram.tsx";
import "../../../style/Cell.css";
import GestionnaireSignauxGrille from "./GestionnaireSignauxGrille.tsx";
import RuleGrid from "../../Objets/RuleGrid.ts";

type GrilleInteractiveProps = {
    grid: RuleGrid;
    activeCells: { row: number; col: number }[];
    listeSignaux: Signal[];
    handleAddSignal: (signal: Signal) => void;
    handleRemoveSignal: (signal: Signal) => void;
    handleAddAllSignals: () => void;
    handleRemoveAllSignals: () => void;
    handleRemoveAllSignalsFromGrid: () => void;
    handleCaseClick: (
        rowIndex: number,
        colIndex: number,
        event: React.MouseEvent<Element, MouseEvent>
    ) => void;
    handleSaveRule: () => void;
    applyRules: () => void;
    modifyRule: () => void;
};

const GrilleInteractive = ({
    grid,
    activeCells,
    listeSignaux,
    handleAddSignal,
    handleRemoveSignal,
    handleAddAllSignals,
    handleRemoveAllSignals,
    handleRemoveAllSignalsFromGrid,
    handleCaseClick,
    handleSaveRule,
    applyRules,
    modifyRule,
}: GrilleInteractiveProps): JSX.Element => {
    function setActiveSignals(): Signal[] {
        if (activeCells.length === 0) {
            return [];
        }
        const signals: Set<Signal> = new Set();
        activeCells.forEach((cell) => {
            const cellule = grid.getCase(cell.row, cell.col);
            if (cellule) {
                cellule.signals.forEach((signal) => {
                    signals.add(signal);
                });
            }
        });
        return Array.from(signals).filter((signal: Signal) =>
            activeCells.every((cell) => {
                const cellule = grid.getCase(cell.row, cell.col);
                return cellule && cellule.signals.has(signal);
            })
        );
    }

    return (
        <div style={{ display: "flex" }}>
            <div>
                <h1>Grille Interactive</h1>
                <div className="grid-container">
                    {Array.from({ length: grid.outputs[0].length }).map(
                        (_, colIndex) => (
                            <div key={colIndex} className="row">
                                <div
                                    style={{
                                        width: "30px",
                                        textAlign: "center",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    {colIndex + 1}
                                </div>
                                {Array.from({ length: grid.outputs.length }).map(
                                    (_, rowIndex) => {
                                        const caseObj = grid.getCase(
                                            //Todo : à vérif c'est bizarre
                                            grid.outputs.length - 1 - rowIndex,
                                            colIndex
                                        );
                                        const isActive = activeCells.some(
                                            (cell) =>
                                                cell.row ===
                                                    grid.outputs.length -
                                                        1 -
                                                        rowIndex &&
                                                cell.col === colIndex
                                        );
                                        return (
                                            caseObj && (
                                                <Cell
                                                    key={rowIndex}
                                                    cell={caseObj.signals}
                                                    onClick={(event) =>
                                                        handleCaseClick(
                                                            grid.outputs.length -
                                                                1 -
                                                                rowIndex,
                                                            colIndex,
                                                            event
                                                        )
                                                    }
                                                    className={
                                                        isActive ? "active" : ""
                                                    }
                                                />
                                            )
                                        );
                                    }
                                )}
                            </div>
                        )
                    )}
                    {Array.from({ length: grid.inputs.length }).map(
                        (_, colIndex) => (
                            <div key={colIndex} className="row">
                                <div
                                    style={{
                                        width: "30px",
                                        textAlign: "center",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    {colIndex + 1}
                                </div>
                                {grid.inputs[colIndex] && (
                                    <Cell
                                        key={colIndex}
                                        cell={grid.inputs[colIndex].signals}
                                        onClick={(event) =>
                                            handleCaseClick(-1, colIndex, event)
                                        }
                                        className={
                                            activeCells.some(
                                                (cell) =>
                                                    cell.row === -1 &&
                                                    cell.col === colIndex
                                            )
                                                ? "active"
                                                : ""
                                        }
                                    />
                                )}
                            </div>
                        )
                    )
                    }
                </div>
                <div>
                    <button onClick={handleRemoveAllSignalsFromGrid}>
                        Supprimer tous les signaux de la grille
                    </button>
                </div>
                {activeCells.length > 0 && (
                    <GestionnaireSignauxGrille
                        signals={setActiveSignals()}
                        allSignals={listeSignaux}
                        onAddSignal={handleAddSignal}
                        onRemoveSignal={handleRemoveSignal}
                        onAddAllSignals={handleAddAllSignals}
                        onRemoveAllSignals={handleRemoveAllSignals}
                    />
                )}
                <button onClick={handleSaveRule}>Ajouter règle</button>
                <button onClick={applyRules}>
                    Appliquer règles sur la grille
                </button>
                <button onClick={modifyRule}>Adapter règles</button>
            </div>
        </div>
    );
};

export default GrilleInteractive;
