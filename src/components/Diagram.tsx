import { Automaton } from "../classes/Automaton";
import { Configuration } from "../classes/Configuration";
import "../style/Cell.scss";
import styles from "../style/Diagram.module.scss";

import { Cell, InputCell } from "../classes/Cell.ts";
import RuleGrid from "../classes/RuleGrid.ts";

interface DiagramProps {
    automaton: Automaton;
    initialConfiguration: Configuration;
    nbSteps: number;
    gridRadius?: number;
    gridNbFutureSteps?: number;
    setGrid?: React.Dispatch<React.SetStateAction<RuleGrid>>;
    signalIndex: { [key: string]: number };
}

export function Diagram({
    automaton,
    initialConfiguration,
    nbSteps,
    gridRadius,
    gridNbFutureSteps,
    setGrid,
    signalIndex,
}: DiagramProps) {
    const diagram = automaton.makeDiagram(initialConfiguration, nbSteps);

    function onClickCell(row: number, col: number): void {
        if (!setGrid || !gridRadius || !gridNbFutureSteps) {
            return;
        }

        const diagramRow = diagram[row].cells;
        const inputs = [];
        for (let i = col - gridRadius; i <= col + gridRadius; i++) {
            const cell = diagramRow[i];
            inputs.push(cell ? new InputCell(cell.signals) : new InputCell());
        }
        const gridDiagram = automaton.makeDiagram(
            new Configuration(inputs),
            gridNbFutureSteps
        );
        setGrid(
            new RuleGrid(
                inputs,
                gridDiagram.slice(1).map((c) => c.cells)
            )
        );
    }

    return (
        <div className={styles.diagram}>
            {diagram.reverse().map((config, row) => (
                <DiagramRow
                    key={row}
                    config={config}
                    onClickCell={(col: number) => {
                        onClickCell(row, col);
                    }}
                    signalIndex={signalIndex}
                />
            ))}
        </div>
    );
}

interface DiagramRowProps {
    config: Configuration;
    onClickCell?: (col: number) => void;
    signalIndex: { [key: string]: number };
}

export function DiagramRow({
    config,
    onClickCell,
    signalIndex,
}: DiagramRowProps) {
    return (
        <div className={styles.row}>
            {config.cells.map((cell, col) => (
                <DiagramCell
                    key={col}
                    cell={cell}
                    onClick={onClickCell && (() => onClickCell(col))}
                    signalIndex={signalIndex}
                />
            ))}
        </div>
    );
}

interface DiagramCellProps {
    cell: Cell;
    onClick?: (event: React.MouseEvent) => void;
    className?: string;
    signalIndex: { [key: string]: number };
}

export function DiagramCell({
    cell,
    onClick,
    className,
    signalIndex,
}: DiagramCellProps) {
    const signalNames: string[] = [];
    if (cell instanceof InputCell) {
        for (const negsign of cell.negatedSignals) {
            const signalName = "!" + negsign.description;
            signalNames.push(signalName);
        }
    }
    for (const signal of cell.signals) {
        const signalName = signal.description; // Utilisation de description pour obtenir le nom du symbole
        if (signalName !== undefined) {
            signalNames.push(signalName);
        }
    }

    return (
        <div
            className={`cell ${className}`}
            data-tooltip={
                signalNames.length > 0 ? signalNames.join(" ") : undefined
            }
            onClick={onClick}
        >
            {[...cell.signals].map((signal) => {
                const key = Symbol.keyFor(signal);
                if (key !== undefined) {
                    return <div key={key} className={`s${signalIndex[key]}`} />;
                }
            })}
        </div>
    );
}
