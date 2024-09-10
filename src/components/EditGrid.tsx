import Automaton from "../classes/Automaton.ts";
import Cell from "../classes/Cell.ts";
import Rule, {
    adaptRule,
    ConjunctionRule,
    RuleOutput,
} from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import "../style/Cell.scss";
import type { Coordinates, SettingsInterface, Signal } from "../types.ts";
import Button from "./Button.tsx";
import GridComponent from "./GridComponent.tsx";
import GridSignalsManager from "./GridSignalsManager.tsx";

type EditGridProps = {
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    settings: SettingsInterface;
    automaton: Automaton;
    extraSignalsSet: Set<Signal>;
    activeInputCells: number[];
    setActiveInputCells: (activeInputCells: number[]) => void;
    activeOutputCells: Coordinates[];
    setActiveOutputCells: (activeOutputCells: Coordinates[]) => void;
    colorMap: Map<Signal, string>;
};

export default function EditGrid({
    grid,
    setGrid,
    settings,
    automaton,
    extraSignalsSet,
    activeInputCells,
    setActiveInputCells,
    activeOutputCells,
    setActiveOutputCells,
    colorMap,
}: EditGridProps): JSX.Element {
    const signalsList = automaton.getSignalsList(extraSignalsSet);

    function applyToActiveCells(f: (cell: Cell) => void) {
        const newGrid = grid.clone();
        activeInputCells.forEach((col) => {
            const cell = newGrid.inputCells[col];
            f(cell);
        });
        activeOutputCells.forEach(({ row, col }) => {
            const cell = newGrid.outputCells[row][col];
            f(cell);
        });
        setGrid(newGrid);
    }

    function removeAllSignals() {
        const newGrid = RuleGrid.withSize(2 * settings.gridRadius + 1, settings.gridNbFutureSteps);
        setGrid(newGrid);
    }

    function saveGridAsRule() {
        function hasOutputs(): boolean {
            for (const row of grid.outputCells) {
                for (const cell of row) {
                    if (cell.signals.size > 0) {
                        return true;
                    }
                }
            }
            return false;
        }

        if (hasOutputs()) {
            // const rule = grid.makeRule();
            // automaton.addRule(rule);
            removeAllSignals();
        } else {
            alert("La règle n'a pas d'outputs");
        }
    }

    function modifyRule() {
        const context = automaton.getEvalContext();
        const ruleFromGrid = grid.clone().makeRule();
        const newRules: Rule[] = [];
        let setOutput: Set<RuleOutput> = new Set();
        for (const rule of automaton.getRules()) {
            const ruleAndOutput = adaptRule(
                rule as ConjunctionRule,
                ruleFromGrid,
                context
            );
            setOutput = new Set([...setOutput, ...ruleAndOutput.outputs]);
            newRules.push(...ruleAndOutput.rules);
        }
        for (let i = 0; i < ruleFromGrid.outputs.length; i++) {
            if (setOutput.has(ruleFromGrid.outputs[i])) {
                ruleFromGrid.outputs.splice(i, 1);
                i--;
            }
        }
        if (ruleFromGrid.outputs.length > 0) {
            newRules.push(ruleFromGrid);
        }
    }

    // Make list of active and negated signals on the active cells
    const activeSignals: Set<Signal> = new Set();
    const negatedSignals: Set<Signal> = new Set();
    activeInputCells.forEach((col) => {
        const cell = grid.inputCells[col];
        if (cell) {
            cell.signals.forEach((signal) => {
                activeSignals.add(signal);
            });
            cell.negatedSignals.forEach((signal) => {
                negatedSignals.add(signal);
            });
        }
    });
    activeOutputCells.forEach((coordinates) => {
        const cell = grid.outputCells[coordinates.row]?.[coordinates.col] as
            | Cell
            | undefined;
        if (cell !== undefined) {
            cell.signals.forEach((signal) => {
                activeSignals.add(signal);
            });
        }
    });

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col-reverse w-fit">
                <GridComponent
                    inputCells={grid.inputCells}
                    outputCells={grid.outputCells}
                    colorMap={colorMap}
                    activeCellsManager={{
                        activeInputCells,
                        setActiveInputCells,
                        activeOutputCells,
                        setActiveOutputCells,
                    }}
                />
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={removeAllSignals}>
                    Effacer
                </Button>
                <Button onClick={saveGridAsRule}>Ajouter règle</Button>
                <Button
                    onClick={() => {
                        modifyRule();
                        removeAllSignals();
                    }}
                >
                    Adapter règles
                </Button>
            </div>
            <GridSignalsManager
                activeSignals={activeSignals}
                negatedSignals={negatedSignals}
                allSignals={signalsList}
                applyToActiveCells={applyToActiveCells}
            />
        </div>
    );
}
