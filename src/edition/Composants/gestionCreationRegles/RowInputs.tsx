import { DiagramCell } from "../../../components/Diagram.tsx";
import { Cell } from "../../../classes/Cell.ts";
import RuleGrid from "../../Objets/RuleGrid.ts";

type RowInputsProps = {
    colIndex: number;
    grid: RuleGrid;
    activeCells: { row: number; col: number }[];
    handleCaseClick: (
        rowIndex: number,
        colIndex: number,
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
        (cell) => cell.row === -1 && cell.col === colIndex
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
                {colIndex + 1}
            </div>
            {grid.inputs[colIndex] && (
                <DiagramCell
                    cell={new Cell(grid.inputs[colIndex].signals)}
                    onClick={(event) => handleCaseClick(-1, colIndex, event)}
                    className={isActive ? "active" : ""}
                />
            )}
        </div>
    );
};

export default RowInputs;
