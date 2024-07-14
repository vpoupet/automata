import { DiagramCell } from "./Diagram.tsx";
import RuleGrid from "../classes/RuleGrid.ts";

type RowOutputsProps = {
    rowIndex: number;
    colIndex: number;
    grid: RuleGrid;
    activeCells: { row: number; col: number, isInput: boolean}[];
    handleCaseClick: (
        rowIndex: number,
        colIndex: number,
        isInput: boolean,
        event: React.MouseEvent<Element, MouseEvent>
    ) => void;
};

const RowOutputs = ({
                            rowIndex,
                            colIndex,
                            grid,
                            activeCells,
                            handleCaseClick,
                        }: RowOutputsProps): JSX.Element => {
    const caseObj = grid.getCaseOutput(rowIndex, colIndex);
    const isActive = activeCells.some(
        (cell) => cell.row === rowIndex && cell.col === colIndex && !cell.isInput
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
            {caseObj && (
                <DiagramCell
                    key={rowIndex}
                    cell={caseObj}
                    onClick={(event) =>
                        handleCaseClick(
                            rowIndex,
                            colIndex,
                            false,
                            event
                        )
                    }
                    className={isActive ? "active" : ""}
                />
            )}
        </div>
    );
};

export default RowOutputs;
