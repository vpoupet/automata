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

    const handleLeftCheckboxChange = (signalValue, e) => {
        if (e.target.checked) {
            onAddSignal(signalValue);
        } else {
            onRemoveSignal(signalValue);
        }
    };

    const handleRightCheckboxChange = (signalValue, e) => {
        if (e.target.checked) {
            onAddSignal('!' + signalValue);
        } else {
            onRemoveSignal('!' + signalValue);
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
                <div key={signal.value}>
                    <label>
                        <input
                            type="checkbox"
                            checked={signals.includes(signal.value)}
                            onChange={(e) => handleLeftCheckboxChange(signal.value, e)}
                        />
                        <input
                            type="checkbox"
                            checked={signals.includes('!' + signal.value)}
                            onChange={(e) => handleRightCheckboxChange(signal.value, e)}
                        />
                        {signal.value}
                    </label>
                </div>
            ))}
        </div>
    );
};

export default GestionnaireSignauxGrille;
