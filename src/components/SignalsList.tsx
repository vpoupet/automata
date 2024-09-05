import React, { useState } from "react";
import Automaton from "../classes/Automaton";
import type { Signal } from "../types";
import Button from "./Button";
import Heading from "./Heading";
import SignalComponent from "./SignalComponent";

type SignalsListProps = {
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
    extraSignalsSet: Set<Signal>;
    setExtraSignalsSet: (signals: Set<Signal>) => void;
    hiddenSignalsSet: Set<Signal>;
    setHiddenSignalsSet: React.Dispatch<React.SetStateAction<Set<Signal>>>;
    colorMap: Map<Signal, string>;
    setColorMap: (colorMap: Map<Signal, string>) => void;
    colorPickingSignal: Signal | undefined;
    setColorPickingSignal: (signal: Signal | undefined) => void;
    setSignalColor: (signal: Signal, color: string) => void;
};

export default function SignalsList({
    automaton,
    setAutomaton,
    extraSignalsSet,
    setExtraSignalsSet,
    hiddenSignalsSet,
    setHiddenSignalsSet,
    colorMap,
    setColorMap,
    colorPickingSignal,
    setColorPickingSignal,
    setSignalColor,
}: SignalsListProps): JSX.Element {
    const [newSignalValue, setNewSignalValue] = useState("");
    const signalsList = automaton.getSignalsList(extraSignalsSet);

    function replaceSignal(oldValue: Signal, newValue: Signal): void {
        if (oldValue === newValue) {
            return;
        }

        if (automaton.signals.has(newValue) || extraSignalsSet.has(newValue)) {
            alert(`Le signal ${newValue.description} existe déjà.`);
            return;
        }

        if (extraSignalsSet.has(oldValue)) {
            setExtraSignalsSet(
                new Set(
                    [...extraSignalsSet].map((signal) =>
                        signal === oldValue ? newValue : signal
                    )
                )
            );
        }

        const newColorMap = new Map(colorMap);
        newColorMap.set(newValue, colorMap.get(oldValue) ?? "#000");
        setColorMap(newColorMap);

        if (automaton.signals.has(oldValue)) {
            setAutomaton(automaton.replaceSignal(oldValue, newValue));
        }
    }

    function addExtraSignal(): void {
        const validSignalNames = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
        if (!newSignalValue.match(validSignalNames)) {
            alert("Nom de signal invalide.");
            return;
        }

        const newSignal = Symbol.for(newSignalValue);
        if (
            automaton.signals.has(newSignal) ||
            extraSignalsSet.has(newSignal)
        ) {
            alert(`Le signal ${newSignalValue} existe déjà.`);
            return;
        }

        setExtraSignalsSet(new Set([...extraSignalsSet, newSignal]));
        setNewSignalValue("");
    }

    function deleteExtraSignal(signal: Signal): void {
        const newExtraSignalsSet = new Set(extraSignalsSet);
        newExtraSignalsSet.delete(signal);
        setExtraSignalsSet(newExtraSignalsSet);
    }

    function setIsVisible(signal: Signal, isVisible: boolean) {
        const newHiddenSignalsSet = new Set(hiddenSignalsSet);
        if (isVisible) {
            newHiddenSignalsSet.delete(signal);
        } else {
            newHiddenSignalsSet.add(signal);
        }
        setHiddenSignalsSet(newHiddenSignalsSet);
    }

    function toggleAllSignals() {
        if (hiddenSignalsSet.size === 0) {
            setHiddenSignalsSet(new Set(signalsList));
        } else {
            setHiddenSignalsSet(new Set());
        }
    }

    return (
        <div>
            <Heading level={2}>Liste des signaux</Heading>
            <div className="flex flex-col gap-1">
                <Button onClick={toggleAllSignals} variant="secondary">
                    Toggle
                </Button>
                {signalsList.map((signal) => (
                    <SignalComponent
                        key={signal.description}
                        signal={signal}
                        color={colorMap.get(signal) ?? "#000000"}
                        isVisible={!hiddenSignalsSet.has(signal)}
                        setIsVisible={(value) => setIsVisible(signal, value)}
                        replaceSignal={(value) =>
                            replaceSignal(signal, Symbol.for(value))
                        }
                        canDeleteSignal={!automaton.signals.has(signal)}
                        deleteSignal={() => deleteExtraSignal(signal)}
                        isSelectingColor={signal === colorPickingSignal}
                        setIsSelectingColor={(value) => {
                            if (value) {
                                setColorPickingSignal(signal);
                            } else {
                                setColorPickingSignal(undefined);
                            }
                        }}
                        setColor={(color) => setSignalColor(signal, color)}
                    />
                ))}
                <span className="flex flex-row">
                    <input
                        type="text"
                        className="w-full border border-gray-400 p-2"
                        value={newSignalValue}
                        onChange={(e) => setNewSignalValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                addExtraSignal();
                            }
                        }}
                        placeholder="Ajouter un nouveau signal"
                    />
                    <Button onClick={addExtraSignal}>Ajouter</Button>
                </span>
            </div>
        </div>
    );
}
