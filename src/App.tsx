import { useState } from "react";
import { Automaton } from "./classes/Automaton.ts";
import { Configuration } from "./classes/Configuration.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import { Button } from "./components/Button.tsx";
import { Diagram } from "./components/Diagram.tsx";
import EditGrid from "./components/EditGrid.tsx";
import { Heading } from "./components/Heading.tsx";
import { RuleImportArea } from "./components/RuleInputArea.tsx";
import SignalsList from "./components/SignalsList.tsx";
import "./style/style.scss";
import { SettingsInterface, Signal } from "./types.ts";
export default function App() {
    const [settings] = useState<SettingsInterface>({
        gridRadius: 2,
        gridNbFutureSteps: 3,
        nbCells: 40,
        nbSteps: 60,
        timeGoesUp: true,
    });

    const [grid, setGrid] = useState<RuleGrid>(
        RuleGrid.withSize(
            2 * settings.gridRadius + 1,
            settings.gridNbFutureSteps
        )
    );

    const [hiddenSignalsSet, setHiddenSignalsSet] = useState<Set<Signal>>(
        new Set()
    );

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

    function setAutomaton(automaton: Automaton) {
        if (indexAutomaton < historyAutomaton.length - 1) {
            setHistoryAutomaton([
                ...historyAutomaton.slice(0, indexAutomaton + 1),
                automaton,
            ]);
        } else {
            setHistoryAutomaton([...historyAutomaton, automaton]);
        }
        setIndexAutomaton(indexAutomaton + 1);
    }

    function setSignalsList(_signalsList: Signal[]) {
        // TODO: Implement
    }

    function setRulesGrids(rulesGrids: RuleGrid[]) {
        const rules = rulesGrids.map((ruleGrid) => RuleGrid.makeRule(ruleGrid));
        const auto = new Automaton(rules);
        setAutomaton(auto);
    }

    const automaton = historyAutomaton[indexAutomaton];

    // Set initial configuration
    const initialConfiguration = Configuration.withSize(settings.nbCells);
    initialConfiguration.cells[0].addSignal(Symbol.for("Init"));

    const rulesGrid = RuleGrid.makeGridsFromTabRules(
        automaton.getRules(),
        settings.gridRadius,
        settings.gridNbFutureSteps
    );

    const signalsList = automaton.getSignalsList();

    return (
        <div className="flex flex-col p-2 bg-gradient-to-b from-slate-50 to-slate-100 text-gray-700">
            <Heading level={1}>
                Outil de création d'automates cellulaires
            </Heading>
            <div className="flex justify-between">
                <div className="flex">
                    <EditGrid
                        grid={grid}
                        setGrid={setGrid}
                        radius={settings.gridRadius}
                        nbFutureSteps={settings.gridNbFutureSteps}
                        rulesGrid={rulesGrid}
                        setRulesGrid={setRulesGrids}
                        automaton={automaton}
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
                    <RuleImportArea
                        automaton={historyAutomaton[indexAutomaton]}
                        setAutomaton={setAutomaton}
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
