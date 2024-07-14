import { useState } from "react";
import { Signal } from "../types";

type GestionSignauxProps = {
    listeSignaux: Signal[];
    onAddSignal: (signal: Signal) => void;
    onUpdateSignal: (index: number, signal: Signal) => void;
    onDeleteSignal: (index: number) => void;
};

export default function GestionSignaux({
    listeSignaux,
    onAddSignal,
    onUpdateSignal,
    onDeleteSignal,
}: GestionSignauxProps): JSX.Element {
    const [newSignalValue, setNewSignalValue] = useState<string>("");
    const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
    const [editSignalValue, setEditSignalValue] = useState<string>("");

    const handleAddSignal = () => {
        if (newSignalValue.trim()) {
            onAddSignal(Symbol.for(newSignalValue));
            setNewSignalValue("");
        }
    };

    const handleEditSignal = (index: number, value: Signal) => {
        const symbolName = Symbol.keyFor(value);
        if (symbolName !== undefined) {
            setEditIndex(index);
            setEditSignalValue(symbolName);
        }
    };

    const handleUpdateSignal = () => {
        if (editIndex !== undefined && editSignalValue.trim()) {
            onUpdateSignal(editIndex, Symbol.for(editSignalValue));
            setEditIndex(undefined);
            setEditSignalValue("");
        }
    };

    return (
        <div>
            <h2>Liste des signaux</h2>
            <ul>
                {listeSignaux.map((signal, idx) => (
                    <li key={idx}>
                        {editIndex === idx ? (
                            <input
                                type="text"
                                value={editSignalValue}
                                onChange={(e) =>
                                    setEditSignalValue(e.target.value)
                                }
                            />
                        ) : (
                            Symbol.keyFor(signal)
                        )}
                        <button onClick={() => handleEditSignal(idx, signal)}>
                            Modifier
                        </button>
                        <button onClick={() => onDeleteSignal(idx)}>
                            Supprimer
                        </button>
                    </li>
                ))}
            </ul>
            {editIndex !== null && (
                <button onClick={handleUpdateSignal}>Sauvegarder</button>
            )}
            <input
                type="text"
                value={newSignalValue}
                onChange={(e) => setNewSignalValue(e.target.value)}
                placeholder="Ajouter un nouveau signal"
            />
            <button onClick={handleAddSignal}>Ajouter</button>
        </div>
    );
}
