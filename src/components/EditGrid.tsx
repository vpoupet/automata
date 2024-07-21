import { Automaton } from "../classes/Automaton.ts";
import { Cell } from "../classes/Cell.ts";
import {adaptRule, ConjunctionRule, Rule, RuleOutput} from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import "../style/Cell.css";
import {Coordinates, Signal} from "../types.ts";
import InputsRow from "./GridInputsRow.tsx";
import GridOutputsRow from "./GridOutputsRow.tsx";
import GridSignalsManager from "./GridSignalsManager.tsx";
import {useState} from "react";

type EditGridProps = {
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    nbFutureSteps: number;
    radius: number;
    rulesGrid: RuleGrid[];
    setRulesGrid: (rulesGrid: RuleGrid[]) => void;
    automaton: Automaton;
    listeSignaux: Signal[];
};

export default function EditGrid({
                                     grid,
                                     setGrid,
                                     radius,
                                     nbFutureSteps,
                                     rulesGrid,
                                     setRulesGrid,
                                     automaton,
                                     listeSignaux,
                                 }: EditGridProps): JSX.Element {
    function applyToActiveCells(f: (cell: Cell) => void) {
        const newGrid = grid.clone();
        activeInputCells.forEach((col) => {
            const cell = newGrid.inputs[col];
            f(cell);
        });
        activeOutputCells.forEach(({row, col}) => {
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
        outer:
            for (const row of grid.outputs) {
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

    function applyRules() {
        //todo : ajouter 1 seul "output" par règle ?
        const newGrille = grid.clone();
        const conffromgrid = newGrille.getConfigurationFromGrid();
        const conf = automaton.makeDiagram(conffromgrid, grid.outputs.length);
        newGrille.setGridFromConfigurations(conf);
        setGrid(newGrille);
    }

    function getRuleGrid(rule: Rule): RuleGrid {
        const ruleGrid: RuleGrid = RuleGrid.withSize(
            grid.inputs.length,
            grid.outputs.length
        );
        for (const literal of rule.condition.getLiterals()) {
            for (let cellidx = 0; cellidx < grid.inputs.length; cellidx++) {
                if (literal.position === cellidx - 2) {
                    //PAS BIEN : on prend pas en compte si une grid plus grande
                    if (literal.sign) {
                        ruleGrid.inputs[cellidx].signals.add(literal.signal);
                    }
                    else {
                        ruleGrid.inputs[cellidx].negatedSignals.add(literal.signal);
                    }
                }
            }
        }
        for (const ruleOut of rule.outputs) {
            for (let cellidx = 0; cellidx < grid.inputs.length; cellidx++) {
                if (ruleOut.neighbor === cellidx - 2) {
                    //PAS BIEN : on prend pas en compte si une grid plus grande
                    ruleGrid.outputs[ruleOut.futureStep-1][cellidx].signals.add(ruleOut.signal);
                }
            }
        }
        return ruleGrid;
    }

    function modifyRule() {
        const ruleFromGrid =RuleGrid.makeRule(grid.clone()) ;
        const newRules : Rule[] = [];
        let setOutput: Set<RuleOutput> = new Set();
        for (const regle of automaton.getRules()){
            const ruleAndOutput = adaptRule(regle as ConjunctionRule , ruleFromGrid);
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
        setRulesGrid(newRules.map(getRuleGrid));
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
        <div style={{display: "flex"}}>
            <div>
                <div className="grid-container">
                    <InputsRow
                        inputs={grid.inputs}
                        activeInputCells={activeInputCells}
                        setActiveInputCells={setActiveInputCells}
                        setActiveOutputCells={setActiveOutputCells}
                    />
                    {grid.outputs.map((row, rowIndex) => (
                        <GridOutputsRow
                            outputs={row}
                            rowIndex={rowIndex}
                            activeOutputCells={activeOutputCells}
                            setActiveInputCells={setActiveInputCells}
                            setActiveOutputCells={setActiveOutputCells}
                        />
                    ))}
                </div>
                <div>
                    <button onClick={removeAllSignals}>
                        Supprimer tous les signaux de la grille
                    </button>
                </div>
                <GridSignalsManager
                    activeSignals={activeSignals}
                    negatedSignals={negatedSignals}
                    allSignals={listeSignaux}
                    applyToActiveCells={applyToActiveCells}
                />
                <button onClick={saveGridAsRule}>Ajouter règle</button>
                <button onClick={applyRules}>
                    Appliquer règles sur la grille
                </button>
                <button onClick={() => {
                    modifyRule();
                    removeAllSignals()
                }}>Adapter règles</button>
            </div>
        </div>
    );
}
