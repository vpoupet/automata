import { Signal } from "../../../classes/types";
import { ChangeEvent } from "react";

type GestionnaireSignauxGrilleProps = {
    activeSignals: Signal[];
    allSignals: Signal[];
    onAddSignal: (signal: Signal) => void;
    onRemoveSignal: (signal: Signal) => void;
    onAddAllSignals: () => void;
    onRemoveAllSignals: () => void;
    onAddNegatedSignal: (signal: Signal) => void;
};

const GestionnaireSignauxGrille = ({
    activeSignals,
    allSignals,
    onAddSignal,
    onRemoveSignal,
    onAddAllSignals,
    onRemoveAllSignals, onAddNegatedSignal,
}: GestionnaireSignauxGrilleProps): JSX.Element => {
    const aucunsignal = activeSignals.length === 0;

    const handleToggleAllSignals = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onRemoveAllSignals();
        } else {
            onAddAllSignals();
        }
    };
    const handleLeftCheckboxChange = (
        signal: Signal,
        e: ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.checked) {
            onAddSignal(signal);
        } else {
            onRemoveSignal(signal);
        }
    };

    const handleRightCheckboxChange = (
        signal: Signal,
        e: ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.checked) {
            onAddNegatedSignal(signal);
        } else {
            onRemoveSignal(signal);
        }
    };

    return (
        <div>
            <h2>Gérer les signaux</h2>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={aucunsignal}
                        onChange={handleToggleAllSignals}
                    />
                    Enlever tous les signaux
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
                            checked={activeSignals.includes(
                                Symbol.for("!" + Symbol.keyFor(signal))
                            )}
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
