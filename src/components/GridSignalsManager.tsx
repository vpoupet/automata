import { ChangeEvent } from "react";
import { MdBackspace } from "react-icons/md";
import Cell from "../classes/Cell";
import { Signal } from "../types";
import Button from "./Button";
import Heading from "./Heading";

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
            applyToActiveCells((c: Cell) => c.addNegatedSignal(signal));
        } else {
            applyToActiveCells((c: Cell) => c.removeNegatedSignal(signal));
        }
    }

    return (
        <div>
            <Heading level={2}>Gérer les signaux</Heading>
            <div>
                <label>
                    <Button
                        variant="secondary"
                        onClick={() =>
                            applyToActiveCells((c: Cell) => {
                                c.removeAllSignals();
                            })
                        }
                    >
                        <MdBackspace />
                    </Button>
                </label>
            </div>
            <div className="columns-3">
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
        </div>
    );
}
