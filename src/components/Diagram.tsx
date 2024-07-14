import { Automaton } from "../classes/Automaton";
import { Configuration } from "../classes/Configuration";
import "../style/Cell.css";
import styles from "../style/Diagram.module.scss";

import { Cell, InputCell } from "../classes/Cell.ts";

interface DiagramProps {
    automaton: Automaton;
    initialConfiguration: Configuration;
    nbSteps: number;
    onClickCell?: (cells: Cell[]) => void;
}

export function Diagram({
    automaton,
    initialConfiguration,
    nbSteps,
    onClickCell,
}: DiagramProps) {
    const diagram = automaton.makeDiagram(initialConfiguration, nbSteps);

    const getCenteredCells = (row: number, col: number): Cell[] => {
        const centeredCells: Cell[] = [];
        const nbrofCols = diagram[0].cells.length;
        const cellsoftherow = diagram[row].cells;
        let col1 = col;
        if (col1 < 1) {
            while (col1 < 2) {
                centeredCells.push(new Cell());
                col1++;
            }
            for (let i = 0; i < 3; i++) {
                centeredCells.push(cellsoftherow[col + i]);
            }
        } else if (col1 > nbrofCols - 2) {
            for (let i = -2; i < 0; i++) {
                centeredCells.push(cellsoftherow[col + i]);
            }
            while (col1 > nbrofCols - 2) {
                centeredCells.push(new Cell());
                col1--;
            }
        } else {
            for (let i = -2; i < 3; i++) {
                centeredCells.push(cellsoftherow[col + i]);
            }
        }

        return centeredCells;
    };

    return (
        <div className={styles.diagram}>
            {diagram.reverse().map((config, row) => (
                <DiagramRow
                    key={row}
                    config={config}
                    onClickCell={
                        onClickCell &&
                        ((col: number) => {
                            const centeredCells = getCenteredCells(row, col);
                            onClickCell(centeredCells);
                        })
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
            <div className="cellContent">{signalNames}</div>
        </div>
    );
}
