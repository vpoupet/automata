import { DiagramCell } from "./Diagram.tsx";
import {InputCell} from "../classes/Cell.ts";
import RuleGrid from "../classes/RuleGrid.ts";

type RowInputsProps = {
    colIndex: number;
    grid: RuleGrid;
    activeCells: { row: number; col: number, isInput : boolean }[];
    handleCaseClick: (
        rowIndex: number,
        colIndex: number,
        isInput: boolean,
        event: React.MouseEvent<Element, MouseEvent>
    ) => void;
};

const RowInputs = ({
                                  colIndex,
                                  grid,
                                  activeCells,
                                  handleCaseClick,
                              }: RowInputsProps): JSX.Element => {
    const isActive = activeCells.some(
        (cell) => cell.row === 0 && cell.col === colIndex && cell.isInput
    );

    return (
        <div key={colIndex} className="row">
            <div
                style={{
                    width: "30px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                }}
            >

            </div>
            {grid.inputs[colIndex] && (
                <DiagramCell
                    cell={new InputCell(grid.inputs[colIndex].signals, grid.inputs[colIndex].negatedSignals)}
                    onClick={(event) => handleCaseClick(0, colIndex,true, event)}
                    className={isActive ? "active" : ""}
                />
            )}
            <br></br>
        </div>

    );
};

export default RowInputs;
