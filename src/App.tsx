import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Automaton, Rule, RuleOutput } from "./classes/Automaton.ts";
import { Cell } from "./classes/Cell.ts";
import {
    Conjunction,
    ConjunctionOfLiterals,
    Literal,
} from "./classes/Clause.ts";
import { Configuration } from "./classes/Configuration.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import { Diagram } from "./components/Diagram.tsx";
import SignalsList from "./components/SignalsList.tsx";
import EditGrid from "./components/EditGrid.tsx";
import RuleGridsList from "./components/ListeRegles.js";
import { Coordinates, SettingsInterface } from "./types.ts";

export default function App() {
    const [gridNbFutureSteps] = useState<number>(3);
    const [gridRadius] = useState<number>(2);
    const [rulesGrids, setRulesGrids] = useState<RuleGrid[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);

    const [automaton, setAutomaton] = useState<Automaton>(new Automaton());
    const [settings] = useState<SettingsInterface>({
        nbCells: 40,
        nbSteps: 60,
        timeGoesUp: true,
    });

    const [grid, setGrid] = useState<RuleGrid>(
        RuleGrid.withSize(2 * gridRadius + 1, gridNbFutureSteps)
    );
    const [activeInputCells, setActiveInputCells] = useState<number[]>([]);
    const [activeOutputCells, setActiveOutputCells] = useState<Coordinates[]>([]);

    const [listeSignaux, setListeSignaux] = useState([
        Symbol.for("Init"),
        Symbol.for("s1"),
        Symbol.for("s2"),
    ]);

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

    const initialConfiguration = Configuration.withSize(settings.nbCells);
    initialConfiguration.cells[0].addSignal(Symbol.for("Init"));

    return (
        <div className="App">
            <div className="top-section">
                <div className="grille-interactive">
                    <EditGrid
                        grid={grid}
                        setGrid={setGrid}
                        nbFutureSteps={gridNbFutureSteps}
                        nbCells={2 * gridRadius + 1}
                        activeInputCells={activeInputCells}
                        setActiveInputCells={setActiveInputCells}
                        activeOutputCells={activeOutputCells}
                        setActiveOutputCells={setActiveOutputCells}
                        rulesGrid={rulesGrids}
                        setrulesGrid={setRulesGrids}
                        listeSignaux={listeSignaux}
                        automaton={automaton}
                        setAutomaton={setAutomaton}
                        rules={rules}
                    />
                </div>
                <div className="gestion-signaux">
                    <SignalsList
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
                    <RuleGridsList
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
                    gridRadius={gridRadius}
                    gridNbFutureSteps={gridNbFutureSteps}
                    setGrid={setGrid}
                />
            </div>
        </div>
    );
}
