import { useState } from 'react';

const ManagerSignaux = () => {
    const [listeSignaux, setListeSignaux] = useState([
        Symbol.for('Init'),
        Symbol.for('2'),
        Symbol.for('3')
    ]);

    const handleAddNewSignal = (signalValue) => {
        if (listeSignaux.includes(signalValue)) {
            alert(`Le signal ${signalValue.description} existe déjà.`);
            return;
        }
        setListeSignaux((prev) => [...prev, signalValue]);
    };

    const updateSignal = (index, newValue) => {
        const oldValue = listeSignaux[index];

        if (listeSignaux.some((signal, i) => signal === newValue && i !== index)) {
            alert(`Le signal ${newValue} existe déjà.`);
            return { success: false, oldValue: null, newValue: null };
        }

        setListeSignaux((prev) =>
            prev.map((signal, i) => (i === index ? newValue : signal))
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
