import { useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Automaton from "./classes/Automaton.ts";
import Configuration from "./classes/Configuration.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import Heading from "./components/Common/Heading.tsx";
import Diagram from "./components/Diagram.tsx";
import EditGrid from "./components/EditGrid.tsx";
import RuleInputArea from "./components/RuleInputArea.tsx";
import RulesList from "./components/RulesList.tsx";
import SettingsComponent from "./components/SettingsComponent.tsx";
import SignalsList from "./components/SignalsList.tsx";
import { randomColor } from "./style/materialColors.ts";
import "./style/style.scss";
import { Coordinates, SettingsInterface, Signal } from "./types.ts";

const defaultSettings: SettingsInterface = {
    gridRadius: 2,
    gridNbFutureSteps: 3,
    nbCells: 40,
    nbSteps: 60,
    timeGoesUp: true,
};

export default function App() {
    const [settings, setSettings] = useState(defaultSettings);
    const [colorPickingSignal, setColorPickingSignal] = useState<
        Signal | undefined
    >(undefined);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [colorMap, setColorMap] = useState(new Map<Signal, string>());
    const [grid, setGrid] = useState<RuleGrid>(
        RuleGrid.withSize(
            2 * settings.gridRadius + 1,
            settings.gridNbFutureSteps
        )
    );
    const [extraSignalsSet, setExtraSignalsSet] = useState<Set<Signal>>(
        new Set([Symbol.for("Init")])
    );
    const [activeInputCells, setActiveInputCells] = useState<number[]>([]);
    const [activeOutputCells, setActiveOutputCells] = useState<Coordinates[]>(
        []
    );
    const [hiddenSignalsSet, setHiddenSignalsSet] = useState<Set<Signal>>(
        new Set()
    );
    const [automataHistory, setAutomataHistory] = useState<Automaton[]>([
        new Automaton(),
    ]);
    const [automatonIndex, setAutomatonIndex] = useState(0);
    const [initialConfiguration, setInialConfiguration] =
        useState<Configuration>(Configuration.withSize(settings.nbCells));

    // Update edit grid when settings change
    useEffect(() => {
        const prevRadius = grid.getRadius();
        const newRadius = settings.gridRadius;
        const deltaRadius = newRadius - prevRadius;

        let minRadius;
        let shiftPrev = 0;
        let shiftNew = 0;
        if (newRadius >= prevRadius) {
            minRadius = prevRadius;
            shiftNew = deltaRadius;
        } else {
            minRadius = newRadius;
            shiftPrev = -deltaRadius;
        }
        const newGrid = RuleGrid.withSize(
            2 * newRadius + 1,
            settings.gridNbFutureSteps
        );
        const minWidth = 2 * minRadius + 1;
        const minNbSteps = Math.min(
            grid.outputCells.length,
            newGrid.outputCells.length
        );

        for (let i = 0; i < minWidth; i++) {
            newGrid.inputCells[i + shiftNew] = grid.inputCells[i + shiftPrev];
        }
        for (let j = 0; j < minNbSteps; j++) {
            for (let i = 0; i < minWidth; i++) {
                newGrid.outputCells[j][i + shiftNew] =
                    grid.outputCells[j][i + shiftPrev];
            }
        }
        setGrid(newGrid);

        const newActiveInputCells = [];
        for (const col of activeInputCells) {
            if (
                col + deltaRadius >= 0 &&
                col + deltaRadius < newGrid.inputCells.length
            ) {
                newActiveInputCells.push(col + deltaRadius);
            }
        }
        setActiveInputCells(newActiveInputCells);

        const newActiveOutputCells = [];
        for (const { row, col } of activeOutputCells) {
            if (
                row < newGrid.outputCells.length &&
                col + deltaRadius >= 0 &&
                col + deltaRadius < newGrid.outputCells[row].length
            ) {
                newActiveOutputCells.push({
                    row: row,
                    col: col + deltaRadius,
                });
            }
        }
        setActiveOutputCells(newActiveOutputCells);

        // Set initial configuration
        const initialConfiguration = Configuration.withSize(settings.nbCells);
        initialConfiguration.cells[0].addSignal(Symbol.for("Init"));
        setInialConfiguration(initialConfiguration);
    }, [settings.gridRadius, settings.gridNbFutureSteps]);

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

    function exportRules() {
        const rules = automaton.rules.map((rule) => rule.toString()).join("\n");
        navigator.clipboard.writeText(rules);
        toast.success("Rules copied to clipboard");
    }

    return (
        <div className="flex flex-col p-2 bg-gradient-to-b from-slate-50 to-slate-100 text-gray-700 w-screen min-h-screen">
            <ToastContainer />
            <div
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() => {
                    setIsSettingsOpen(!isSettingsOpen);
                }}
            >
                <span className="text-4xl">
                    <MdSettings />
                </span>
            </div>
            {isSettingsOpen && (
                <SettingsComponent
                    settings={settings}
                    setSettings={setSettings}
                />
            )}
            <Heading level={1}>Signal-based cellular automata</Heading>
            <div className="flex justify-evenly">
                <EditGrid
                    grid={grid}
                    setGrid={setGrid}
                    settings={settings}
                    automaton={automaton}
                    setAutomaton={setAutomaton}
                    extraSignalsSet={extraSignalsSet}
                    activeInputCells={activeInputCells}
                    setActiveInputCells={setActiveInputCells}
                    activeOutputCells={activeOutputCells}
                    setActiveOutputCells={setActiveOutputCells}
                    colorMap={colorMap}
                />
                <RuleInputArea
                    automaton={automataHistory[automatonIndex]}
                    setAutomaton={setAutomaton}
                />
            </div>
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
            <RulesList
                automaton={automaton}
                setAutomaton={setAutomaton}
                automatonIndex={automatonIndex}
                changeIndexAutomaton={changeIndexAutomaton}
                automataHistoryLength={automataHistory.length}
                exportRules={exportRules}
                settings={settings}
                colorMap={colorMap}
            />

            <Diagram
                automaton={automataHistory[automatonIndex]}
                initialConfiguration={initialConfiguration!}
                nbSteps={settings.nbSteps}
                gridRadius={settings.gridRadius}
                gridNbFutureSteps={settings.gridNbFutureSteps}
                setGrid={setGrid}
                hiddenSignalsSet={hiddenSignalsSet}
                colorMap={colorMap}
            />
        </div>
    );
}
