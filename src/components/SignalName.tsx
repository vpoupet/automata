import type { Signal } from "../types";

interface SignalNameProps {
    signal: Signal;
    colorMap: Map<Signal, string>;
    onClickColor?: () => void;
    className?: string;
}

export default function SignalName(props: SignalNameProps) {
    const { signal, colorMap, onClickColor, className } = props;
    const color = colorMap.get(signal) ?? "black";

    return (
        <span
            className={`inline-flex border-2 rounded-full px-1 shadow-sm ${className}`}
            style={{ borderColor: color }}
        >
            <span
                className={`relative top-1 w-4 h-4 rounded-full mr-1 ${
                    onClickColor ? "cursor-pointer" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={onClickColor}
            />
            {signal.description}
        </span>
    );
}
