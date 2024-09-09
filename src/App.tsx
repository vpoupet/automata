import { useState } from "react";
import Automaton from "./classes/Automaton.ts";
import Configuration from "./classes/Configuration.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import Button from "./components/Button.tsx";
import Diagram from "./components/Diagram.tsx";
import EditGrid from "./components/EditGrid.tsx";
import Heading from "./components/Heading.tsx";
import RuleInputArea from "./components/RuleInputArea.tsx";
import RulesList from "./components/RulesList.tsx";
import SignalsList from "./components/SignalsList.tsx";
import "./style/style.scss";
import { SettingsInterface, Signal } from "./types.ts";
import { randomColor } from "./style/materialColors.ts";

export default function App() {
    const [settings] = useState<SettingsInterface>({
        gridRadius: 2,
        gridNbFutureSteps: 3,
        nbCells: 40,
        nbSteps: 60,
        timeGoesUp: true,
    });
    const [colorPickingSignal, setColorPickingSignal] = useState<
        Signal | undefined
    >(undefined);
    const [colorMap, setColorMap] = useState(new Map<Signal, string>());

    const [grid, setGrid] = useState<RuleGrid>(
        RuleGrid.withSize(
            2 * settings.gridRadius + 1,
            settings.gridNbFutureSteps
        )
    );

    const [extraSignalsSet, setExtraSignalsSet] = useState<Set<Signal>>(
        new Set()
    );
    const [hiddenSignalsSet, setHiddenSignalsSet] = useState<Set<Signal>>(
        new Set()
    );

    const [automataHistory, setAutomataHistory] = useState<Automaton[]>([
        new Automaton(),
    ]);
    const [automatonIndex, setAutomatonIndex] = useState(0);

    function changeIndexAutomaton(deltaIndex: number) {
        if (
            automatonIndex + deltaIndex < 0 ||
            automatonIndex + deltaIndex >= automataHistory.length
        ) {
            return;
        }
        setAutomatonIndex(automatonIndex + deltaIndex);
    }

    function setAutomaton(automaton: Automaton) {
        if (automatonIndex < automataHistory.length - 1) {
            setAutomataHistory([
                ...automataHistory.slice(0, automatonIndex + 1),
                automaton,
            ]);
        } else {
            setAutomataHistory([...automataHistory, automaton]);
        }
        setAutomatonIndex(automatonIndex + 1);
    }

    function setRulesGrids(rulesGrids: RuleGrid[]) {
        const rules = rulesGrids.map((ruleGrid) => ruleGrid.makeRule());
        const auto = new Automaton(rules);
        setAutomaton(auto);
    }

    function setSignalColor(signal: Signal, color: string) {
        const newColorMap = new Map(colorMap);
        newColorMap.set(signal, color);
        setColorMap(newColorMap);
    }

    const automaton = automataHistory[automatonIndex];
    const signalsList = Array.from(
        automaton.signals.union(extraSignalsSet)
    ).sort((a, b) => {
        const descA = a.description || "";
        const descB = b.description || "";
        return descA.localeCompare(descB);
    });

    const uncoloredSignals = signalsList.filter(
        (signal) => !colorMap.has(signal)
    );
    if (uncoloredSignals.length > 0) {
        const newColorMap = new Map(colorMap);
        for (const signal of uncoloredSignals) {
            newColorMap.set(signal, randomColor());
        }
        setColorMap(newColorMap);
    }

    // Set initial configuration
    const initialConfiguration = Configuration.withSize(settings.nbCells);
    initialConfiguration.cells[0].addSignal(Symbol.for("Init"));

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
                        rulesGrid={[RuleGrid.withSize(2, 2)]} // TODO: remove
                        setRulesGrid={setRulesGrids}
                        automaton={automaton}
                        extraSignalsSet={extraSignalsSet}
                        colorMap={colorMap}
                    />
                    <div>
                        <Button
                            onClick={() => changeIndexAutomaton(-1)}
                            disabled={automatonIndex === 0}
                        >
                            Précédent
                        </Button>
                        <Button
                            onClick={() => changeIndexAutomaton(1)}
                            disabled={
                                automatonIndex >= automataHistory.length - 1
                            }
                        >
                            <span>Suivant</span>
                        </Button>
                    </div>
                </div>
                <div className="flex">
                    <SignalsList
                        automaton={automaton}
                        setAutomaton={setAutomaton}
                        extraSignalsSet={extraSignalsSet}
                        setExtraSignalsSet={setExtraSignalsSet}
                        hiddenSignalsSet={hiddenSignalsSet}
                        setHiddenSignalsSet={setHiddenSignalsSet}
                        colorMap={colorMap}
                        setColorMap={setColorMap}
                        colorPickingSignal={colorPickingSignal}
                        setColorPickingSignal={setColorPickingSignal}
                        setSignalColor={setSignalColor}
                    />
                </div>
            </div>
            <Heading level={2}>Règles</Heading>
            <RulesList automaton={automaton} colorMap={colorMap} />
            <div className="flex justify-between m-2">
                <div className="flex">
                    <RuleInputArea
                        automaton={automataHistory[automatonIndex]}
                        setAutomaton={setAutomaton}
                    />
                </div>
            </div>
            <div className="self-center">
                <Diagram
                    automaton={automataHistory[automatonIndex]}
                    initialConfiguration={initialConfiguration}
                    nbSteps={settings.nbSteps}
                    gridRadius={settings.gridRadius}
                    gridNbFutureSteps={settings.gridNbFutureSteps}
                    setGrid={setGrid}
                    hiddenSignalsSet={hiddenSignalsSet}
                    colorMap={colorMap}
                />
            </div>
        </div>
    );
}
