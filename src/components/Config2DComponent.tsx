import Cell from "../classes/Cell";
import { Configuration } from "../classes/Configuration";
import Vector from "../classes/Vector";
import { Signal } from "../types";
import CellComponent from "./CellComponent";

interface Props {
    config: Configuration<Cell>;
    hiddenSignalsSet?: Set<Signal>;
    colorMap: Map<Signal, string>;
}

export function Config2DComponent({
    config,
    hiddenSignalsSet,
    colorMap,
}: Props) {
    const size = config.getSize();
    const rows = [];
    for (let y = 0; y < size.at(1); y++) {
        const row = [];
        for (let x = 0; x < size.at(0); x++) {
            row.push(new Vector([x, y]));
        }
        rows.push(row);
    }

    return (
        <div className="flex flex-col w-full">
            {rows.map((row) => (
                <div className="flex flex-row w-full">
                    {row.map((pos) => {
                        return (
                            <CellComponent
                                key={pos.toString()}
                                cell={config.getCellAt(pos)!}
                                hiddenSignalsSet={hiddenSignalsSet}
                                colorMap={colorMap}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
