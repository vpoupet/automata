import Automaton from "../classes/Automaton.ts";
import Cell from "../classes/Cell.ts";
import Configuration from "../classes/Configuration.ts";
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

    function clearInputs() {
        const newGrid = RuleGrid.withSize(
            2 * settings.gridRadius + 1,
            settings.gridNbFutureSteps
        );
        newGrid.outputCells = grid.outputCells;
        setGrid(newGrid);
    }

    function clearOutputs() {
        const newGrid = RuleGrid.withSize(
            2 * settings.gridRadius + 1,
            settings.gridNbFutureSteps
        );
        newGrid.inputCells = grid.inputCells;
        setGrid(newGrid);
    }

    function clearSelected() {
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

    function applyRules(): RuleGrid {
        const configuration = new Configuration(
            grid.inputCells.map((c) => new Cell(c.signals))
        );
        const nextConfigurations = automaton.applyRules(configuration);
        while (nextConfigurations.length < settings.gridNbFutureSteps) {
            nextConfigurations.push(
                new Configuration(
                    Array.from(
                        { length: 2 * settings.gridRadius + 1 },
                        () => new Cell()
                    )
                )
            );
        }

        const newGrid = new RuleGrid(
            grid.inputCells,
            nextConfigurations
                .slice(0, settings.gridNbFutureSteps)
                .map((config) => config.cells)
        );
        return newGrid;
    }

    function fitRules() {
        const context = automaton.getEvalContext();
        const newRules: Rule[] = [];
        for (const rule of automaton.rules) {
            newRules.push(...rule.fitTarget(grid, context));
        }

        const currentGrid = applyRules();
        const gridRadius = grid.getRadius();
        const addedOutputs: RuleOutput[] = [];
        for (let t = 0; t < grid.outputCells.length; t++) {
            for (let c = 0; c < grid.outputCells[t].length; c++) {
                for (const s of grid.outputCells[t][c].signals) {
                    if (!currentGrid.outputCells[t][c].signals.has(s)) {
                        addedOutputs.push(
                            new RuleOutput(c - gridRadius, s, t + 1)
                        );
                    }
                }
            }
        }
        if (addedOutputs.length > 0) {
            newRules.push(new Rule(grid.makeRuleCondition(true), addedOutputs));
        }
        setAutomaton(new Automaton(newRules, automaton.multiSignals));
        clearGrid();
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
        <Frame className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2 items-center">
                    <div className="flex gap-2">
                        <Button onClick={saveGridAsRule}>Add rule</Button>
                        <Button onClick={() => setGrid(applyRules())}>
                            Apply rules
                        </Button>
                        <Button onClick={fitRules}>Fit rules</Button>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="font-bold">Clear: </span>
                        <Button variant="secondary" onClick={clearSelected}>
                            <span className="flex items-center gap-1">
                                selected
                            </span>
                        </Button>
                        <Button variant="secondary" onClick={clearInputs}>
                            <span className="flex items-center gap-1">
                                inputs
                            </span>
                        </Button>
                        <Button variant="secondary" onClick={clearOutputs}>
                            <span className="flex items-center gap-1">
                                outputs
                            </span>
                        </Button>
                        <Button variant="secondary" onClick={clearGrid}>
                            <span className="flex items-center gap-1">
                                grid
                            </span>
                        </Button>
                    </div>
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
