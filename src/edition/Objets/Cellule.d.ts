declare module './Cellule' {
    import {Signal} from "../../classes/types.ts";

    class Cellule {
        signals: Signal[];

        constructor();

        get(signal: string): boolean;

        addSignal(signalValue: string): void;

        removeSignal(signalValue: string): void;

        removeAllSignals(): void;

        modifySignal(signal: string, newSignal: string): void;

        toSet(): Set<symbol>;

        fromSet(signalSet: Set<Signal>): void;
    }

    export = Cellule;
}
