import { useState } from "react";
import "./App.css";
import "./style/style.scss";
import { Automaton } from "./classes/Automaton.ts";
import { Configuration } from "./classes/Configuration.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import { Diagram } from "./components/Diagram.tsx";
import SignalsList from "./components/SignalsList.tsx";
import EditGrid from "./components/EditGrid.tsx";
import RuleGridsList from "./components/ListeRegles.js";
import { Coordinates, SettingsInterface } from "./types.ts";
import { Rule } from "./classes/Rule.ts";
export default function App() {
    const [automaton, setAutomaton] = useState<Automaton>(new Automaton());
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
    const [activeInputCells, setActiveInputCells] = useState<number[]>([]);
    const [activeOutputCells, setActiveOutputCells] = useState<Coordinates[]>(
        []
    );

    const [signalsList, setSignalsList] = useState([
        Symbol.for("Init"),
        Symbol.for("s1"),
        Symbol.for("s2"),
    ]);

    const [historyAutomaton, setHistoryAutomaton] = useState<Automaton[]>([]);
    const [indexAutomaton, setIndexAutomaton] = useState(0);

    const usePreviousAutomaton = () => {
        changeIndexAutomaton(indexAutomaton - 1);
    };

    const useNextAutomaton = () => {
        changeIndexAutomaton(indexAutomaton + 1);
    };

    const changeIndexAutomaton = (index: number) => {
        setIndexAutomaton(index);
        setAutomaton(historyAutomaton[index]);
    }

    const setTheAutomaton = (auto: Automaton) => {
        if (indexAutomaton < historyAutomaton.length - 1) {
            historyAutomaton.splice(indexAutomaton + 1);
        }
        setIndexAutomaton(indexAutomaton + 1);
        setHistoryAutomaton([...historyAutomaton, auto]);
        setAutomaton(auto);
    }

    const setRulesGrids = (rulesGrids: RuleGrid[]) => {
        const rules = rulesGrids.map((ruleGrid) => RuleGrid.makeRule(ruleGrid));
        const auto = new Automaton();
        auto.setRules(rules);
        auto.updateParameters();
        setTheAutomaton(auto);
    };

    const addRules = (rules: Rule[]) => {
        const auto = new Automaton();
        auto.setRules(automaton.getRules().concat(rules));
        auto.updateParameters();
        setTheAutomaton(auto);
    };

    const initialConfiguration = Configuration.withSize(settings.nbCells);
    initialConfiguration.cells[0].addSignal(Symbol.for("Init"));

    const rulesGrid = RuleGrid.makeGridsFromTabRules(
        automaton.getRules(),
        settings.gridRadius,
        settings.gridNbFutureSteps
    );

    return (
        <div className="App">
            <div className="top-section">
                <button onClick={usePreviousAutomaton}  disabled={indexAutomaton === 0} >
                    <span>Previous rules</span>
                </button>
                <button onClick={useNextAutomaton} disabled={indexAutomaton >= historyAutomaton.length-1}>
                    <span>Next rules</span>
                </button>
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
                        setAutomaton={setTheAutomaton}
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
                        addRules={addRules}
                        signalsList={signalsList}
                        setSignalsList={setSignalsList}
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
