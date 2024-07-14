import { InputCell } from "../classes/Cell.ts";
import { Coordinates } from "../types.ts";
import { DiagramCell } from "./Diagram.tsx";

type InputsRowProps = {
    inputs: InputCell[];
    activeInputCells: number[];
    setActiveInputCells: React.Dispatch<React.SetStateAction<number[]>>;
    setActiveOutputCells: React.Dispatch<React.SetStateAction<Coordinates[]>>;
};

export default function GridInputsRow({
    inputs,
    activeInputCells,
    setActiveInputCells,
    setActiveOutputCells,
}: InputsRowProps): JSX.Element {

    function onClickCell(cellIndex: number, event: React.MouseEvent) {
        if (event.ctrlKey || event.metaKey) {
            if (activeInputCells.includes(cellIndex)) {
                setActiveInputCells(activeInputCells.filter((i) => i !== cellIndex));
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
                <DiagramCell
                key={index}
                cell={cell}
                onClick={(event) => onClickCell(index, event)}
                className={activeInputCells.includes(index) ? "active" : ""}
            />
            ))}
        </div>
    );
}
