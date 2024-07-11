import {useState} from "react";
import {Automaton, Rule} from "../../../classes/Automaton.ts";
import {Coordinates, Signal} from "../../../classes/types.ts";
import {Cell, InputCell} from "../../../classes/Cell.ts";
import RuleGrid from "../../Objets/RuleGrid.ts";
import ruleGrid from "../../Objets/RuleGrid.ts";


const ManagerGrilleInteractive = (
        rows: number,
        cols: number,
        automaton: Automaton,
        reglesbools: Rule[],
        setAutomaton: (automaton: Automaton) => void,
        // setActiveRules: React.Dispatch<React.SetStateAction<boolean[]>>,
        // regles: RuleGrid[],
        // activeRules: boolean[],
    ) => {
        const [grid, setGrid] = useState<RuleGrid>(new RuleGrid(rows, cols));
        const [activeCells, setActiveCells] = useState<Coordinates[]>([]);

        const updateGrille = (callback: (cellule: Cell) => void) => {
            const newGrid = grid.clone();
            activeCells.forEach(({row, col, isInput}) => {
                let cell;
                if (isInput) {
                    cell = newGrid.inputs[col];
                } else {
                    cell = newGrid.outputs[row][col];
                }
                callback(cell);
            });
            setGrid(newGrid);
        };

        const updateGrilleInput = (callback : (cellule: InputCell) => void ) => {
            const newGrid = grid.clone()
            activeCells.forEach(({col}) => {
                callback(newGrid.inputs[col]);
            });
            setGrid(newGrid);
        };

        const handleCaseClick = (
            rowIndex: number,
            colIndex: number,
            isInput: boolean,
            event: React.MouseEvent
        ) => {
            if (event.ctrlKey || event.metaKey) {
                setActiveCells((prev) => {
                    const alreadySelected = prev.some(
                        (cell) => cell.row === rowIndex && cell.col === colIndex
                    );
                    if (alreadySelected) {
                        return prev.filter(
                            (cell) =>
                                !(cell.row === rowIndex && cell.col === colIndex && cell.isInput === isInput)
                        );
                    } else {
                        return [...prev, {row: rowIndex, col: colIndex, isInput: isInput}];
                    }
                });
            }
                // } else if (event.shiftKey) {
                //     setActiveCells((prev) => {
                //         const alreadySelected = prev.some(
                //             (cell) => cell.row === rowIndex && cell.col === colIndex && cell.isInput===isInput
                //         );
                //         if (alreadySelected) {
                //             return prev.filter(
                //                 (cell) =>
                //                     !(cell.row === rowIndex && cell.col === colIndex && cell.isInput==isInput)
                //             );
                //         } else if (prev.length === 1) {
                //             const firstCell = prev[0];
                //             const newActiveCells = [];
                //
                //             const minRow = Math.min(firstCell.row, rowIndex);
                //             const maxRow = Math.max(firstCell.row, rowIndex);
                //             const minCol = Math.min(firstCell.col, colIndex);
                //             const maxCol = Math.max(firstCell.col, colIndex);
                //
                //             for (let i = minRow; i <= maxRow; i++) {
                //                 for (let j = minCol; j <= maxCol; j++) {
                //                     newActiveCells.push({row: i, col: j, });
                //                 }
                //             }
                //
                //             return newActiveCells;
                //         } else {
                //             return [...prev, {row: rowIndex, col: colIndex, isInput: isInput}];
                //         }
            //     });
            else {
                setActiveCells([{row: rowIndex, col: colIndex, isInput: isInput}]);
            }
        };

        const handleRemoveSignal = (signal: Signal) => {
            updateGrille((caseObj: Cell) => caseObj.removeSignal(signal));
        };

        const handleAddSignal = (signal: Signal) => {
            updateGrille((caseObj: Cell) => caseObj.addSignal(signal));
        };
        const handleAddNegatedSignal = (signal: Signal) => {
            updateGrilleInput((caseObj: InputCell) => caseObj.addNegatedSignal(signal));
        }

        const handleRemoveAllSignals = () => {
            updateGrille((caseObj: Cell) => {
                caseObj.removeAllSignals();
            });
        };

        const handleRemoveAllSignalsFromGrid = () => {
            const newGrid = new RuleGrid(rows, cols);
            setGrid(newGrid);
        };

        const updateGrilleFromRule = (ruleToCopy: RuleGrid) => {
            setGrid(ruleToCopy.clone());
        };

        const handleAddAllSignals = (listeSignaux: Signal[]) => {
            updateGrille((caseObj: Cell) => {
                listeSignaux.forEach((signal) => caseObj.addSignal(signal));
            });
        };

        const updateSignalInGrid = (oldSignal: Signal, newSignal: Signal) => {
            const newGrid = grid.clone();
            for (let rows = 0; rows < grid.outputs.length; rows++) {
                for (let cells = 0; cells < grid.outputs[rows].length; cells++) {
                    if (rows === 0) {
                        if (newGrid.inputs[cells].signals.delete(oldSignal)) {
                            newGrid.inputs[cells].addSignal(newSignal);
                        }
                    }
                    if (newGrid.outputs[rows][cells].signals.delete(oldSignal)) {
                        newGrid.outputs[rows][cells].addSignal(newSignal);
                    }
                }
            }
            setGrid(newGrid);
        };

        const deleteSignalInGrid = (signal: Signal) => {
            const newGrid = grid.clone();
            for (let row = 0; row < grid.outputs.length; row++) {
                for (let cells = 0; cells < grid.outputs[row].length; cells++) {
                    if (row === 0) {
                        newGrid.inputs[cells].signals.forEach((s) => {
                            if (s === signal) {
                                newGrid.inputs[cells].removeSignal(signal);
                            }
                        });
                    } else {
                        newGrid.outputs[row - 1][cells].signals.forEach((s) => {
                            if (s === signal) {
                                newGrid.outputs[row - 1][cells].removeSignal(signal);
                            }
                        });
                    }
                }
            }
            setGrid(newGrid);
        };

        const applyRulesGrid = () => {
            const newGrille = new ruleGrid(rows, cols);
            const conffromgrid = newGrille.getConfigurationFromGrid();
            automaton.setRules(reglesbools);
            automaton.updateParameters();
            setAutomaton(automaton);
            const conf = automaton.makeDiagram(
                conffromgrid,
                grid.outputs.length
            );
            newGrille.setGridFromConfigurations(conf);
        }
        const handleUpdateFromDiagramme = (cells: Cell[]) => {
            const newGrid = new RuleGrid(rows, cols);
            const cells1 = cells.slice(0, cols);
            for (let i = 0; i < cells1.length; i++) {
                newGrid.inputs[i] = new InputCell(cells1[i].signals)
            }
            setGrid(newGrid);
        };

// useEffect(() => {
//     const config = new Configuration(cols);
//     for (let i = 0; i < cols; i++) {
//         config.cells[i] = grid.inputs[i].getSignals();
//     }
//     for (let i = 0; i < regles.length; i++) {
//         setActiveRules((prevRules) => {
//             const newRules = [...prevRules];
//             newRules[i] = false;
//             return newRules;
//         });
//     }
//
//     for (let i = 0; i < cols; i++) {
//         const neighborhood = config.getNeighborhood(i, -2, 2);
//         for (let j = 0; j < regles.length; j++) {
//             if (reglesbools[j].condition.eval(neighborhood)) {
//                 const newRules = [...activeRules];
//                 newRules[j] = true;
//                 setActiveRules(newRules);
//             }
//         }
//     }
// }, [grid]);

        return {
            grid,
            activeCells,
            setActiveCells,
            handleAddSignal,
            handleRemoveSignal,
            handleAddAllSignals,
            handleRemoveAllSignals,
            handleRemoveAllSignalsFromGrid,
            handleCaseClick,
            updateGrilleFromRule,
            updateSignalInGrid,
            deleteSignalInGrid,
            handleUpdateFromDiagramme,
            applyRulesGrid,
            handleAddNegatedSignal,
        };
    }
;

export default ManagerGrilleInteractive;
