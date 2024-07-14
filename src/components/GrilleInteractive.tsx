import { Signal } from "../types.ts";
import "../style/Cell.css";
import GestionnaireSignauxGrille from "./GestionnaireSignauxGrille.tsx";
import RuleGrid from "../classes/RuleGrid.ts";
import RowOutputs from "./RowOutputs.tsx";
import RowInputs from "./RowInputs.tsx";
import {InputCell} from "../classes/Cell.ts";

type GrilleInteractiveProps = {
    grid: RuleGrid;
    activeCells: { row: number; col: number, isInput : boolean }[];
    listeSignaux: Signal[];
    handleAddSignal: (signal: Signal) => void;
    handleRemoveSignal: (signal: Signal) => void;
    handleAddNegatedSignal : (signal: Signal) => void
    handleRemoveNegatedSignal:(signal : Signal) => void 
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
                               handleRemoveNegatedSignal
                           }: GrilleInteractiveProps): JSX.Element => {
    function setActiveSignals(): {active: Signal[], negated: Signal[]} {
        if (activeCells.length === 0) {
            return { active: [], negated: [] };
        }
        const activeSignals: Set<Signal> = new Set();
        const negatedSignals: Set<Signal> = new Set();
        activeCells.forEach((cell) => {
            let cellule;
            if (cell.isInput) {
                cellule = grid.getCaseInput(cell.col);
            } else {
                cellule = grid.getCaseOutput(cell.row, cell.col);
            }
            if (cellule) {
                cellule.signals.forEach((signal) => {
                    activeSignals.add(signal);
                });
                if (cellule instanceof InputCell) {
                    cellule.negatedSignals.forEach((signal) => {
                        negatedSignals.add(signal);
                    });
                }
            }
        });
        return {
            active: Array.from(activeSignals),
            negated: Array.from(negatedSignals)
        };
    }

    const { active, negated } = setActiveSignals();

    return (
        <div style={{ display: "flex" }}>
            <div>
                <h1>Grille Interactive</h1>
                <div className="grid-container">
                    {Array.from({ length: grid.outputs[0].length }).map((_, colIndex) => (
                        <RowOutputs
                            key={colIndex}
                            rowIndex={0}
                            colIndex={colIndex}
                            grid={grid}
                            activeCells={activeCells}
                            handleCaseClick={handleCaseClick}
                        />
                    ))}
                    {Array.from({ length: grid.inputs.length }).map((_, colIndex) => (
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
                        activeSignals={active}
                        allSignals={listeSignaux}
                        negatedSignals={negated} // Passer ceci
                        onAddSignal={handleAddSignal}
                        onRemoveSignal={handleRemoveSignal}
                        onAddAllSignals={handleAddAllSignals}
                        onRemoveAllSignals={handleRemoveAllSignals}
                        onAddNegatedSignal={handleAddNegatedSignal}
                        onRemoveNegatedSignal={handleRemoveNegatedSignal}
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