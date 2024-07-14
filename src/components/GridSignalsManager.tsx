import { Cell } from "../classes/Cell";
import { Signal } from "../types";
import { ChangeEvent } from "react";

type GridSignalsManagerProps = {
    activeSignals: Set<Signal>;
    negatedSignals: Set<Signal>;
    allSignals: Signal[];
    applyToActiveCells: (f: (cell: Cell) => void) => void;
};

export default function GridSignalsManager({
    activeSignals,
    negatedSignals,
    allSignals,
    applyToActiveCells: applyToActiveCells,
}: GridSignalsManagerProps): JSX.Element {
    function handleLeftCheckboxChange(
        signal: Signal,
        e: ChangeEvent<HTMLInputElement>
    ) {
        if (e.target.checked) {
            applyToActiveCells((c: Cell) => c.addSignal(signal));
        } else {
            applyToActiveCells((c: Cell) => c.removeSignal(signal));
        }
    }

    function handleRightCheckboxChange(
        signal: Signal,
        e: ChangeEvent<HTMLInputElement>
    ) {
        if (e.target.checked) {
            applyToActiveCells((c: Cell) =>
                c.addNegatedSignal(signal)
            );
        } else {
            applyToActiveCells((c: Cell) =>
                c.removeNegatedSignal(signal)
            );
        }
    }

    return (
        <div>
            <h2>Gérer les signaux</h2>
            <div>
                <label>
                    <button
                        onClick={() =>
                            applyToActiveCells((c: Cell) => {
                                c.removeAllSignals();
                            })
                        }
                    >
                        Enlever tous les signaux
                    </button>
                </label>
            </div>
            {allSignals.map((signal) => (
                <div key={Symbol.keyFor(signal)}>
                    <label>
                        <input
                            type="checkbox"
                            checked={activeSignals.has(signal)}
                            onChange={(e) =>
                                handleLeftCheckboxChange(signal, e)
                            }
                        />
                        <input
                            type="checkbox"
                            checked={negatedSignals.has(signal)} // Modifier ceci
                            onChange={(e) =>
                                handleRightCheckboxChange(signal, e)
                            }
                        />
                        {Symbol.keyFor(signal)}
                    </label>
                </div>
            ))}
        </div>
    );
}
