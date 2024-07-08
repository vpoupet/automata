import { useState } from "react";
import { Signal } from "../../../classes/types";

const ManagerSignaux = () => {
    const [listeSignaux, setListeSignaux] = useState([
        Symbol.for("Init"),
        Symbol.for("2"),
        Symbol.for("3"),
    ]);

    const handleAddNewSignal = (signalValue: Signal) => {
        if (listeSignaux.includes(signalValue)) {
            alert(`Le signal ${signalValue.description} existe déjà.`);
            return;
        }
        setListeSignaux((prev) => [...prev, signalValue]);
    };

    function updateSignal(
        index: number,
        newValue: Signal
    ): { oldValue: Signal | null; newValue: Signal | null } {
        const oldValue = listeSignaux[index];

        if (
            listeSignaux.some((signal, i) => signal === newValue && i !== index)
        ) {
            alert(`Le signal ${newValue.description} existe déjà.`);
            return { oldValue: null, newValue: null };
        }

        setListeSignaux((prev) =>
            prev.map((signal, i) => (i === index ? newValue : signal))
        );

        return { oldValue, newValue };
    }

    function deleteSignal(index: number): Signal | undefined {
        const signal = listeSignaux[index];
        setListeSignaux((prev) => prev.filter((_, i) => i !== index));
        return signal;
    }

    return { listeSignaux, handleAddNewSignal, deleteSignal, updateSignal };
};

export default ManagerSignaux;
