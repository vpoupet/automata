import Automaton from "../classes/Automaton";
import Configuration from "../classes/Configuration";
import "../style/Cell.scss";

import RuleGrid from "../classes/RuleGrid.ts";
import type { SettingsInterface, Signal } from "../types.ts";
import CellComponent from "./CellComponent.tsx";
import Heading from "./Common/Heading.tsx";

interface DiagramProps {
    automaton: Automaton;
    initialConfiguration: Configuration;
    setGrid?: React.Dispatch<React.SetStateAction<RuleGrid>>;
    hiddenSignalsSet?: Set<Signal>;
    settings: SettingsInterface;
    colorMap: Map<Signal, string>;
}

export default function Diagram({
    automaton,
    initialConfiguration,
    setGrid,
    hiddenSignalsSet,
    settings,
    colorMap,
}: DiagramProps) {
    const diagram = automaton.makeDiagram(initialConfiguration, settings.nbSteps);
    if (settings.timeGoesUp) {
        diagram.reverse();
    }

    function onClickCell(row: number, col: number): void {
        if (!setGrid) {
            return;
        }

        const diagramRow = diagram[row].cells;
        const gridWidth = 2 * settings.gridRadius + 1;
        const grid = RuleGrid.withSize(gridWidth, settings.gridNbFutureSteps);
        for (let i = 0; i < gridWidth; i++) {
            const cell = diagramRow[col - settings.gridRadius + i];
            if (cell) {
                grid.inputCells[i].signals = cell.signals;
            }
        }
        setGrid(grid);
    }

    return (
        <div>
            <Heading level={2}>Diagram</Heading>
            <div className="w-full flex flex-col justify-center align-middle">
                {diagram.map((config, row) => (
                    <DiagramRow
                        key={row}
                        config={config}
                        onClickCell={(col: number) => {
                            onClickCell(row, col);
                        }}
                        hiddenSignalsSet={hiddenSignalsSet}
                        colorMap={colorMap}
                    />
                ))}
            </div>
        </div>
    );
}

interface DiagramRowProps {
    config: Configuration;
    onClickCell?: (col: number) => void;
    hiddenSignalsSet?: Set<Signal>;
    colorMap: Map<Signal, string>;
}

export function DiagramRow({
    config,
    onClickCell,
    hiddenSignalsSet,
    colorMap,
}: DiagramRowProps) {
    return (
        <div className="w-full flex flex-row">
            {config.cells.map((cell, col) => (
                <CellComponent
                    key={col}
                    cell={cell}
                    onClick={onClickCell && (() => onClickCell(col))}
                    hiddenSignalsSet={hiddenSignalsSet}
                    colorMap={colorMap}
                />
            ))}
        </div>
    );
}
