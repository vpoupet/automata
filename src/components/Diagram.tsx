import { Automaton } from "../classes/Automaton";
import { Configuration } from "../classes/Configuration";
import "../style/Cell.css";
import styles from "../style/Diagram.module.scss";

import { Cell } from "../classes/Cell.ts";

interface DiagramProps {
    automaton: Automaton;
    initialConfiguration: Configuration;
    nbSteps: number;
    onClickCell?: (row: number, col: number) => void;
}

export function Diagram({
    automaton,
    initialConfiguration,
    nbSteps,
    onClickCell,
}: DiagramProps) {
    const diagram = automaton.makeDiagram(initialConfiguration, nbSteps);
    return (
        <div className={styles.diagram}>
            {diagram.reverse().map((config, row) => (
                <DiagramRow
                    key={row}
                    config={config}
                    onClickCell={
                        onClickCell && ((col) => onClickCell(row, col))
                    }
                />
            ))}
        </div>
    );
}

interface DiagramRowProps {
    config: Configuration;
    onClickCell?: (col: number) => void;
}

function DiagramRow({ config, onClickCell }: DiagramRowProps) {
    return (
        <div className={styles.row}>
            {config.cells.map((cell, col) => (
                <DiagramCell
                    key={col}
                    cell={cell}
                    onClick={onClickCell && (() => onClickCell(col))}
                />
            ))}
        </div>
    );
}

interface CellProps {
    cell: Cell;
    onClick?: (event: React.MouseEvent) => void;
    className?: string;
}

export function DiagramCell({ cell, onClick, className }: CellProps) {
    const signalNames: string[] = [];
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
            <div className="cellContent">{signalNames}</div>
        </div>
    );
}
