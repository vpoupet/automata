import { Automaton } from "../classes/Automaton.ts";
import { Cell } from "../classes/Cell.ts";
import {Conjunction, Negation, simplifyDNF} from "../classes/Clause.ts";
import { Rule } from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import "../style/Cell.css";
import {Coordinates, Signal} from "../types.ts";
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
    setRulesGrid: (rulesGrid: RuleGrid[]) => void;
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
    }

    function applyRules() {
        //todo : ajouter 1 seul "output" par règle ?
        const newGrille = grid.clone();
        const conffromgrid = newGrille.getConfigurationFromGrid();
        automaton.setRules(reglesbools);
        automaton.updateParameters();
        setAutomaton(automaton);
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

    function addNegationToActiveRules(
        newRuleBool: Rule,
        activeRulesBool: Set<Rule>
    ): RuleGrid[] {
        const newRulesGrid: RuleGrid[] = [];
        for (const rule of activeRulesBool) {
            let newClause = new Conjunction([
                rule.condition,
                new Negation(newRuleBool.condition),
            ]).toDNF();
            newClause = simplifyDNF(newClause)
            for (let j = 0; j < newClause.subclauses.length; j++) {
                newRulesGrid.push(
                    getRuleGrid(
                        new Rule(newClause.subclauses[j],rule.outputs)
                    )
                );
            }
        }
        console.log(
            "la liste des nouvelles règles à rajouter ! : ",
            newRulesGrid
        );
        newRulesGrid.push(getRuleGrid(newRuleBool));
        return newRulesGrid;
    }

    function addAdaptedRules(activeRulesBool: Set<Rule>) {
        console.log('alèdes')
        const oldOutput = getOutputFromRules(activeRulesBool);
        if (oldOutput.equalsOutputs(grid.outputs)) {
            console.log("les outputs sont les mêmes, on ne fait rien");
            return;
        }

        const newRuleBool = RuleGrid.makeRule(grid);

        //pour chaque règle active, on vérifie les outputs
        for (const rule of activeRulesBool) {
            for (let i=0; i<rule.outputs.length;i++) {
                const tabIndex : number[]=[];
                newRuleBool.outputs.some((output, index) => {
                    //si au moins 1 output est contenu dans la règle active, on le supprime de la nouvelle règle !
                  if (output.signal===rule.outputs[i].signal && output.neighbor===rule.outputs[i].neighbor && output.futureStep===rule.outputs[i].futureStep){
                      tabIndex.push(index);
                      return true;
                  }
                    return false;
                })
                //si le nombre d'output à supprimer est égal au nombre d'output de la règle
                //on la tej des règles actives en plus
                for (const index of tabIndex) {
                    newRuleBool.outputs.splice(index, 1);
                    console.log("on supprime l'output : ", rule.outputs[i]);
                }
                if (rule.outputs.length === tabIndex.length) {
                    console.log("on supprime la règle : ", rule);
                    activeRulesBool.delete(rule);
                }
            }
        }

        //on ajoute la négation de l'input de la nouvelle règle à chaque règle active

        const rulesModified = addNegationToActiveRules(newRuleBool, activeRulesBool);

        for (const rule of rulesModified) {
            //si la grille des outputs est vide on l'enlève
            if (rule.outputs.every((row) => row.every((cell) => cell.signals.size === 0))) {
                const index = rulesModified.indexOf(rule);
                if (index !== -1) {
                    rulesModified.splice(index, 1);
                }
            }
        }

        //On enlève du tableau de règles celles qui doivent changer
        //on enlève dans reglesbools les règles contenus dans le tableau activeRulesBool
        for (const rule of activeRulesBool) {
            const index = reglesbools.indexOf(rule);
            if (index !== -1) {
                reglesbools.splice(index, 1);
            }
        }
        const rules = [...reglesbools.map((rule) => getRuleGrid(rule))];
        rules.push(...rulesModified);
        setRulesGrid(rules);
    }

    function getOutputFromRules(activeRulesBool: Set<Rule>): RuleGrid {
        const newGrille = RuleGrid.withSize(2 * radius, nbFutureSteps);
        const conffromgrid = newGrille.getConfigurationFromGrid();
        for (const rule of activeRulesBool) {
            automaton.setRules([rule]);
            automaton.updateParameters();
            setAutomaton(automaton);
            const conf = automaton.makeDiagram(conffromgrid, grid.outputs.length);
            newGrille.setGridFromConfigurations(conf);
        }
        return newGrille;
    }

    function modifyRule() {
        const rulesToModify = new Set<Rule>();
        const config = grid.getConfigurationFromGrid();

        for (let ruleNbr = 0; ruleNbr < reglesbools.length; ruleNbr++) {
            for (let i = 0; i < grid.inputs.length; i++) {
                if (
                    reglesbools[ruleNbr].condition.eval(
                        //PAS BIEN : on prend pas en compte si une grid plus grande
                        config.getNeighborhood(i, -2, 2)
                    )
                ) {
                    rulesToModify.add(reglesbools[ruleNbr]);
                    console.log('on ajoute la règle num : ', ruleNbr, "de valeur : ", reglesbools[ruleNbr]);
                }
            }
        }

        if (rulesToModify.size === 0) {
            console.log(
                "pas de règle à modifier, on ajoute une nouvelle règle"
            );
            saveGridAsRule();
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
        <div style={{display: "flex"}}>
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
                <button onClick={saveGridAsRule}>Ajouter règle</button>
                <button onClick={applyRules}>
                    Appliquer règles sur la grille
                </button>
                <button onClick={modifyRule}>Adapter règles</button>
            </div>
        </div>
    );
}
