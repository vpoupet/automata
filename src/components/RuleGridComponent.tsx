import { MdChangeCircle, MdDelete } from "react-icons/md";
import Cell, { InputCell } from "../classes/Cell";
import { Signal } from "../types";
import Button from "./Common/Button";
import GridComponent from "./GridComponent";
import Frame from "./Common/Frame";

interface RuleGridComponentProps {
    inputCells: InputCell[];
    outputCells: Cell[][];
    colorMap: Map<Signal, string>;
    onDelete?: () => void;
    onUpdate?: () => void;
}

export default function RuleGridComponent(props: RuleGridComponentProps) {
    const { inputCells, outputCells, colorMap, onDelete, onUpdate } = props;
    return (
        <Frame variant="gray" className="m-2 flex flex-col items-center gap-2">
            <GridComponent
                inputCells={inputCells}
                outputCells={outputCells}
                colorMap={colorMap}
            />
            <div className="flex gap-2">
                <Button variant="secondary" onClick={onDelete}>
                    <MdDelete />
                </Button>
                <Button variant="secondary" onClick={onUpdate}>
                    <MdChangeCircle />
                </Button>
            </div>
        </Frame>
    );
}
