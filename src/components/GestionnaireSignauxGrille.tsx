import { Cell } from "../classes/Cell";
import { Signal } from "../types";
import { ChangeEvent } from "react";

type GestionnaireSignauxGrilleProps = {
    activeSignals: Signal[];
    allSignals: Signal[];
    negatedSignals: Signal[];
    applyToActiveCells: (f: (cell: Cell) => void) => void;
};

const GestionnaireSignauxGrille = ({
    activeSignals,
    allSignals,
    negatedSignals,
    applyToActiveCells: applyToActiveCells,
}: GestionnaireSignauxGrilleProps): JSX.Element => {
    function handleLeftCheckboxChange(
        signal: Signal,
        e: ChangeEvent<HTMLInputElement>
    ) {
        if (e.target.checked) {
            applyToActiveCells((caseObj: Cell) =>
                caseObj.addSignal(signal)
            );
        } else {
            applyToActiveCells((caseObj: Cell) =>
                caseObj.removeSignal(signal)
            );
        }
    }

    function handleRightCheckboxChange(
        signal: Signal,
        e: ChangeEvent<HTMLInputElement>
    ) {
        if (e.target.checked) {
            applyToActiveCells((caseObj: Cell) =>
                caseObj.addNegatedSignal(signal)
            );
        } else {
            applyToActiveCells((caseObj: Cell) =>
                caseObj.removeNegatedSignal(signal)
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
                            applyToActiveCells((caseObj: Cell) => {
                                caseObj.removeAllSignals();
                            })
                        }
                    >Enlever tous les signaux</button>
                </label>
            </div>
            {allSignals.map((signal) => (
                <div key={Symbol.keyFor(signal)}>
                    <label>
                        <input
                            type="checkbox"
                            checked={activeSignals.includes(signal)}
                            onChange={(e) =>
                                handleLeftCheckboxChange(signal, e)
                            }
                        />
                        <input
                            type="checkbox"
                            checked={negatedSignals.includes(signal)} // Modifier ceci
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
};

export default GestionnaireSignauxGrille;
