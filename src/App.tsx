import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Automaton, Rule, RuleOutput } from "./classes/Automaton.ts";
import { Cell, InputCell } from "./classes/Cell.ts";
import {
    Conjunction,
    ConjunctionOfLiterals,
    Literal,
    Negation,
} from "./classes/Clause.ts";
import { Configuration } from "./classes/Configuration.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import { Diagram } from "./components/Diagram.tsx";
import GestionSignaux from "./components/GestionSignaux.js";
import GrilleInteractive from "./components/GrilleInteractive.tsx";
import ListeRegles from "./components/ListeRegles.js";
import { Coordinates, SettingsInterface, Signal } from "./types.ts";

function App() {
    const [rows] = useState<number>(2);
    const [cols] = useState<number>(5);
    const [rulesGrid, setrulesGrid] = useState<RuleGrid[]>([]);
    const [reglesbools, setReglesbools] = useState<Rule[]>([]);

    const [automaton, setAutomaton] = useState<Automaton>(new Automaton());
    const [settings] = useState<SettingsInterface>({
        nbCells: 40,
        nbSteps: 60,
        timeGoesUp: true,
    });

    const [grid, setGrid] = useState<RuleGrid>(new RuleGrid(rows, cols));
    const [activeCells, setActiveCells] = useState<Coordinates[]>([]);

    const [listeSignaux, setListeSignaux] = useState([
        Symbol.for("Init"),
        Symbol.for("2"),
        Symbol.for("3"),
    ]);

    // BEGIN: from ManagerGrilleInteractive
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

    function updateGrilleFromRule(ruleToCopy: RuleGrid) {
        setGrid(ruleToCopy.clone());
    }

    function updateSignalInGrid(oldSignal: Signal, newSignal: Signal) {
        const newGrid = grid.clone();
        for (let rows = 0; rows < grid.outputs.length; rows++) {
            for (let cells = 0; cells < grid.outputs[rows].length; cells++) {
                if (rows === 0) {
                    if (newGrid.inputs[cells].signals.delete(oldSignal)) {
                        newGrid.inputs[cells].addSignal(newSignal);
                    }
                }
                if (newGrid.outputs[rows][cells].signals.delete(oldSignal)) {
                    newGrid.outputs[rows][cells].addSignal(newSignal);
                }
            }
        }
        setGrid(newGrid);
    }

    function deleteSignalInGrid(signal: Signal) {
        const newGrid = grid.clone();
        for (let row = 0; row < grid.outputs.length; row++) {
            for (let cells = 0; cells < grid.outputs[row].length; cells++) {
                if (row === 0) {
                    newGrid.inputs[cells].signals.forEach((s) => {
                        if (s === signal) {
                            newGrid.inputs[cells].removeSignal(signal);
                        }
                    });
                } else {
                    newGrid.outputs[row - 1][cells].signals.forEach((s) => {
                        if (s === signal) {
                            newGrid.outputs[row - 1][cells].removeSignal(
                                signal
                            );
                        }
                    });
                }
            }
        }
        setGrid(newGrid);
    }

    function applyRulesGrid() {
        const newGrille = new RuleGrid(rows, cols);
        const conffromgrid = newGrille.getConfigurationFromGrid();
        automaton.setRules(reglesbools);
        automaton.updateParameters();
        setAutomaton(automaton);
        const conf = automaton.makeDiagram(conffromgrid, grid.outputs.length);
        newGrille.setGridFromConfigurations(conf);
    }

    function handleUpdateFromDiagramme(cells: Cell[]) {
        const newGrid = new RuleGrid(rows, cols);
        const cells1 = cells.slice(0, cols);
        for (let i = 0; i < cells1.length; i++) {
            newGrid.inputs[i] = new InputCell(cells1[i].signals);
        }
        setGrid(newGrid);
    }
    // END: from ManagerGrilleInteractive

    // BEGIN: from ManagerSignaux
    function handleAddNewSignal(signalValue: Signal) {
        if (listeSignaux.includes(signalValue)) {
            alert(`Le signal ${signalValue.description} existe déjà.`);
            return;
        }
        setListeSignaux((prev) => [...prev, signalValue]);
    }

    function updateSignal(
        index: number,
        newValue: Signal
    ): { oldValue: Signal | null; newValue: Signal | null } {
        const oldValue = listeSignaux[index];

        if (
            listeSignaux.some((signal, i) => signal === newValue && i !== index)
        ) {
            alert(`Le signal ${newValue.description} existe déjà.`);
            return { oldValue: null, newValue: null };
        }

        setListeSignaux((prev) =>
            prev.map((signal, i) => (i === index ? newValue : signal))
        );

        return { oldValue, newValue };
    }

    function deleteSignal(index: number): Signal | undefined {
        const signal = listeSignaux[index];
        setListeSignaux((prev) => prev.filter((_, i) => i !== index));
        return signal;
    }
    // END: from ManagerSignaux

    // BEGIN: from ManagerRegles
    function handleSaveRule() {
        if (rulesGrid.length === 0) {
            setrulesGrid([grid.clone()]);
        }
        setrulesGrid([...rulesGrid, grid.clone()]);
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

    function printReglesConsole() {
        let stringRule = "";
        for (let i = 0; i < reglesbools.length; i++) {
            stringRule += reglesbools[i].toString();
            stringRule += "\n";
        }
        console.log(stringRule);
    }

    function updateRule(index: number) {
        const newConfigurations = [...rulesGrid];
        newConfigurations[index] = grid.clone();
        setrulesGrid(newConfigurations);
    }

    function updateSignalInRule(oldValue: Signal, newValue: Signal) {
        // TODO: revenir sur cette fonction après avoir ajouté les signaux négatifs à la Cellule
        const newRules: RuleGrid[] = [];
        for (let i = 0; i < rulesGrid.length; i++) {
            newRules.push(rulesGrid[i].clone());
            for (let rows = 0; rows < grid.outputs.length; rows++) {
                for (let col = 0; col < grid.inputs.length; col++) {
                    if (rows === 0) {
                        if (newRules[i].inputs[col].signals.delete(oldValue)) {
                            newRules[i].inputs[col].signals.add(newValue);
                        }
                    }
                    if (
                        newRules[i].outputs[rows][col].signals.delete(oldValue)
                    ) {
                        newRules[i].outputs[rows][col].signals.add(newValue);
                    }
                }
            }
        }
    }

    function deleteRule(index: number) {
        const newConfigurations = rulesGrid.filter((_, i) => i !== index);
        setrulesGrid(newConfigurations);
    }

    function deleteSignalInRules(signalValue: Signal) {
        const newRulesGrid = [];
        newRulesGrid.push(...rulesGrid);
        // TODO: reprendre la fonction après signaux négatifs dans Cellule
        for (let i = 0; i < rulesGrid.length; i++) {
            for (let j = 0; j < rulesGrid[i].inputs.length; j++) {
                newRulesGrid[i].inputs[j].signals.delete(signalValue);
                for (let k = 0; k < rulesGrid[i].outputs.length; k++) {
                    newRulesGrid[i].outputs[k][j].signals.delete(signalValue);
                }
            }
        }
        setrulesGrid(newRulesGrid);
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

    function addRuleFromString(input = ""): void {
        const auto = new Automaton();
        auto.parseRules(input);
        const rules = auto.getRules();
        for (const regle of rules) {
            const tabNewRule = new RuleGrid(
                grid.outputs.length,
                grid.inputs.length
            );
            for (const literal of regle.condition.getLiterals()) {
                tabNewRule.inputs[
                    literal.position + (grid.inputs.length - 1) / 2
                ].signals.add(literal.signal); // Remplacement de literal.signal par literal.signal.description
            }
            for (const ruleOut of regle.outputs) {
                tabNewRule.outputs[ruleOut.futureStep][
                    ruleOut.neighbor + (grid.inputs.length - 1) / 2
                ].signals.add(ruleOut.signal); // Remplacement de ruleOut.signal par ruleOut.signal.description
            }
            const newRegles = [...rulesGrid, tabNewRule];
            setrulesGrid(newRegles);
        }
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

    const applyRules = useCallback(() => {
        const auto = new Automaton();
        auto.setRules(reglesbools);
        auto.updateParameters();
        setAutomaton(auto);
    }, [reglesbools, setAutomaton]);

    // NOTE: attention aux useEffect
    useEffect(() => {
        setReglesbools(rulesGrid.map(creerReglebool));
    }, [rulesGrid]);

    useEffect(() => {
        applyRules();
    }, [reglesbools, applyRules]);
    // END: from ManagerRegles

    const sendLoadRuleToGrid = (index: number) => {
        const configuration = rulesGrid[index];
        updateGrilleFromRule(configuration);
    };

    const handleUpdateSignal = (index: number, newValue: Signal) => {
        const { oldValue, newValue: updatedValue } = updateSignal(
            index,
            newValue
        );

        if (oldValue && updatedValue) {
            updateSignalInRule(oldValue, updatedValue);
            updateSignalInGrid(oldValue, updatedValue);
        }
    };

    const handleDeleteSignal = (index: number) => {
        const signal = deleteSignal(index);
        if (signal) {
            deleteSignalInRules(signal);
            deleteSignalInGrid(signal);
        }
    };

    const handleCellClick = (cells: Cell[]) => {
        handleUpdateFromDiagramme(cells);
    };

    const initialConfiguration = new Configuration(settings.nbCells);
    initialConfiguration.cells[0].addSignal(Symbol.for("Init"));

    return (
        <div className="App">
            <div className="top-section">
                <div className="grille-interactive">
                    <GrilleInteractive
                        grid={grid}
                        setGrid={setGrid}
                        rows={rows}
                        cols={cols}
                        activeCells={activeCells}
                        listeSignaux={listeSignaux}
                        handleCaseClick={handleCaseClick}
                        handleSaveRule={handleSaveRule}
                        applyRules={applyRulesGrid}
                        modifyRule={modifyRule}
                    />
                </div>
                <div className="gestion-signaux">
                    <GestionSignaux
                        listeSignaux={listeSignaux}
                        onAddSignal={handleAddNewSignal}
                        onUpdateSignal={handleUpdateSignal}
                        onDeleteSignal={handleDeleteSignal}
                    />
                </div>
            </div>
            <div className="middle-section">
                <div className="liste-regles">
                    <ListeRegles
                        rulesGrid={rulesGrid}
                        reglesbools={reglesbools}
                        onLoadRule={sendLoadRuleToGrid}
                        onUpdateRule={updateRule}
                        onDeleteRule={deleteRule}
                        printReglesConsole={printReglesConsole}
                        addRuleFromString={addRuleFromString}
                    />
                </div>
            </div>
            <div className="diagram">
                <Diagram
                    automaton={automaton}
                    initialConfiguration={initialConfiguration}
                    nbSteps={settings.nbSteps}
                    onClickCell={handleCellClick}
                />
            </div>
        </div>
    );
}

export default App;
