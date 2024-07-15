import { useCallback, useEffect, useState } from "react";
import "./App.css";
import {
    Automaton, ConjunctionRule,
    Rule, RuleOutput,
} from "./classes/Automaton.ts";
import { Configuration } from "./classes/Configuration.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import { Diagram } from "./components/Diagram.tsx";
import SignalsList from "./components/SignalsList.tsx";
import EditGrid from "./components/EditGrid.tsx";
import RuleGridsList from "./components/ListeRegles.js";
import { Coordinates, SettingsInterface } from "./types.ts";
import {Cell, InputCell} from "./classes/Cell.ts";
import {Conjunction, ConjunctionOfLiterals, Literal} from "./classes/Clause.ts";
import {rules} from "@typescript-eslint/eslint-plugin";

export default function App() {
    const [gridNbFutureSteps] = useState<number>(2);
    const [gridRadius] = useState<number>(2);
    // const [rulesGrids, setRulesGrids] = useState<RuleGrid[]>([]);

    // const [rules, setRules] = useState<Rule[]>([]);

    const [automaton, setAutomaton] = useState<Automaton>(new Automaton());
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

    const setRulesGrids = (rulesGrids: RuleGrid[]) => {
        const rules = rulesGrids.map((ruleGrid) => RuleGrid.makeRule(ruleGrid));
        const auto = new Automaton();
        auto.setRules(rules);
        auto.updateParameters();
        setAutomaton(auto);
    }


    const initialConfiguration = Configuration.withSize(settings.nbCells);
    initialConfiguration.cells[0].addSignal(Symbol.for("Init"));

    const rulesGrid = RuleGrid.makeGridsFromTabRules(automaton.getRules(), gridRadius, gridNbFutureSteps);

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
                        rulesGrid={rulesGrid}
                        setRulesGrid={setRulesGrids}
                        listeSignaux={signalsList}
                        automaton={automaton}
                        setAutomaton={setAutomaton}
                        rules={automaton.getRules()}
                    />
                </div>
                <div className="gestion-signaux">
                    <SignalsList
                        listeSignaux={signalsList}
                        setListeSignaux={setSignalsList}
                        grid={grid}
                        setGrid={setGrid}
                        rulesGrids={rulesGrid}
                        setRulesGrids={setRulesGrids}
                    />
                </div>
            </div>
            <div className="middle-section">
                <div className="liste-regles">
                    <RuleGridsList
                        grid={grid}
                        setGrid={setGrid}
                        rulesGrids={rulesGrid}
                        setRulesGrids={setRulesGrids}
                        rules={automaton.getRules()}
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
