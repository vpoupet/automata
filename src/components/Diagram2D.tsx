import Automaton from "../classes/Automaton.ts";
import { Configuration } from "../classes/Configuration.ts";
import "../style/Cell.scss";

import Cell from "../classes/Cell.ts";
import type { SettingsInterface, Signal } from "../types.ts";
import CellComponent from "./CellComponent.tsx";
import Heading from "./Common/Heading.tsx";
import { Config2DComponent } from "./Config2DComponent.tsx";
import { useState } from "react";
import Button from "./Common/Button.tsx";

type Props ={
    automaton: Automaton;
    initialConfiguration: Configuration<Cell>;
    hiddenSignalsSet?: Set<Signal>;
    settings: SettingsInterface;
    colorMap: Map<Signal, string>;
}

export default function Diagram({
    automaton,
    initialConfiguration,
    hiddenSignalsSet,
    settings,
    colorMap,
}: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const diagram = automaton.makeDiagram(
        initialConfiguration,
        settings.nbSteps
    );
    if (settings.timeGoesUp) {
        diagram.reverse();
    }

    function incrementStep() {
        setCurrentStep((prev) => Math.min(prev + 1, diagram.length - 1));
    }

    function decrementStep() {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
    
    return (
        <div>
            <Heading level={2}>Diagram</Heading>
            <div className="flex items-center gap-2">
                <Button onClick={decrementStep}>Prev</Button>
                <span className="w-8 text-center">{currentStep}</span>
                <Button onClick={incrementStep}>Next</Button>
            </div>
            <div className="flex flex-col justify-center w-full align-middle">
                    <Config2DComponent
                        config={diagram[currentStep]}
                        hiddenSignalsSet={hiddenSignalsSet}
                        colorMap={colorMap}
                    />
            </div>
        </div>
    );
}

interface DiagramRowProps {
    config: Configuration<Cell>;
    hiddenSignalsSet?: Set<Signal>;
    colorMap: Map<Signal, string>;
}

export function DiagramRow({
    config,
    hiddenSignalsSet,
    colorMap,
}: DiagramRowProps) {
    return (
        <div className="flex flex-row w-full">
            {[...config.iter()].map((c) => {
                const cell = config.getCellAt(c);
                return (
                    <CellComponent
                        key={c.coords.toString()}
                        cell={cell!}
                        hiddenSignalsSet={hiddenSignalsSet}
                        colorMap={colorMap}
                    />
                );
            })}
        </div>
    );
}
