import { Automaton, Rule } from "../classes/Automaton.ts";
import { Cell } from "../classes/Cell.ts";
import { Conjunction, Negation } from "../classes/Clause.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import "../style/Cell.css";
import { Coordinates, Signal } from "../types.ts";
import InputsRow from "./GridInputsRow.tsx";
import GridOutputsRow from "./GridOutputsRow.tsx";
import GridSignalsManager from "./GridSignalsManager.tsx";

type EditGridProps = {
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    nbFutureSteps: number;
    radius: number;
    activeInputCells: number[];
    setActiveInputCells: React.Dispatch<React.SetStateAction<number[]>>;
    activeOutputCells: Coordinates[];
    setActiveOutputCells: React.Dispatch<React.SetStateAction<Coordinates[]>>;
    rulesGrid: RuleGrid[];
    setRulesGrid: React.Dispatch<React.SetStateAction<RuleGrid[]>>;
    automaton: Automaton;
    setAutomaton: React.Dispatch<React.SetStateAction<Automaton>>;
    rules: Rule[];
    listeSignaux: Signal[];
};

export default function EditGrid({
    grid,
    setGrid,
    radius,
    nbFutureSteps,
    activeInputCells,
    setActiveInputCells,
    activeOutputCells,
    setActiveOutputCells,
    rulesGrid,
    setRulesGrid,
    automaton,
    setAutomaton,
    rules: reglesbools,
    listeSignaux,
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

    function saveRule() {
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
    }

    function applyRules() {
        const newGrille = RuleGrid.withSize(2 * radius, nbFutureSteps);
        const conffromgrid = newGrille.getConfigurationFromGrid();
        automaton.setRules(reglesbools);
        automaton.updateParameters();
        setAutomaton(automaton);
        const conf = automaton.makeDiagram(conffromgrid, grid.outputs.length);
        newGrille.setGridFromConfigurations(conf);
    }

    function getRuleGrid(rule: Rule): RuleGrid {
        const ruleGrid: RuleGrid = RuleGrid.withSize(
            grid.inputs.length,
            grid.outputs.length
        );
        for (const literal of rule.condition.getLiterals()) {
            for (let cellidx = 0; cellidx < grid.inputs.length; cellidx++) {
                if (literal.position === cellidx - 2) {
                    //TODO : la négation !
                    ruleGrid.inputs[cellidx].signals.add(literal.signal);
                }
            }
        }
        for (const ruleOut of rule.outputs) {
            for (let cellidx = 0; cellidx < grid.inputs.length; cellidx++) {
                if (ruleOut.neighbor === cellidx - 2) {
                    //PAS BIEN : on prend pas en compte si une grid plus grande
                    ruleGrid.outputs[0][cellidx].signals.add(ruleOut.signal);
                }
            }
        }
        return ruleGrid;
    }

    function modifRulesWithNegation(
        newRuleBool: Rule,
        activeRulesOnly: Set<Rule>
    ): RuleGrid[] {
        const newRulesReadyToUse: RuleGrid[] = [];
        for (const rule of activeRulesOnly) {
            const newRule = new Conjunction([
                rule.condition,
                new Negation(newRuleBool.condition),
            ]).toDNF();
            for (let j = 0; j < newRule.subclauses.length; j++) {
                newRulesReadyToUse.push(
                    getRuleGrid(
                        new Rule(newRule.subclauses[j], newRuleBool.outputs)
                    )
                );
            }
        }
        console.log(
            "la liste des nouvelles règles à rajouter ! : ",
            newRulesReadyToUse
        );
        return newRulesReadyToUse;
    }

    function addAdaptedRules(setListRules: Set<number>) {
        const activeRulesOnly: Set<Rule> = new Set();
        for (const rulenbr of setListRules) {
            activeRulesOnly.add(reglesbools[rulenbr]);
        }

        // const configOutput = getOutputFromRules(activeRulesOnly);
        //si l'output généré est le même que celui de la grid, on fait rien on return c'est gg
        //pour l'instant pas géré
        // let outputdifferent = false;
        // if (outputdifferent) {
        //     console.log("les outputs sont les mêmes, on ne fait rien");
        //     return;
        // }
        // bon la on est au moment critique, faut rajouter une nouvelle règle et
        // ajouter la négation de l'input de la grid pour chaque règle active (DNF)
        const newRule = grid.clone();

        //on créé la regle bool de la nouvelle regle

        //on ajoute la négation de l'input de la nouvelle règle à chaque règle active

        const rules = [...rulesGrid];

        // WARNING: C'est n'importe quoi à partir de là jusqu'à la fin de la fonction
        //si le n° d'indice de la règle est dans activeRulesOnly alors on le supprime
        // rules.filter(rule => !activeRulesOnly.has(rule));
        // rules.filter((_, i) => !activeRulesOnly.includes(i));
        // for (const rule of rulesModified) {
        //     rules.push(rule);   // <- corrigé ici mais pas sûr que ce soit correct
        // }
        // //on ajoute la nouvelle règle
        // rules.push(newRule.grid);
        // -(
        //     //PAS BIEN ???
        //     setrulesGrid(rules)
        // );
        // console.log("dans l'idée on a fais les modifs qui faut :", reglesbools);
    }

    function modifyRule() {
        const rulesToModify = new Set<number>();
        const config = grid.getConfigurationFromGrid();

        for (let ruleNbr = 0; ruleNbr < rulesGrid.length; ruleNbr++) {
            for (let i = 0; i < grid.inputs.length; i++) {
                // WARNING: le rayon est fixé à 2!
                if (
                    reglesbools[ruleNbr].condition.eval(
                        config.getNeighborhood(i, -2, 2)
                    )
                ) {
                    rulesToModify.add(ruleNbr);
                }
            }
        }

        if (rulesToModify.size === 0) {
            console.log(
                "pas de règle à modifier, on ajoute une nouvelle règle"
            );
            saveRule();
        } else {
            console.log("ajout de règles and stuff", rulesToModify);
            addAdaptedRules(rulesToModify);
        }
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
        <div style={{ display: "flex" }}>
            <div>
                <h1>Grille Interactive</h1>
                <div className="grid-container">
                    <InputsRow
                        inputs={grid.inputs}
                        activeInputCells={activeInputCells}
                        setActiveInputCells={setActiveInputCells}
                        setActiveOutputCells={setActiveOutputCells}
                    />
                    {grid.outputs.map((row, rowIndex) => (
                        <GridOutputsRow
                            key={rowIndex}
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
                <button onClick={saveRule}>Ajouter règle</button>
                <button onClick={applyRules}>
                    Appliquer règles sur la grille
                </button>
                <button onClick={modifyRule}>Adapter règles</button>
            </div>
        </div>
    );
}
