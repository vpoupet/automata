import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Automaton, Rule, RuleOutput } from "./classes/Automaton.ts";
import { Cell, InputCell } from "./classes/Cell.ts";
import {
    Conjunction,
    ConjunctionOfLiterals,
    Literal,
} from "./classes/Clause.ts";
import { Configuration } from "./classes/Configuration.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import { Diagram } from "./components/Diagram.tsx";
import GestionSignaux from "./components/GestionSignaux.js";
import GrilleInteractive from "./components/GrilleInteractive.tsx";
import ListeRegles from "./components/ListeRegles.js";
import { Coordinates, SettingsInterface } from "./types.ts";

function App() {
    const [rows] = useState<number>(2);
    const [cols] = useState<number>(5);
    const [rulesGrids, setRulesGrids] = useState<RuleGrid[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);

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

    function handleUpdateFromDiagramme(cells: Cell[]) {
        const newGrid = new RuleGrid(rows, cols);
        const cells1 = cells.slice(0, cols);
        for (let i = 0; i < cells1.length; i++) {
            newGrid.inputs[i] = new InputCell(cells1[i].signals);
        }
        setGrid(newGrid);
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

    const applyRules = useCallback(() => {
        const auto = new Automaton();
        auto.setRules(rules);
        auto.updateParameters();
        setAutomaton(auto);
    }, [rules, setAutomaton]);

    // NOTE: attention aux useEffect
    useEffect(() => {
        setRules(rulesGrids.map(creerReglebool));
    }, [rulesGrids]);

    useEffect(() => {
        applyRules();
    }, [rules, applyRules]);

    function handleCellClick(cells: Cell[]) {
        handleUpdateFromDiagramme(cells);
    }

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
                        setActiveCells={setActiveCells}
                        rulesGrid={rulesGrids}
                        setrulesGrid={setRulesGrids}
                        listeSignaux={listeSignaux}
                        automaton={automaton}
                        setAutomaton={setAutomaton}
                        rules={rules}
                    />
                </div>
                <div className="gestion-signaux">
                    <GestionSignaux
                        listeSignaux={listeSignaux}
                        setListeSignaux={setListeSignaux}
                        grid={grid}
                        setGrid={setGrid}
                        rulesGrids={rulesGrids}
                        setRulesGrids={setRulesGrids}
                    />
                </div>
            </div>
            <div className="middle-section">
                <div className="liste-regles">
                    <ListeRegles
                        grid={grid}
                        setGrid={setGrid}
                        rulesGrids={rulesGrids}
                        setRulesGrids={setRulesGrids}
                        rules={rules}
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
