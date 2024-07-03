import { useState } from "react";

const GestionSignaux = ({ listeSignaux, onAddSignal, onUpdateSignal, onDeleteSignal }) => {
    const [newSignalValue, setNewSignalValue] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editSignalValue, setEditSignalValue] = useState("");

    const handleAddSignal = () => {
        if (newSignalValue.trim()) {
            onAddSignal(Symbol.for(newSignalValue));
            setNewSignalValue("");
        }
    };

    const handleEditSignal = (index, value) => {
        setEditIndex(index);
        setEditSignalValue(Symbol.keyFor(value));
    };

    const handleUpdateSignal = () => {
        if (editSignalValue.trim()) {
            onUpdateSignal(editIndex, Symbol.for(editSignalValue));
            setEditIndex(null);
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
                                onChange={(e) => setEditSignalValue(e.target.value)}
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
                <button onClick={handleUpdateSignal}>
                    Sauvegarder
                </button>
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

export default GestionSignaux;
