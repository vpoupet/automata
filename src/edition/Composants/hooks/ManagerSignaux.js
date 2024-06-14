import { useState } from 'react';
import Signal from "../../Objets/Signal";

const ManagerSignaux = () => {
    const [listeSignaux, setListeSignaux] = useState([
        new Signal('1'),
        new Signal('2'),
        new Signal('3')
    ]);

    const handleAddNewSignal = (signalValue) => {
        if (listeSignaux.some(signal => signal.value === signalValue)) {
            alert(`Le signal ${signalValue} existe déjà.`);
            return;
        }
        setListeSignaux((prev) => [...prev, new Signal(signalValue)]);
    };

    const updateSignal = (index, newValue) => {
        const oldValue = listeSignaux[index].value;

        if (listeSignaux.some((signal, i) => signal.value === newValue && i !== index)) {
            alert(`Le signal ${newValue} existe déjà.`);
            return { success: false, oldValue: null, newValue: null };
        }

        setListeSignaux((prev) =>
            prev.map((signal, i) => (i === index ? new Signal(newValue) : signal))
        );

        return { success: true, oldValue, newValue };
    };

    const deleteSignal = (index) => {
        const signalValue = listeSignaux[index].value;
        setListeSignaux((prev) => prev.filter((signal, i) => i !== index));
        return signalValue;
    };

    return { listeSignaux, handleAddNewSignal, deleteSignal, updateSignal };
};

export default ManagerSignaux;
