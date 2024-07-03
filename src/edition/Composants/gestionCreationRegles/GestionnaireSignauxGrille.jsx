import React from 'react';

const GestionnaireSignauxGrille = ({ signals, allSignals, onAddSignal, onRemoveSignal, onAddAllSignals, onRemoveAllSignals }) => {
    const aucunsignal = signals.length === 0;

    const handleToggleAllSignals = (e) => {
        if (e.target.checked) {
            onRemoveAllSignals();
        } else {
            onAddAllSignals();
        }
    };

    const handleLeftCheckboxChange = (signal, e) => {
        if (e.target.checked) {
            onAddSignal(signal);
        } else {
            onRemoveSignal(signal);
        }
    };

    const handleRightCheckboxChange = (signal, e) => {
        const negatedSignal = Symbol.for('!' + Symbol.keyFor(signal));
        if (e.target.checked) {
            onAddSignal(negatedSignal);
        } else {
            onRemoveSignal(negatedSignal);
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
                            checked={signals.includes(signal)}
                            onChange={(e) => handleLeftCheckboxChange(signal, e)}
                        />
                        <input
                            type="checkbox"
                            checked={signals.includes(Symbol.for('!' + Symbol.keyFor(signal)))}
                            onChange={(e) => handleRightCheckboxChange(signal, e)}
                        />
                        {Symbol.keyFor(signal)}
                    </label>
                </div>
            ))}
        </div>
    );
};

export default GestionnaireSignauxGrille;
