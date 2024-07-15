import React, { useState } from "react";
import { Signal } from "../types";
import RuleGrid from "../classes/RuleGrid";

type SignalsListProps = {
    listeSignaux: Signal[];
    setListeSignaux: React.Dispatch<React.SetStateAction<Signal[]>>;
    grid: RuleGrid;
    setGrid: React.Dispatch<React.SetStateAction<RuleGrid>>;
    rulesGrids: RuleGrid[];
    setRulesGrids: (rulesGrids: RuleGrid[]) => void;
};

export default function SignalsList({
    listeSignaux,
    setListeSignaux,
    grid,
    setGrid,
    rulesGrids,
    setRulesGrids,
}: SignalsListProps): JSX.Element {
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

    function onAddSignal(signalValue: Signal) {
        if (listeSignaux.includes(signalValue)) {
            alert(`Le signal ${signalValue.description} existe déjà.`);
            return;
        }
        setListeSignaux((prev) => [...prev, signalValue]);
    }

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

    function updateSignalInGrid(oldSignal: Signal, newSignal: Signal) {
        const newGrid = grid.clone();
        for (let rows = 0; rows < grid.outputs.length; rows++) {
            for (let cells = 0; cells < grid.outputs[rows].length; cells++) {
                if (rows === 0) {
                    if (newGrid.inputs[cells].signals.delete(oldSignal)) {
                        newGrid.inputs[cells].addSignal(newSignal);
                    }
                }
                if (newGrid.outputs[rows][cells].signals.delete(oldSignal)) {
                    newGrid.outputs[rows][cells].addSignal(newSignal);
                }
            }
        }
        setGrid(newGrid);
    }

    function updateSignalInRule(oldValue: Signal, newValue: Signal) {
        // TODO: revenir sur cette fonction après avoir ajouté les signaux négatifs à la Cellule
        const newRules: RuleGrid[] = [];
        for (let i = 0; i < rulesGrids.length; i++) {
            newRules.push(rulesGrids[i].clone());
            for (let rows = 0; rows < grid.outputs.length; rows++) {
                for (let col = 0; col < grid.inputs.length; col++) {
                    if (rows === 0) {
                        if (newRules[i].inputs[col].signals.delete(oldValue)) {
                            newRules[i].inputs[col].signals.add(newValue);
                        }
                    }
                    if (
                        newRules[i].outputs[rows][col].signals.delete(oldValue)
                    ) {
                        newRules[i].outputs[rows][col].signals.add(newValue);
                    }
                }
            }
        }
    }

    function onUpdateSignal(index: number, newValue: Signal) {
        const { oldValue, newValue: updatedValue } = updateSignal(
            index,
            newValue
        );

        if (oldValue && updatedValue) {
            updateSignalInRule(oldValue, updatedValue);
            updateSignalInGrid(oldValue, updatedValue);
        }
    }

    function deleteSignal(index: number): Signal | undefined {
        const signal = listeSignaux[index];
        setListeSignaux((prev) => prev.filter((_, i) => i !== index));
        return signal;
    }

    function deleteSignalInRules(signalValue: Signal) {
        const newRulesGrid = [...rulesGrids];
        // TODO: reprendre la fonction après signaux négatifs dans Cellule
        for (let i = 0; i < rulesGrids.length; i++) {
            for (let j = 0; j < rulesGrids[i].inputs.length; j++) {
                newRulesGrid[i].inputs[j].signals.delete(signalValue);
                for (let k = 0; k < rulesGrids[i].outputs.length; k++) {
                    newRulesGrid[i].outputs[k][j].signals.delete(signalValue);
                }
            }
        }
        setRulesGrids(newRulesGrid);
    }

    function deleteSignalInGrid(signal: Signal) {
        const newGrid = grid.clone();
        for (let row = 0; row < grid.outputs.length; row++) {
            for (let cells = 0; cells < grid.outputs[row].length; cells++) {
                if (row === 0) {
                    newGrid.inputs[cells].signals.forEach((s) => {
                        if (s === signal) {
                            newGrid.inputs[cells].removeSignal(signal);
                        }
                    });
                } else {
                    newGrid.outputs[row - 1][cells].signals.forEach((s) => {
                        if (s === signal) {
                            newGrid.outputs[row - 1][cells].removeSignal(
                                signal
                            );
                        }
                    });
                }
            }
        }
        setGrid(newGrid);
    }
    
    function onDeleteSignal(index: number) {
        const signal = deleteSignal(index);
        if (signal) {
            deleteSignalInRules(signal);
            deleteSignalInGrid(signal);
        }
    }

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
