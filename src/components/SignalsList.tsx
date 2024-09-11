import React, { useState } from "react";
import { FaCircleDown, FaCircleUp } from "react-icons/fa6";
import { MdCancel, MdCheckCircle, MdDelete, MdEdit } from "react-icons/md";
import Automaton from "../classes/Automaton";
import type { Signal } from "../types";
import Button from "./Common/Button";
import Frame from "./Common/Frame";
import Heading from "./Common/Heading";
import MaterialColorPicker from "./MaterialColorPicker";
import SignalName from "./SignalName";

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
    const [isOpen, setIsOpen] = useState(false);
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
        <Frame className="w-96 h-fit">
            <span onClick={() => setIsOpen(!isOpen)}>
                <Heading level={2} className="flex flex-row justify-between items-center">
                    Signals list {isOpen ? <FaCircleUp /> : <FaCircleDown />}
                </Heading>
            </span>
            {isOpen && (
                <div className="flex flex-col gap-1">
                    <Button onClick={toggleAllSignals} variant="secondary">
                        Toggle
                    </Button>
                    {signalsList.map((signal) => (
                        <SignalsListItem
                            key={signal.description}
                            signal={signal}
                            colorMap={colorMap}
                            isVisible={!hiddenSignalsSet.has(signal)}
                            setIsVisible={(value) =>
                                setIsVisible(signal, value)
                            }
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
                    <span className="flex flex-row gap-1">
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
                            placeholder="Add new signal"
                        />
                        <Button onClick={addExtraSignal}>Add</Button>
                    </span>
                </div>
            )}
        </Frame>
    );
}

interface SignalsListItemProps {
    signal: Signal;
    colorMap: Map<Signal, string>;
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    replaceSignal: (value: string) => void;
    canDeleteSignal: boolean;
    deleteSignal: () => void;
    setColor: (color: string) => void;
    isSelectingColor: boolean;
    setIsSelectingColor: (value: boolean) => void;
}

function SignalsListItem(props: SignalsListItemProps) {
    const {
        signal,
        colorMap,
        isVisible,
        setIsVisible,
        replaceSignal,
        canDeleteSignal,
        deleteSignal,
        setColor,
        isSelectingColor,
        setIsSelectingColor,
    } = props;
    const signalName = Symbol.keyFor(signal) ?? "";
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(signalName);

    return (
        <div key={signal.description} className="relative flex justify-between">
            {isSelectingColor && (
                <MaterialColorPicker
                    chooseColor={(color) => {
                        setColor(color);
                        setIsSelectingColor(false);
                    }}
                    closeColorPicker={() => setIsSelectingColor(false)}
                />
            )}
            <span className="flex gap-2 items-center">
                <input
                    type="checkbox"
                    onChange={() => setIsVisible(!isVisible)}
                    checked={isVisible}
                />
                {isEditing ? (
                    <input
                        type="text"
                        value={editValue}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                replaceSignal(editValue);
                                setIsEditing(false);
                            } else if (e.key === "Escape") {
                                setIsEditing(false);
                            }
                        }}
                        onChange={(e) => setEditValue(e.target.value)}
                    />
                ) : (
                    <SignalName
                        signal={signal}
                        colorMap={colorMap}
                        onClickColor={() => setIsSelectingColor(true)}
                    />
                )}
            </span>
            <span className="flex gap-2">
                {isEditing ? (
                    <span>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                replaceSignal(editValue);
                                setIsEditing(false);
                            }}
                        >
                            <MdCheckCircle />
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsEditing(false);
                            }}
                        >
                            <MdCancel />
                        </Button>
                    </span>
                ) : (
                    <span>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setEditValue(signalName);
                                setIsEditing(true);
                            }}
                        >
                            <MdEdit />
                        </Button>
                        {canDeleteSignal && (
                            <Button variant="secondary" onClick={deleteSignal}>
                                <MdDelete />
                            </Button>
                        )}
                    </span>
                )}
            </span>
        </div>
    );
}
