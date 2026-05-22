import Cell from "../classes/Cell";
import { Configuration } from "../classes/Configuration";
import { Signal } from "../types";
import CellComponent from "./CellComponent";

interface Props {
    config: Configuration<Cell>;
    hiddenSignalsSet?: Set<Signal>;
    colorMap: Map<Signal, string>;
}

export function Config1DComponent({
    config,
    hiddenSignalsSet,
    colorMap,
}: Props) {
    return (
        <div className="flex flex-row w-full">
            {[...config.iter()].map((c) => {
                const cell = config.getCellAt(c);
                return (
                    <CellComponent
                        key={c.coords.toString()}
                        cell={cell!}
                        hiddenSignalsSet={hiddenSignalsSet}
                        colorMap={colorMap}
                    />
                );
            })}
        </div>
    );
}
