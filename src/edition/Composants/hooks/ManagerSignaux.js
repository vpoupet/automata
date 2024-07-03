import { useState } from 'react';

const ManagerSignaux = () => {
    const [listeSignaux, setListeSignaux] = useState([
        Symbol.for('Init'),
        Symbol.for('2'),
        Symbol.for('3')
    ]);

    const handleAddNewSignal = (signalValue) => {
        const symbol = Symbol.for(signalValue);
        if (listeSignaux.includes(symbol)) {
            alert(`Le signal ${signalValue} existe déjà.`);
            return;
        }
        setListeSignaux((prev) => [...prev, symbol]);
    };

    const updateSignal = (index, newValue) => {
        const oldValue = Symbol.keyFor(listeSignaux[index]);
        const newSymbol = Symbol.for(newValue);

        if (listeSignaux.some((signal, i) => signal === newSymbol && i !== index)) {
            alert(`Le signal ${newValue} existe déjà.`);
            return { success: false, oldValue: null, newValue: null };
        }

        setListeSignaux((prev) =>
            prev.map((signal, i) => (i === index ? newSymbol : signal))
        );

        return { success: true, oldValue, newValue };
    };

    const deleteSignal = (index) => {
        const signalValue = Symbol.keyFor(listeSignaux[index]);
        setListeSignaux((prev) => prev.filter((signal, i) => i !== index));
        return signalValue;
    };

    return { listeSignaux, handleAddNewSignal, deleteSignal, updateSignal };
};

export default ManagerSignaux;
