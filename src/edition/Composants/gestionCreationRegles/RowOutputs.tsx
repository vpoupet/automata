import { DiagramCell } from "../../../components/Diagram.tsx";
import RuleGrid from "../../Objets/RuleGrid.ts";

type RowOutputsProps = {
    rowIndex: number;
    colIndex: number;
    grid: RuleGrid;
    activeCells: { row: number; col: number }[];
    handleCaseClick: (
        rowIndex: number,
        colIndex: number,
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
        (cell) => cell.row === rowIndex && cell.col === colIndex
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
            {caseObj && (
                <DiagramCell
                    key={rowIndex}
                    cell={caseObj}
                    onClick={(event) =>
                        handleCaseClick(
                            rowIndex,
                            colIndex,
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
