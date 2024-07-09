import { SettingsInterface } from "../App";
import { Automaton } from "../classes/Automaton";
import { Configuration } from "../classes/Configuration";
import styles from "../style/Diagram.module.scss";
import "../style/Cell.css";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Cellule from '../edition/Objets/Cellule';
import { Signal } from '../classes/types.ts';  // Mise à jour de l'importation

interface DiagramProps {
    automaton: Automaton;
    settings: SettingsInterface;
    onCellClick: (cells: Cellule[]) => void;
}

export function Diagram({ automaton, settings, onCellClick }: DiagramProps) {
    const initialConfiguration = new Configuration(settings.nbCells);
    initialConfiguration.cells[0].add(Symbol.for("Init"));  // Utilisation de Symbol.for pour ajouter un signal initial
    const diagram = automaton.makeDiagram(initialConfiguration, settings.nbSteps);
    return (
        <div className={styles.diagram}>
            {diagram.reverse().map((config, i) => (
                <DiagramRow
                    key={i}
                    config={config}
                    onCellClick={onCellClick}
                />
            ))}
        </div>
    );
}

interface DiagramRowProps {
    config: Configuration;
    onCellClick: (cells: Cellule[]) => void;
}

function DiagramRow({ config, onCellClick }: DiagramRowProps) {
    const cellules = config.cells.map((c) => new Cellule(c));
    return (
        <div className={styles.row}>
            {config.cells.map((cell, i) => (
                <Cell
                    key={i}
                    cell={cell}
                    onClick={() => handleCellClick(i, cellules, onCellClick)}
                />
            ))}
        </div>
    );
}

function handleCellClick(index: number, cells: Cellule[], onCellClick: (cells: Cellule[]) => void) {
    const cellList: Cellule[] = [];
    for (let i = -2; i <= 2; i++) {
        cellList.push(cells[index + i] || new Cellule());
    }
    onCellClick(cellList);
}

interface CellProps {
    cell: Set<Signal>;
    onClick?: (event: React.MouseEvent) => void;
    className?: string;
}

export function Cell({ cell, onClick, className }: CellProps) {
    const cellule = new Cellule();
    cellule.setSignalsFromSet(cell); // Initialise la cellule avec le Set de signaux

    const signalNames: string[] = [];
    for (const signal of cellule.signals) {
        const signalName = signal.description; // Utilisation de description pour obtenir le nom du symbole
        if (signalName !== undefined) {
            signalNames.push(signalName);
        }
    }

    return (
        <div
            className={`cell ${className}`}
            data-tooltip={signalNames.length > 0 ? signalNames.join(" ") : undefined}
            onClick={onClick}
        >
            <div className='cellContent'>
                {signalNames}
            </div>
        </div>
    );
}
