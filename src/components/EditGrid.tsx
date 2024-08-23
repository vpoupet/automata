import { useState } from "react";
import { Automaton } from "../classes/Automaton.ts";
import { Cell } from "../classes/Cell.ts";
import {
    adaptRule,
    ConjunctionRule,
    Rule,
    RuleOutput,
} from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import "../style/Cell.scss";
import { Coordinates, Signal } from "../types.ts";
import InputsRow from "./GridInputsRow.tsx";
import GridOutputsRow from "./GridOutputsRow.tsx";
import GridSignalsManager from "./GridSignalsManager.tsx";
import { Button } from "./Button.tsx";

type EditGridProps = {
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    nbFutureSteps: number;
    radius: number;
    rulesGrid: RuleGrid[];
    setRulesGrid: (rulesGrid: RuleGrid[]) => void;
    automaton: Automaton;
    signalsList: Signal[];
};

export default function EditGrid({
    grid,
    setGrid,
    radius,
    nbFutureSteps,
    rulesGrid,
    setRulesGrid,
    automaton,
    signalsList,
}: EditGridProps): JSX.Element {
    function applyToActiveCells(f: (cell: Cell) => void) {
        const newGrid = grid.clone();
        activeInputCells.forEach((col) => {
            const cell = newGrid.inputs[col];
            f(cell);
        });
        activeOutputCells.forEach(({ row, col }) => {
            const cell = newGrid.outputs[row][col];
            f(cell);
        });
        setGrid(newGrid);
    }

    function removeAllSignals() {
        const newGrid = RuleGrid.withSize(2 * radius + 1, nbFutureSteps);
        setGrid(newGrid);
    }
    const [activeInputCells, setActiveInputCells] = useState<number[]>([]);
    const [activeOutputCells, setActiveOutputCells] = useState<Coordinates[]>(
        []
    );
    function saveGridAsRule() {
        let hasOutputs = false;
        outer: for (const row of grid.outputs) {
            for (const cell of row) {
                if (cell.signals.size > 0) {
                    hasOutputs = true;
                    break outer;
                }
            }
        }
        if (hasOutputs) {
            setRulesGrid([...rulesGrid, grid.clone()]);
        }
        removeAllSignals();
    }

    // function applyRules() {
    //     //todo : ajouter 1 seul "output" par règle ?
    //     const newGrille = grid.clone();
    //     const conffromgrid = newGrille.getConfigurationFromGrid();
    //     const conf = automaton.makeDiagram(conffromgrid, grid.outputs.length);
    //     newGrille.setGridFromConfigurations(conf);
    //     setGrid(newGrille);
    // }

    function modifyRule() {
        const ruleFromGrid = RuleGrid.makeRule(grid.clone());
        const newRules: Rule[] = [];
        let setOutput: Set<RuleOutput> = new Set();
        for (const rule of automaton.getRules()) {
            const ruleAndOutput = adaptRule(
                rule as ConjunctionRule,
                ruleFromGrid,
                automaton.evalContext,
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
        // setRulesGrid(newRules.map(getRuleGrid));
        setRulesGrid(
            newRules.map((rule) =>
                RuleGrid.makeGridFromRule(rule, automaton.evalContext, radius, nbFutureSteps)
            )
        );
    }

    // Make list of active and negated signals on the active cells
    const activeSignals: Set<Signal> = new Set();
    const negatedSignals: Set<Signal> = new Set();
    activeInputCells.forEach((col) => {
        const cell = grid.inputs[col];
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
        const cell = grid.outputs[coordinates.row]?.[coordinates.col];
        if (cell) {
            cell.signals.forEach((signal) => {
                activeSignals.add(signal);
            });
        }
    });

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col-reverse w-fit">
                <InputsRow
                    inputs={grid.inputs}
                    activeInputCells={activeInputCells}
                    setActiveInputCells={setActiveInputCells}
                    setActiveOutputCells={setActiveOutputCells}
                    signalsList={signalsList}
                />
                {grid.outputs.map((row, rowIndex) => (
                    <GridOutputsRow
                        key={rowIndex}
                        outputs={row}
                        rowIndex={rowIndex}
                        activeOutputCells={activeOutputCells}
                        setActiveInputCells={setActiveInputCells}
                        setActiveOutputCells={setActiveOutputCells}
                        signalsList={signalsList}
                    />
                ))}
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={removeAllSignals}>
                    Effacer
                </Button>
                <Button onClick={saveGridAsRule}>Ajouter règle</Button>
                {/* <Button onClick={applyRules}>
                    Appliquer règles sur la grille
                </Button> */}
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
