import { SettingsInterface } from "../App";
import { Automaton } from "../classes/Automaton";
import { Configuration } from "../classes/Configuration";
import { Signal } from "../classes/types";
import styles from "../style/Diagram.module.scss"


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Cellule from '../edition/Objets/Cellule';


interface DiagramProps {
    automaton: Automaton;
    settings: SettingsInterface;
}
export function Diagram({ automaton, settings }: DiagramProps) {
    const initialConfiguration = new Configuration(settings.nbCells);
    initialConfiguration.cells[0].add(Symbol.for("Init"));
    const diagram = automaton.makeDiagram(initialConfiguration, settings.nbSteps);
    return <div className={styles.diagram}>
        {diagram.reverse().map((config, i) =>
            <DiagramRow key={i} config={config} />
        )}
    </div>;
}

interface DiagramRowProps {
    config: Configuration;
}
function DiagramRow({ config }: DiagramRowProps) {
    return <div className={styles.row}>
        {config.cells.map((cell, i) => <DiagramCell key={i} cell={cell} />)}
    </div>;
}

interface DiagramCellProps {
    cell: Set<Signal>;
}

function DiagramCell({ cell }: DiagramCellProps) {
    const cellule = new Cellule();
    cellule.fromSet(cell); // Initialise la cellule avec le Set de signaux

    const signalNames: string[] = [];
    for (const signal of cellule.signals) {
        const signalName = signal.getValue();
        if (signalName !== undefined) {
            signalNames.push(signalName);
        }
    }

    return <div className={styles.cell} data-tooltip={signalNames.length > 0 ? signalNames.join(" ") : undefined}>
        {signalNames.map((signalName, i) =>
            <div key={i} className={`${signalName}`}></div>
        )}
    </div>;
}

export default DiagramCell;