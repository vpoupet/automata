import { Signal } from "../types.ts";
import "../style/Cell.css";
import GestionnaireSignauxGrille from "./GestionnaireSignauxGrille.tsx";
import RuleGrid from "../classes/RuleGrid.ts";
import RowOutputs from "./RowOutputs.tsx";
import RowInputs from "./RowInputs.tsx";
import { Cell, InputCell } from "../classes/Cell.ts";

type GrilleInteractiveProps = {
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    rows: number;
    cols: number;
    activeCells: { row: number; col: number; isInput: boolean }[];
    listeSignaux: Signal[];
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
    setGrid,
    rows,
    cols,
    activeCells,
    listeSignaux,
    handleCaseClick,
    handleSaveRule,
    applyRules,
    modifyRule,
}: GrilleInteractiveProps): JSX.Element => {

    const updateGrille = (callback: (cellule: Cell) => void) => {
        const newGrid = grid.clone();
        activeCells.forEach(({ row, col, isInput }) => {
            let cell;
            if (isInput) {
                cell = newGrid.inputs[col];
            } else {
                cell = newGrid.outputs[row][col];
            }
            callback(cell);
        });
        setGrid(newGrid);
    };
    
    const handleAddSignal = (signal: Signal) => {
        updateGrille((caseObj: Cell) => caseObj.addSignal(signal));
    };

    const handleRemoveSignal = (signal: Signal) => {
        updateGrille((caseObj: Cell) => caseObj.removeSignal(signal));
    };

    const handleAddNegatedSignal = (signal: Signal) => {
        updateGrille((caseObj: Cell) => caseObj.addNegatedSignal(signal));
        console.log("updaaaaaate");
    };

    const handleRemoveNegatedSignal = (signal: Signal) => {
        updateGrille((caseObj: Cell) => caseObj.removeNegatedSignal(signal));
    };
    
    const handleAddAllSignals = () => {
        updateGrille((caseObj: Cell) => {
            listeSignaux.forEach((signal) => caseObj.addSignal(signal));
        });
    };

    const handleRemoveAllSignals = () => {
        updateGrille((caseObj: Cell) => {
            caseObj.removeAllSignals();
        });
    };

    const handleRemoveAllSignalsFromGrid = () => {
        const newGrid = new RuleGrid(rows, cols);
        setGrid(newGrid);
    };

    function setActiveSignals(): { active: Signal[]; negated: Signal[] } {
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
            negated: Array.from(negatedSignals),
        };
    }

    const { active, negated } = setActiveSignals();

    return (
        <div style={{ display: "flex" }}>
            <div>
                <h1>Grille Interactive</h1>
                <div className="grid-container">
                    {Array.from({ length: grid.outputs[0].length }).map(
                        (_, colIndex) => (
                            <RowOutputs
                                key={colIndex}
                                rowIndex={0}
                                colIndex={colIndex}
                                grid={grid}
                                activeCells={activeCells}
                                handleCaseClick={handleCaseClick}
                            />
                        )
                    )}
                    {Array.from({ length: grid.inputs.length }).map(
                        (_, colIndex) => (
                            <RowInputs
                                key={colIndex}
                                colIndex={colIndex}
                                grid={grid}
                                activeCells={activeCells}
                                handleCaseClick={handleCaseClick}
                            />
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
};

export default GrilleInteractive;
