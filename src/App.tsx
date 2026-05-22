import { useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Automaton from "./classes/Automaton.ts";
import Cell, { InputCell } from "./classes/Cell.ts";
import { Configuration1D } from "./classes/Configuration.ts";
import RuleGrid from "./classes/RuleGrid.ts";
import Vector from "./classes/Vector.ts";
import Heading from "./components/Common/Heading.tsx";
import Diagram1D from "./components/Diagram1D.tsx";
import Diagram2D from "./components/Diagram2D.tsx";
import EditGrid from "./components/EditGrid.tsx";
import RuleInputArea from "./components/RuleInputArea.tsx";
import RulesList from "./components/RulesList.tsx";
import SettingsComponent from "./components/SettingsComponent.tsx";
import SignalsList from "./components/SignalsList.tsx";
import { randomColor } from "./style/materialColors.ts";
import "./style/style.scss";
import { SettingsInterface, Signal, Site } from "./types.ts";

const defaultSettings: SettingsInterface = {
    dimension: 1,
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
        RuleGrid.withSize(settings.gridRadius, settings.gridNbFutureSteps)
    );
    const [extraSignalsSet, setExtraSignalsSet] = useState<Set<Signal>>(
        new Set([Symbol.for("Init")])
    );
    const [activeInputCells, setActiveInputCells] = useState<Vector[]>([]);
    const [activeOutputCells, setActiveOutputCells] = useState<Site[]>([]);
    const [hiddenSignalsSet, setHiddenSignalsSet] = useState<Set<Signal>>(
        new Set()
    );
    const [automataHistory, setAutomataHistory] = useState<Automaton[]>([
        new Automaton(),
    ]);
    const [automatonIndex, setAutomatonIndex] = useState(0);

    const config = Configuration1D.withSize(new Vector([settings.nbCells]));
    config.getCellAt(new Vector())?.addSignal(Symbol.for("Init"));

    const [initialConfiguration, setInitialConfiguration] = useState(config);

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
            newRadius,
            settings.gridNbFutureSteps
        );
        const minWidth = 2 * minRadius + 1;
        const minNbSteps = Math.min(
            grid.outputCells.length,
            newGrid.outputCells.length
        );

        for (let i = 0; i < minWidth; i++) {
            newGrid.inputCells.setCellAt(
                new Vector([i + shiftNew]),
                grid.inputCells.getCellAt(new Vector([i + shiftPrev])) ??
                    new InputCell()
            );
        }
        for (let j = 0; j < minNbSteps; j++) {
            for (let i = 0; i < minWidth; i++) {
                newGrid.outputCells[j].setCellAt(
                    new Vector([i + shiftNew]),
                    grid.outputCells[j].getCellAt(
                        new Vector([i + shiftPrev])
                    ) ?? new Cell()
                );
            }
        }
        setGrid(newGrid);

        const newActiveInputCells: Vector[] = [];
        for (const pos of activeInputCells) {
            if (
                pos.at(0) + deltaRadius >= 0 &&
                pos.at(0) + deltaRadius < newGrid.inputCells.getSize().at(0)
            ) {
                newActiveInputCells.push(pos.add(new Vector([deltaRadius])));
            }
        }
        setActiveInputCells(newActiveInputCells);

        const newActiveOutputCells: Site[] = [];
        for (const { time, pos } of activeOutputCells) {
            if (
                time < newGrid.outputCells.length &&
                pos.at(0) + deltaRadius >= 0 &&
                pos.at(0) + deltaRadius <
                    newGrid.outputCells[time].getSize().at(0)
            ) {
                newActiveOutputCells.push({
                    time: time,
                    pos: pos.add(new Vector([deltaRadius])),
                });
            }
        }
        setActiveOutputCells(newActiveOutputCells);

        // Set initial configuration
        const initialConfiguration = Configuration1D.withSize(
            new Vector([settings.nbCells])
        );
        initialConfiguration.cells[0].addSignal(Symbol.for("Init"));
        setInitialConfiguration(initialConfiguration);
    }, [settings.gridRadius, settings.gridNbFutureSteps, settings.nbCells]);

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
        if (automaton === automataHistory[automatonIndex]) {
            // automaton hasn't changed
            return;
        }

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
        <div className="flex flex-col w-screen min-h-screen p-2 text-gray-700 bg-gradient-to-b from-slate-50 to-slate-100">
            <ToastContainer />
            <div
                className="absolute cursor-pointer top-4 right-4"
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
                    setIsSettingsOpen={setIsSettingsOpen}
                />
            )}
            <Heading level={1}>Signal-based cellular automata</Heading>
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
            <div className="flex gap-2 justify-evenly">
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
            <RulesList
                automaton={automaton}
                setAutomaton={setAutomaton}
                automatonIndex={automatonIndex}
                changeIndexAutomaton={changeIndexAutomaton}
                automataHistoryLength={automataHistory.length}
                exportRules={exportRules}
                grid={grid}
                setGrid={setGrid}
                settings={settings}
                colorMap={colorMap}
            />
            {settings.dimension === 1 ? (
                <Diagram1D
                    automaton={automataHistory[automatonIndex]}
                    initialConfiguration={initialConfiguration!}
                    hiddenSignalsSet={hiddenSignalsSet}
                    settings={settings}
                    colorMap={colorMap}
                />
            ) : (
                <Diagram2D
                    automaton={automataHistory[automatonIndex]}
                    initialConfiguration={initialConfiguration!}
                    hiddenSignalsSet={hiddenSignalsSet}
                    settings={settings}
                    colorMap={colorMap}
                />
            )}
        </div>
    );
}
