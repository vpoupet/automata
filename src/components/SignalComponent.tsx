import { useState } from "react";
import { MdCancel, MdCheckCircle, MdDelete, MdEdit } from "react-icons/md";
import type { Signal } from "../types";
import Button from "./Button";
import MaterialColorPicker from "./MaterialColorPicker";

interface SignalComponentProps {
    signal: Signal;
    color: string;
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    replaceSignal: (value: string) => void;
    canDeleteSignal: boolean;
    deleteSignal: () => void;
    setColor: (color: string) => void;
    isSelectingColor: boolean;
    setIsSelectingColor: (value: boolean) => void;
}
export default function SignalComponent(props: SignalComponentProps) {
    const {
        signal,
        color,
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
                <span
                    onClick={() => setIsSelectingColor(true)}
                    className="cursor-pointer w-4 h-4 rounded-full"
                    style={{
                        backgroundColor: color,
                    }}
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
                    Symbol.keyFor(signal)
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
