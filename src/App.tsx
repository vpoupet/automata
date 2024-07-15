import { useCallback, useEffect, useState } from "react";
import "./App.css";
import {
    Automaton,
    ConjunctionRule,
    Rule,
    RuleOutput,
} from "./classes/Automaton.ts";
import { Cell, InputCell } from "./classes/Cell.ts";
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
    const [automaton, setAutomaton] = useState<Automaton>(new Automaton());
    const [rulesGrids, setRulesGrids] = useState<RuleGrid[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);

    const [settings] = useState<SettingsInterface>({
        gridRadius: 2,
        gridNbFutureSteps: 2,
        nbCells: 40,
        nbSteps: 60,
        timeGoesUp: true,
    });

    const [grid, setGrid] = useState<RuleGrid>(
        RuleGrid.withSize(2 * settings.gridRadius + 1, settings.gridNbFutureSteps)
    );
    const [activeInputCells, setActiveInputCells] = useState<number[]>([]);
    const [activeOutputCells, setActiveOutputCells] = useState<Coordinates[]>(
        []
    );

    const [signalsList, setSignalsList] = useState([
        Symbol.for("Init"),
        Symbol.for("s1"),
        Symbol.for("s2"),
    ]);

    function makeRuleOutputs(gridOutputs: Cell[][]) {
        const outputs: RuleOutput[] = [];

        gridOutputs.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                cellule.signals.forEach((signal) => {
                    const ruleOutput = new RuleOutput(
                        colIndex - settings.gridRadius,
                        signal,
                        rowIndex + 1
                    );
                    outputs.push(ruleOutput);
                });
            });
        });

        return outputs;
    }

    function makeRuleCondition(gridInputs: InputCell[]): ConjunctionOfLiterals {
        const literals: Literal[] = [];
        gridInputs.forEach((cellule, cellIndex) => {
            cellule.signals.forEach((signal) => {
                const literal = new Literal(signal, cellIndex - settings.gridRadius, true);
                literals.push(literal);
            });
            cellule.negatedSignals.forEach((signal) => {
                const literal = new Literal(signal, cellIndex - settings.gridRadius, false);
                literals.push(literal);
            });
        });
        return new Conjunction(literals) as ConjunctionOfLiterals;
    }

    function makeRule(ruleGrid: RuleGrid): ConjunctionRule {
        const outputs = makeRuleOutputs(ruleGrid.outputs);
        const condition = makeRuleCondition(ruleGrid.inputs);
        return new Rule(condition, outputs) as ConjunctionRule;
    }

    const applyRules = useCallback(() => {
        const auto = new Automaton();
        auto.setRules(rules);
        auto.updateParameters();
        setAutomaton(auto);
    }, [rules, setAutomaton]);

    // NOTE: attention aux useEffect
    useEffect(() => {
        setRules(rulesGrids.map(makeRule));
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
                        nbFutureSteps={settings.gridNbFutureSteps}
                        radius={settings.gridRadius}
                        activeInputCells={activeInputCells}
                        setActiveInputCells={setActiveInputCells}
                        activeOutputCells={activeOutputCells}
                        setActiveOutputCells={setActiveOutputCells}
                        rulesGrid={rulesGrids}
                        setRulesGrid={setRulesGrids}
                        listeSignaux={signalsList}
                        automaton={automaton}
                        setAutomaton={setAutomaton}
                        rules={rules}
                        makeRule={makeRule}
                    />
                </div>
                <div className="gestion-signaux">
                    <SignalsList
                        listeSignaux={signalsList}
                        setListeSignaux={setSignalsList}
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
                    gridRadius={settings.gridRadius}
                    gridNbFutureSteps={settings.gridNbFutureSteps}
                    setGrid={setGrid}
                />
            </div>
        </div>
    );
}
