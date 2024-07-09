import { useEffect, useState } from "react";
import Grille from "../../Objets/Grille.ts";
import { Configuration } from "../../../classes/Configuration.ts";
import { Automaton, Rule } from "../../../classes/Automaton.ts";
import { Coordinates, Signal } from "../../../classes/types.ts";
import { Cell } from "../../../classes/Cell.ts";

const ManagerGrilleInteractive = (
    rows: number,
    cols: number,
    automaton: Automaton,
    reglesbools: Rule[],
    setAutomaton: (automaton: Automaton) => void,
    setActiveRules: React.Dispatch<React.SetStateAction<boolean[]>>,
    regles: Cell[][][],
    activeRules: boolean[]
) => {
    const [grille, setGrille] = useState<Grille>(new Grille(rows, cols));
    const [activeCells, setActiveCells] = useState<Coordinates[]>([]);

    const updateGrille = (callback: (cellule: Cell) => void) => {
        const newGrille = new Grille(grille.grid.length, grille.grid[0].length);
        newGrille.grid = grille.grid.map((r, rowIndex) =>
            r.map((c, colIndex) => {
                const newCase = new Cell(c.signals);
                if (
                    activeCells.some(
                        (cell) => cell.row === rowIndex && cell.col === colIndex
                    )
                ) {
                    callback(newCase);
                }
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    const handleCaseClick = (
        rowIndex: number,
        colIndex: number,
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
                            !(cell.row === rowIndex && cell.col === colIndex)
                    );
                } else {
                    return [...prev, { row: rowIndex, col: colIndex }];
                }
            });
        } else if (event.shiftKey) {
            setActiveCells((prev) => {
                const alreadySelected = prev.some(
                    (cell) => cell.row === rowIndex && cell.col === colIndex
                );
                if (alreadySelected) {
                    return prev.filter(
                        (cell) =>
                            !(cell.row === rowIndex && cell.col === colIndex)
                    );
                } else if (prev.length === 1) {
                    const firstCell = prev[0];
                    const newActiveCells = [];

                    const minRow = Math.min(firstCell.row, rowIndex);
                    const maxRow = Math.max(firstCell.row, rowIndex);
                    const minCol = Math.min(firstCell.col, colIndex);
                    const maxCol = Math.max(firstCell.col, colIndex);

                    for (let i = minRow; i <= maxRow; i++) {
                        for (let j = minCol; j <= maxCol; j++) {
                            newActiveCells.push({ row: i, col: j });
                        }
                    }

                    return newActiveCells;
                } else {
                    return [...prev, { row: rowIndex, col: colIndex }];
                }
            });
        } else {
            setActiveCells([{ row: rowIndex, col: colIndex }]);
        }
    };

    const handleRemoveSignal = (signal: Signal) => {
        updateGrille((caseObj: Cell) => caseObj.removeSignal(signal));
    };

    const handleAddSignal = (signal: Signal) => {
        if (typeof signal !== "symbol") {
            console.error("Invalid signal value:", signal);
            return;
        }
        updateGrille((caseObj: Cell) => caseObj.addSignal(signal));
    };

    const handleRemoveAllSignals = () => {
        updateGrille((caseObj: Cell) => {
            caseObj.removeAllSignals();
        });
    };

    const handleRemoveAllSignalsFromGrid = () => {
        const newGrille = new Grille(rows, cols);
        newGrille.grid = grille.grid.map((row) => row.map(() => new Cell()));
        setGrille(newGrille);
    };

    const updateGrilleFromRule = (configuration: Cell[][]) => {
        const newGrille = new Grille(rows, cols);
        newGrille.grid = configuration.map((row) =>
            row.map((cell) => new Cell(cell.signals))
        );
        setGrille(newGrille);
    };

    const handleAddAllSignals = (listeSignaux: Signal[]) => {
        updateGrille((caseObj: Cell) => {
            if (Array.isArray(listeSignaux)) {
                listeSignaux.forEach((signal) => {
                    if (typeof signal === "symbol") {
                        caseObj.addSignal(signal);
                    } else {
                        console.error(
                            "Invalid signal in listeSignaux:",
                            signal
                        );
                    }
                });
            } else {
                console.error("Invalid listeSignaux:", listeSignaux);
            }
        });
    };

    const updateSignalInGrid = (oldSignal: Signal, newSignal: Signal) => {
        if (typeof oldSignal !== "symbol" || typeof newSignal !== "symbol") {
            console.error("Invalid signal value:", oldSignal, newSignal);
            return;
        }
        const newGrille = new Grille(grille.grid.length, grille.grid[0].length);
        newGrille.grid = grille.grid.map((row) =>
            row.map((cell) => {
                const newCase = new Cell();
                cell.signals.forEach((signal) => {
                    if (signal === oldSignal) {
                        newCase.addSignal(newSignal);
                    } else if (
                        signal === Symbol.for("!" + Symbol.keyFor(oldSignal))
                    ) {
                        newCase.addSignal(
                            Symbol.for("!" + Symbol.keyFor(newSignal))
                        );
                    } else {
                        newCase.addSignal(signal);
                    }
                });
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    const deleteSignalInGrid = (signal: Signal) => {
        const newGrille = new Grille(grille.grid.length, grille.grid[0].length);
        newGrille.grid = grille.grid.map((row) =>
            row.map((cell) => {
                const newCase = cell.clone();
                newCase.removeSignal(signal);
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    const handleUpdateFromDiagramme = (cells: Cell[]) => {
        const newGrille = new Grille(rows, cols);

        cells.forEach((cell, index) => {
            cell.signals.forEach((signal) => {
                newGrille.grid[0][index].addSignal(signal);
            });
        });
        setGrille(newGrille);
    };

    const applyRulesGrid = () => {
        const newGrille = new Grille(rows, cols);
        const gridConfiguration = new Configuration(grille.grid.length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            gridConfiguration.cells[i] = grille.grid[0][i];
        }
        automaton.setRules(reglesbools);
        automaton.updateParameters();
        setAutomaton(automaton);
        const conf = automaton.makeDiagram(
            gridConfiguration,
            grille.grid.length - 1
        );
        for (let i = 0; i < conf.length; i++) {
            for (let j = 0; j < conf[i].cells.length; j++) {
                newGrille.grid[i][j] = conf[i].cells[j].clone();
            }
        }
        setGrille(newGrille);
    };

    useEffect(() => {
        const config = new Configuration(grille.grid[0].length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            config.cells[i] = grille.grid[0][i];
        }
        for (let i = 0; i < regles.length; i++) {
            setActiveRules((prevRules) => {
                const newRules = [...prevRules];
                newRules[i] = false;
                return newRules;
            });
        }

        for (let i = 0; i < grille.grid[0].length; i++) {
            const neighborhood = config.getNeighborhood(i, -2, 2);
            for (let j = 0; j < regles.length; j++) {
                if (reglesbools[j].condition.eval(neighborhood)) {
                    const newRules = [...activeRules];
                    newRules[j] = true;
                    setActiveRules(newRules);
                }
            }
        }
    }, [grille]);

    return {
        grille,
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
    };
};

export default ManagerGrilleInteractive;
