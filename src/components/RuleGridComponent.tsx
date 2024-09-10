import { MdChangeCircle, MdDelete } from "react-icons/md";
import Cell, { InputCell } from "../classes/Cell";
import { Signal } from "../types";
import Button from "./Button";
import GridComponent from "./GridComponent";

interface RuleGridComponentProps {
    inputCells: InputCell[];
    outputCells: Cell[][];
    colorMap: Map<Signal, string>;
}

export default function RuleGridComponent(props: RuleGridComponentProps) {
    const { inputCells, outputCells, colorMap } = props;
    return (
        <div className="m-2 shadow-md p-2 flex flex-col items-center gap-2 bg-gray-100">
            <GridComponent
                inputCells={inputCells}
                outputCells={outputCells}
                colorMap={colorMap}
            />
            <div className="flex gap-2">
                <Button variant="secondary">
                    <MdDelete />
                </Button>
                <Button variant="secondary">
                    <MdChangeCircle />
                </Button>
            </div>
        </div>
    );
}
