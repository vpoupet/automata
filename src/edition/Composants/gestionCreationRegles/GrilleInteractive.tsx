import { Signal } from "../../../classes/types.ts";
import { Cell } from "../../../components/Diagram.tsx";
import "../../../style/Cell.css";
import Grille from "../../Objets/Grille.ts";
import GestionnaireSignauxGrille from "./GestionnaireSignauxGrille.tsx";

type GrilleInteractiveProps = {
    grille: Grille;
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
    grille,
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
            const cellule = grille.getCase(cell.row, cell.col);
            if (cellule) {
                cellule.signals.forEach((signal) => {
                    signals.add(signal);
                });
            }
        });
        return Array.from(signals).filter((signal: Signal) =>
            activeCells.every((cell) => {
                const cellule = grille.getCase(cell.row, cell.col);
                return cellule && cellule.signals.has(signal);
            })
        );
    }

    return (
        <div style={{ display: "flex" }}>
            <div>
                <h1>Grille Interactive</h1>
                <div className="grid-container">
                    {Array.from({ length: grille.grid[0].length }).map(
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
                                {Array.from({ length: grille.grid.length }).map(
                                    (_, rowIndex) => {
                                        const caseObj = grille.getCase(
                                            grille.grid.length - 1 - rowIndex,
                                            colIndex
                                        );
                                        const isActive = activeCells.some(
                                            (cell) =>
                                                cell.row ===
                                                    grille.grid.length -
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
                                                            grille.grid.length -
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
