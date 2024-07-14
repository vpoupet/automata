import { Signal } from "../types";
import { ChangeEvent } from "react";

type GestionnaireSignauxGrilleProps = {
    activeSignals: Signal[];
    allSignals: Signal[];
    negatedSignals: Signal[];
    onAddSignal: (signal: Signal) => void;
    onRemoveSignal: (signal: Signal) => void;
    onAddAllSignals: () => void;
    onRemoveAllSignals: () => void;
    onAddNegatedSignal: (signal: Signal) => void;
    onRemoveNegatedSignal: (signal: Signal) => void;
};

const GestionnaireSignauxGrille = ({
    activeSignals,
    allSignals,
    negatedSignals,
    onAddSignal,
    onRemoveSignal,
    onAddAllSignals,
    onRemoveAllSignals,
    onAddNegatedSignal,
    onRemoveNegatedSignal,
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
            onRemoveNegatedSignal(signal);
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
