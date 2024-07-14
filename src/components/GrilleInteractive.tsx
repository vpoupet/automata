import { Coordinates, Signal } from "../types.ts";
import "../style/Cell.css";
import GestionnaireSignauxGrille from "./GestionnaireSignauxGrille.tsx";
import RuleGrid from "../classes/RuleGrid.ts";
import RowOutputs from "./RowOutputs.tsx";
import RowInputs from "./RowInputs.tsx";
import { Cell, InputCell } from "../classes/Cell.ts";
import { Automaton, Rule, RuleOutput } from "../classes/Automaton.ts";
import { Conjunction, ConjunctionOfLiterals, Literal, Negation } from "../classes/Clause.ts";

type GrilleInteractiveProps = {
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    rows: number;
    cols: number;
    activeCells: { row: number; col: number; isInput: boolean }[];
    setActiveCells: React.Dispatch<React.SetStateAction<Coordinates[]>>;
    rulesGrid: RuleGrid[];
    setrulesGrid: React.Dispatch<React.SetStateAction<RuleGrid[]>>;
    automaton: Automaton;
    setAutomaton: React.Dispatch<React.SetStateAction<Automaton>>;
    rules: Rule[];
    listeSignaux: Signal[];
};

const GrilleInteractive = ({
    grid,
    setGrid,
    rows,
    cols,
    activeCells,
    setActiveCells,
    rulesGrid,
    setrulesGrid,
    automaton,
    setAutomaton,
    rules: reglesbools,
    listeSignaux,
}: GrilleInteractiveProps): JSX.Element => {

    function updateGrille(callback: (cellule: Cell) => void) {
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
    }
    
    function handleAddSignal(signal: Signal) {
        updateGrille((caseObj: Cell) => caseObj.addSignal(signal));
    }

    function handleRemoveSignal(signal: Signal) {
        updateGrille((caseObj: Cell) => caseObj.removeSignal(signal));
    }

    function handleAddNegatedSignal(signal: Signal) {
        updateGrille((caseObj: Cell) => caseObj.addNegatedSignal(signal));
        console.log("updaaaaaate");
    }

    function handleRemoveNegatedSignal(signal: Signal) {
        updateGrille((caseObj: Cell) => caseObj.removeNegatedSignal(signal));
    }
    
    function handleAddAllSignals() {
        updateGrille((caseObj: Cell) => {
            listeSignaux.forEach((signal) => caseObj.addSignal(signal));
        });
    }

    function handleRemoveAllSignals() {
        updateGrille((caseObj: Cell) => {
            caseObj.removeAllSignals();
        });
    }

    function handleRemoveAllSignalsFromGrid() {
        const newGrid = new RuleGrid(rows, cols);
        setGrid(newGrid);
    }

    function handleCaseClick(
        rowIndex: number,
        colIndex: number,
        isInput: boolean,
        event: React.MouseEvent
    ) {
        if (event.ctrlKey || event.metaKey) {
            setActiveCells((prev) => {
                const alreadySelected = prev.some(
                    (cell) =>
                        cell.row === rowIndex &&
                        cell.col === colIndex &&
                        cell.isInput === isInput
                );
                if (alreadySelected) {
                    return prev.filter(
                        (cell) =>
                            !(
                                cell.row === rowIndex &&
                                cell.col === colIndex &&
                                cell.isInput === isInput
                            )
                    );
                } else {
                    return [
                        ...prev,
                        { row: rowIndex, col: colIndex, isInput: isInput },
                    ];
                }
            });
        } else {
            setActiveCells([
                { row: rowIndex, col: colIndex, isInput: isInput },
            ]);
        }
    }

    function handleSaveRule() {
        if (rulesGrid.length === 0) {
            setrulesGrid([grid.clone()]);
        }
        setrulesGrid([...rulesGrid, grid.clone()]);
    }

    function applyRules() {
        const newGrille = new RuleGrid(rows, cols);
        const conffromgrid = newGrille.getConfigurationFromGrid();
        automaton.setRules(reglesbools);
        automaton.updateParameters();
        setAutomaton(automaton);
        const conf = automaton.makeDiagram(conffromgrid, grid.outputs.length);
        newGrille.setGridFromConfigurations(conf);
    }

    function creerOutput(tab: Cell[][]) {
        const outputs: RuleOutput[] = [];

        tab.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                if (cellule.signals.size > 0) {
                    cellule.signals.forEach((signal) => {
                        const ruleOutput = new RuleOutput(
                            colIndex - Math.floor(tab[0].length / 2),
                            signal,
                            rowIndex + 1
                        );
                        outputs.push(ruleOutput);
                    });
                }
            });
        });

        return outputs;
    }

    function creerClause(tab: Cell[]): ConjunctionOfLiterals {
        // TODO: reprendre après signaux négatifs dans Cellule

        const literals: Literal[] = [];
        tab.forEach((cellule, cellIndex) => {
            if (cellule.signals.size > 0) {
                cellule.signals.forEach((signal) => {
                    const literal = new Literal(signal, cellIndex - 2);
                    literals.push(literal);
                });
            }
        });
        return new Conjunction(literals) as ConjunctionOfLiterals;
    }
    
    function creerReglebool(rule: RuleGrid): Rule {
        // TODO: faire la vérification que la règle n'est pas vide ailleurs (avant ou après l'appel à cette fonction)
        const outputs = creerOutput(rule.outputs);
        const clause = creerClause(rule.inputs);
        return new Rule(clause, outputs);
    }

    function getRuleGridFromBool(regleBool: Rule): RuleGrid {
        const ruleGrid: RuleGrid = new RuleGrid(
            grid.outputs.length,
            grid.inputs.length
        );
        for (const literal of regleBool.condition.getLiterals()) {
            for (let cellidx = 0; cellidx < grid.inputs.length; cellidx++) {
                if (literal.position === cellidx - 2) {
                    //TODO : la négation !
                    ruleGrid.inputs[cellidx].signals.add(literal.signal);
                }
            }
        }
        for (const ruleOut of regleBool.outputs) {
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
                    getRuleGridFromBool(
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
        const newRuleBool = creerReglebool(grid);
        //on ajoute la négation de l'input de la nouvelle règle à chaque règle active
        const rulesModified = modifRulesWithNegation(
            newRuleBool,
            activeRulesOnly
        );

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
            handleSaveRule();
        } else {
            console.log("ajout de règles and stuff", rulesToModify);
            addAdaptedRules(rulesToModify);
        }
    }

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
