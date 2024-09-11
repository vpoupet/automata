import Automaton from "../classes/Automaton.ts";
import Cell from "../classes/Cell.ts";
import Rule, { RuleOutput } from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import "../style/Cell.scss";
import type { Coordinates, SettingsInterface, Signal } from "../types.ts";
import Button from "./Common/Button.tsx";
import Frame from "./Common/Frame.tsx";
import GridComponent from "./GridComponent.tsx";
import GridSignalsManager from "./GridSignalsManager.tsx";

type EditGridProps = {
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    settings: SettingsInterface;
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
    extraSignalsSet: Set<Signal>;
    activeInputCells: number[];
    setActiveInputCells: (activeInputCells: number[]) => void;
    activeOutputCells: Coordinates[];
    setActiveOutputCells: (activeOutputCells: Coordinates[]) => void;
    colorMap: Map<Signal, string>;
};

export default function EditGrid(props: EditGridProps): JSX.Element {
    const {
        grid,
        setGrid,
        settings,
        automaton,
        setAutomaton,
        extraSignalsSet,
        activeInputCells,
        setActiveInputCells,
        activeOutputCells,
        setActiveOutputCells,
        colorMap,
    } = props;
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

    function clearGrid() {
        const newGrid = RuleGrid.withSize(
            2 * settings.gridRadius + 1,
            settings.gridNbFutureSteps
        );
        setGrid(newGrid);
    }

    function clearCell() {
        applyToActiveCells((cell) => {
            cell.removeAllSignals();
        });
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
            setAutomaton(automaton.addRule(grid.makeRule()));
            clearGrid();
        } else {
            alert("Rule has no outputs");
        }
    }

    function fitRules() {
        const context = automaton.getEvalContext();
        const ruleFromGrid = grid.makeRule();
        const newRules: Rule[] = [];
        let totalMatchedOutputs: Set<RuleOutput> = new Set();
        for (const rule of automaton.rules) {
            const { rules, matchedOutputs } = rule.fitTarget(
                ruleFromGrid,
                context
            );
            newRules.push(...rules);
            totalMatchedOutputs = totalMatchedOutputs.union(matchedOutputs);
        }

        const remainingOutputs = new Set(ruleFromGrid.outputs).difference(
            totalMatchedOutputs
        );
        if (remainingOutputs.size > 0) {
            newRules.push(
                new Rule(ruleFromGrid.condition, Array.from(remainingOutputs))
            );
        }

        setAutomaton(new Automaton(newRules, automaton.multiSignals));
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
        <Frame className="flex flex-col items-center gap-2">
            <Frame variant="gray" className="flex flex-col gap-4">
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
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={clearCell}>
                        Clear cell
                    </Button>
                    <Button variant="secondary" onClick={clearGrid}>
                        Clear grid
                    </Button>
                    <Button onClick={saveGridAsRule}>Add rule</Button>
                    <Button
                        onClick={() => {
                            fitRules();
                            clearGrid();
                        }}
                    >
                        Fit rules
                    </Button>
                </div>
            </Frame>
            <GridSignalsManager
                activeSignals={activeSignals}
                negatedSignals={negatedSignals}
                allSignals={signalsList}
                applyToActiveCells={applyToActiveCells}
                colorMap={colorMap}
            />
        </Frame>
    );
}
