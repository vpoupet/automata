import Automaton from "../classes/Automaton.ts";
import { Configuration } from "../classes/Configuration.ts";
import "../style/Cell.scss";

import Cell from "../classes/Cell.ts";
import type { SettingsInterface, Signal } from "../types.ts";
import CellComponent from "./CellComponent.tsx";
import Heading from "./Common/Heading.tsx";
import { Config1DComponent } from "./Config1DComponent.tsx";

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
    const diagram = automaton.makeDiagram(
        initialConfiguration,
        settings.nbSteps
    );
    if (settings.timeGoesUp) {
        diagram.reverse();
    }

    return (
        <div>
            <Heading level={2}>Diagram</Heading>
            <div className="flex flex-col justify-center w-full align-middle">
                {diagram.map((config, row) => (
                    <Config1DComponent
                        key={row}
                        config={config}
                        hiddenSignalsSet={hiddenSignalsSet}
                        colorMap={colorMap}
                    />
                ))}
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
