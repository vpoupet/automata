import { useState } from "react";
import { Automaton } from "./classes/Automaton.ts";
import { Configuration } from "./classes/Configuration.ts";
import { Rule } from "./classes/Rule.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import { Diagram } from "./components/Diagram.tsx";
import EditGrid from "./components/EditGrid.tsx";
import RuleGridsList from "./components/RuleGridsList.js";
import SignalsList from "./components/SignalsList.tsx";
import "./style/style.scss";
import { SettingsInterface, Signal } from "./types.ts";
import { Button } from "./components/Button.tsx";
import { Heading } from "./components/Heading.tsx";
export default function App() {
    const [settings] = useState<SettingsInterface>({
        gridRadius: 2,
        gridNbFutureSteps: 3,
        nbCells: 100,
        nbSteps: 110,
        timeGoesUp: true,
    });

    const [grid, setGrid] = useState<RuleGrid>(
        RuleGrid.withSize(
            2 * settings.gridRadius + 1,
            settings.gridNbFutureSteps
        )
    );

    const [signalsList, setSignalsList] = useState<Signal[]>([
        Symbol.for("Init"),
    ]);

    const [hiddenSignalsSet, setHiddenSignalsSet] = useState<Set<Signal>>(new Set());

    const [historyAutomaton, setHistoryAutomaton] = useState<Automaton[]>([
        new Automaton(),
    ]);
    const [indexAutomaton, setIndexAutomaton] = useState(0);

    const changeIndexAutomaton = (addToindex: number) => {
        if (
            indexAutomaton + addToindex < 0 ||
            indexAutomaton + addToindex >= historyAutomaton.length
        ) {
            return;
        }
        setIndexAutomaton(indexAutomaton + addToindex);
    };

    function setAutomaton(auto: Automaton) {
        if (indexAutomaton < historyAutomaton.length - 1) {
            setHistoryAutomaton([
                ...historyAutomaton.slice(0, indexAutomaton + 1),
                auto,
            ]);
        } else {
            setHistoryAutomaton([...historyAutomaton, auto]);
        }
        setIndexAutomaton(indexAutomaton + 1);
    }

    const setRulesGrids = (rulesGrids: RuleGrid[]) => {
        const rules = rulesGrids.map((ruleGrid) => RuleGrid.makeRule(ruleGrid));
        const auto = new Automaton(rules);
        setAutomaton(auto);
    };

    const addRules = (rules: Rule[]) => {
        const auto = new Automaton(
            historyAutomaton[indexAutomaton].getRules().concat(rules)
        );
        setAutomaton(auto);
    };

    function clearRules() {
        const auto = new Automaton();
        setAutomaton(auto);
    }

    // Set initial configuration
    const initialConfiguration = Configuration.withSize(settings.nbCells);
    initialConfiguration.cells[0].addSignal(Symbol.for("Gen_g"));
    initialConfiguration.cells[0].addSignal(Symbol.for("Diag_g"));
    initialConfiguration.cells[98].addSignal(Symbol.for("Gen_d"));
    initialConfiguration.cells[98].addSignal(Symbol.for("Diag_d"));


    const rulesGrid = RuleGrid.makeGridsFromTabRules(
        historyAutomaton[indexAutomaton].getRules(),
        settings.gridRadius,
        settings.gridNbFutureSteps
    );

    return (
        <div className="flex flex-col p-2 bg-gradient-to-b from-slate-50 to-slate-100 text-gray-700">
            <Heading level={1}>Outil de création d'automates cellulaires</Heading>
            <div className="flex justify-between">
                <div className="flex">
                    <EditGrid
                        grid={grid}
                        setGrid={setGrid}
                        nbFutureSteps={settings.gridNbFutureSteps}
                        radius={settings.gridRadius}
                        rulesGrid={rulesGrid}
                        setRulesGrid={setRulesGrids}
                        signalsList={signalsList}
                        automaton={historyAutomaton[indexAutomaton]}
                    />
                    <div>
                        <Button
                            onClick={() => changeIndexAutomaton(-1)}
                            disabled={indexAutomaton === 0}
                        >
                            Précédent
                        </Button>
                        <Button
                            onClick={() => changeIndexAutomaton(1)}
                            disabled={
                                indexAutomaton >= historyAutomaton.length - 1
                            }
                        >
                            <span>Suivant</span>
                        </Button>
                    </div>
                </div>
                <div className="flex">
                    <SignalsList
                        signalsList={signalsList}
                        setSignalsList={setSignalsList}
                        hiddenSignalsSet={hiddenSignalsSet}
                        setHiddenSignalsSet={setHiddenSignalsSet}
                        grid={grid}
                        setGrid={setGrid}
                        rulesGrids={rulesGrid}
                        setRulesGrids={setRulesGrids}
                    />
                </div>
            </div>
            <div className="flex justify-between">
                <div className="flex">
                    <RuleGridsList
                        grid={grid}
                        setGrid={setGrid}
                        rulesGrids={rulesGrid}
                        setRulesGrids={setRulesGrids}
                        rules={historyAutomaton[indexAutomaton].getRules()}
                        clearRules={clearRules}
                        addRules={addRules}
                        signalsList={signalsList}
                        setSignalsList={setSignalsList}
                    />
                </div>
            </div>
            <div className="self-center">
                <Diagram
                    automaton={historyAutomaton[indexAutomaton]}
                    initialConfiguration={initialConfiguration}
                    nbSteps={settings.nbSteps}
                    gridRadius={settings.gridRadius}
                    gridNbFutureSteps={settings.gridNbFutureSteps}
                    setGrid={setGrid}
                    signalsList={signalsList}
                    hiddenSignalsSet={hiddenSignalsSet}
                />
            </div>
        </div>
    );
}
