import { ChangeEvent } from "react";
import Cell from "../classes/Cell";
import { Signal } from "../types";
import SignalName from "./SignalName";

type GridSignalsManagerProps = {
    activeSignals: Set<Signal>;
    negatedSignals: Set<Signal>;
    allSignals: Signal[];
    applyToActiveCells: (f: (cell: Cell) => void) => void;
    colorMap: Map<Signal, string>;
};

export default function GridSignalsManager({
    activeSignals,
    negatedSignals,
    allSignals,
    applyToActiveCells,
    colorMap,
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
        <div className="columns-3">
            {allSignals.map((signal) => (
                <div key={Symbol.keyFor(signal)}>
                    <span className="flex gap-2 my-2">
                        <span className="flex gap-1">
                            <input
                                type="checkbox"
                                checked={activeSignals.has(signal)}
                                onChange={(e) =>
                                    handleLeftCheckboxChange(signal, e)
                                }
                            />
                            <input
                                type="checkbox"
                                checked={negatedSignals.has(signal)}
                                onChange={(e) =>
                                    handleRightCheckboxChange(signal, e)
                                }
                            />
                        </span>
                        <SignalName signal={signal} colorMap={colorMap}/>
                    </span>
                </div>
            ))}
        </div>
    );
}
