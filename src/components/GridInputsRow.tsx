import { InputCell } from "../classes/Cell.ts";
import { Coordinates, Signal } from "../types.ts";
import CellComponent from "./CellComponent.tsx";

type InputsRowProps = {
    inputs: InputCell[];
    activeInputCells: number[];
    setActiveInputCells: React.Dispatch<React.SetStateAction<number[]>>;
    setActiveOutputCells: React.Dispatch<React.SetStateAction<Coordinates[]>>;
    colorMap: Map<Signal, string>;
};

export default function GridInputsRow({
    inputs,
    activeInputCells,
    setActiveInputCells,
    setActiveOutputCells,
    colorMap,
}: InputsRowProps): JSX.Element {
    function onClickCell(cellIndex: number, event: React.MouseEvent) {
        if (event.ctrlKey || event.metaKey) {
            if (activeInputCells.includes(cellIndex)) {
                setActiveInputCells(
                    activeInputCells.filter((i) => i !== cellIndex)
                );
            } else {
                setActiveInputCells([...activeInputCells, cellIndex]);
            }
        } else {
            setActiveInputCells([cellIndex]);
            setActiveOutputCells([]);
        }
    }

    return (
        <div className="grid-row">
            {inputs.map((cell, index) => (
                <CellComponent
                    key={index}
                    cell={cell}
                    onClick={(event) => onClickCell(index, event)}
                    isActive={activeInputCells.includes(index)}
                    colorMap={colorMap}
                />
            ))}
        </div>
    );
}
