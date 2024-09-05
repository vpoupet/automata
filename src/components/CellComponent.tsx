import Cell, { InputCell } from "../classes/Cell";
import type { Signal } from "../types";

interface CellComponentProps {
    cell: Cell;
    onClick?: (event: React.MouseEvent) => void;
    isActive?: boolean;
    hiddenSignalsSet?: Set<Signal>;
    colorMap: Map<Signal, string>;
}

export default function CellComponent({
    cell,
    onClick,
    isActive = false,
    hiddenSignalsSet = new Set(),
    colorMap,
}: CellComponentProps) {
    const signalNames: string[] = [];
    if (cell instanceof InputCell) {
        for (const signal of cell.negatedSignals) {
            const signalName = "!" + signal.description;
            signalNames.push(signalName);
        }
    }
    for (const signal of cell.signals) {
        const signalName = signal.description; // Utilisation de description pour obtenir le nom du symbole
        if (signalName !== undefined) {
            signalNames.push(signalName);
        }
    }

    return (
        <div
            className={`cell ${isActive ? "bg-gray-300" : "bg-white"}`}
            data-tooltip={
                signalNames.length > 0 ? signalNames.join(" ") : undefined
            }
            onClick={onClick}
        >
            {cell instanceof InputCell &&
                [...cell.negatedSignals]
                    .filter((s) => !hiddenSignalsSet.has(s))
                    .map((signal) => {
                        return (
                            <div
                                key={"!" + Symbol.keyFor(signal)}
                                style={{
                                    backgroundColor:
                                        colorMap.get(signal) ?? "#000",
                                }}
                                className="st neg"
                            />
                        );
                    })}
            {[...cell.signals]
                .filter((s) => !hiddenSignalsSet.has(s))
                .map((signal) => {
                    return (
                        <div
                            key={Symbol.keyFor(signal)}
                            style={{
                                backgroundColor: colorMap.get(signal) ?? "#000",
                            }}
                            className="st"
                        />
                    );
                })}
        </div>
    );
}
