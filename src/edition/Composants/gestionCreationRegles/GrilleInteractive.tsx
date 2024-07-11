import { Signal } from "../../../classes/types.ts";
import "../../../style/Cell.css";
import GestionnaireSignauxGrille from "./GestionnaireSignauxGrille.tsx";
import RuleGrid from "../../Objets/RuleGrid.ts";
import RowOutputs from "./RowOutputs.tsx";
import RowInputs from "./RowInputs.tsx";

type GrilleInteractiveProps = {
    grid: RuleGrid;
    activeCells: { row: number; col: number, isInput : boolean }[];
    listeSignaux: Signal[];
    handleAddSignal: (signal: Signal) => void;
    handleRemoveSignal: (signal: Signal) => void;
    handleAddNegatedSignal : (signal: Signal) => void
    handleAddAllSignals: () => void;
    handleRemoveAllSignals: () => void;
    handleRemoveAllSignalsFromGrid: () => void;
    handleCaseClick: (
        rowIndex: number,
        colIndex: number,
        isInput: boolean,
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
                               handleAddNegatedSignal,
                           }: GrilleInteractiveProps): JSX.Element => {
    function setActiveSignals(): Signal[] {
        if (activeCells.length === 0) {
            return [];
        }
        const signals: Set<Signal> = new Set();
        activeCells.forEach((cell) => {
            let cellule;
            if (cell.isInput){
                cellule=grid.getCaseInput(cell.col);
            }
            else {
                cellule=grid.getCaseOutput(cell.row, cell.col)
            }
            if (cellule) {
                cellule.signals.forEach((signal) => {
                    signals.add(signal);
                });
            }
        });
        return Array.from(signals).filter((signal: Signal) =>
            activeCells.every((cell) => {
                let cellule;
                if (cell.isInput){
                    cellule=grid.getCaseInput(cell.col)
                }
                else{
                    cellule=grid.getCaseOutput(cell.row, cell.col)
                }
                return cellule && cellule.signals.has(signal);
            })
        );
    }

    return (
        <div style={{display: "flex"}}>
            <div>
                <h1>Grille Interactive</h1>
                <div className="grid-container">
                    {Array.from({length: grid.outputs[0].length}).map((_, colIndex) => (
                        <RowOutputs
                            key={colIndex}
                            rowIndex={0}
                            colIndex={colIndex}
                            grid={grid}
                            activeCells={activeCells}
                            handleCaseClick={handleCaseClick}
                        />
                    ))}
                    {Array.from({length: grid.inputs.length}).map((_, colIndex) => (
                        <RowInputs
                            key={colIndex}
                            colIndex={colIndex}
                            grid={grid}
                            activeCells={activeCells}
                            handleCaseClick={handleCaseClick}
                        />
                    ))}
                </div>
                <div>
                    <button onClick={handleRemoveAllSignalsFromGrid}>
                        Supprimer tous les signaux de la grille
                    </button>
                </div>
                {activeCells.length > 0 && (
                    <GestionnaireSignauxGrille
                        activeSignals={setActiveSignals()}
                        allSignals={listeSignaux}
                        onAddSignal={handleAddSignal}
                        onRemoveSignal={handleRemoveSignal}
                        onAddAllSignals={handleAddAllSignals}
                        onRemoveAllSignals={handleRemoveAllSignals}
                        onAddNegatedSignal={handleAddNegatedSignal}
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
}

export default GrilleInteractive;
