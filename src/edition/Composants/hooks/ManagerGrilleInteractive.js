import { useEffect, useState } from 'react';
import Grille from "../../Objets/Grille";
import Cellule from "../../Objets/Cellule";
import { Configuration } from "../../../classes/Configuration.ts";

const ManagerGrilleInteractive = (rows, cols, automaton, reglesbools, setAutomaton, setActiveRule, regles, reglesbool, activeRules) => {
    const [grille, setGrille] = useState(new Grille(rows, cols));
    const [activeCells, setActiveCells] = useState([]);

    const updateGrille = (callback) => {
        const newGrille = new Grille(grille.grid.length, grille.grid[0].length);
        newGrille.grid = grille.grid.map((r, rowIndex) =>
            r.map((c, colIndex) => {
                const newCase = new Cellule();
                newCase.signals = [...c.signals];
                if (activeCells.some(cell => cell.row === rowIndex && cell.col === colIndex)) {
                    callback(newCase);
                }
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    const handleCaseClick = (rowIndex, colIndex, event) => {
        if (event.ctrlKey || event.metaKey) {
            setActiveCells((prev) => {
                const alreadySelected = prev.some(cell => cell.row === rowIndex && cell.col === colIndex);
                if (alreadySelected) {
                    return prev.filter(cell => !(cell.row === rowIndex && cell.col === colIndex));
                } else {
                    return [...prev, { row: rowIndex, col: colIndex }];
                }
            });
        } else if (event.shiftKey) {
            setActiveCells((prev) => {
                const alreadySelected = prev.some(cell => cell.row === rowIndex && cell.col === colIndex);
                if (alreadySelected) {
                    return prev.filter(cell => !(cell.row === rowIndex && cell.col === colIndex));
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

    const handleRemoveSignal = (signal) => {
        updateGrille((caseObj) => caseObj.removeSignal(signal));
    };

    const handleAddSignal = (signal) => {
        if (typeof signal !== 'symbol') {
            console.error('Invalid signal value:', signal);
            return;
        }
        updateGrille((caseObj) => caseObj.addSignal(signal));
    };

    const handleRemoveAllSignals = () => {
        updateGrille((caseObj) => {
            caseObj.removeAllSignals();
        });
    };

    const handleRemoveAllSignalsFromGrid = () => {
        const newGrille = new Grille(rows, cols);
        setGrille(newGrille);
        setActiveCells([]);
    };

    const updateGrilleFromRule = (configuration) => {
        const newGrille = new Grille(rows, cols);
        newGrille.grid = configuration.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
                const newCase = new Cellule();
                    cell.signals.forEach(signal => newCase.addSignal(signal));
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    const handleAddAllSignals = (listeSignaux) => {
        updateGrille((caseObj) => {
            if (Array.isArray(listeSignaux)) {
                listeSignaux.forEach(signal => {
                    if (typeof signal === 'symbol') {
                        caseObj.addSignal(signal);
                    } else {
                        console.error('Invalid signal in listeSignaux:', signal);
                    }
                });
            } else {
                console.error('Invalid listeSignaux:', listeSignaux);
            }
        });
    };

    const updateSignalInGrid = (oldSignal, newSignal) => {
        const newGrille = new Grille(grille.grid.length, grille.grid[0].length);
        newGrille.grid = grille.grid.map(row =>
            row.map(cell => {
                const newCase = new Cellule();
                cell.signals.forEach(signal => {
                    if (signal === oldSignal) {
                        newCase.addSignal(newSignal);
                    } else if (signal === Symbol.for('!' + Symbol.keyFor(oldSignal))) {
                        newCase.addSignal(Symbol.for('!' + Symbol.keyFor(newSignal)));
                    } else {
                        newCase.addSignal(signal);
                    }
                });
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    const deleteSignalInGrid = (signal) => {
        const newGrille = new Grille(grille.grid.length, grille.grid[0].length);
        newGrille.grid = grille.grid.map(row =>
            row.map(cell => {
                const newCase = new Cellule();
                cell.signals.forEach(s => {
                    if (s !== signal && s !== Symbol.for('!' + Symbol.keyFor(signal))) {
                        newCase.addSignal(s);
                    }
                });
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    const handleUpdateFromDiagramme = (cells) => {
        const newGrille = new Grille(rows, cols);

        cells.forEach((cell, index) => {
            cell.cell.forEach(signal => {
                newGrille.grid[0][index].addSignal(signal);
            });
        });
        setGrille(newGrille);
    };

    const applyRulesGrid = () => {
        const newGrille = new Grille(rows, cols);
        const conffromgrid = new Configuration(grille.grid.length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            conffromgrid.cells[i] = grille.grid[0][i].toSet();
        }
        automaton.setRules(reglesbools);
        automaton.updateParameters();
        setAutomaton(automaton);
        const conf = automaton.makeDiagram(conffromgrid, grille.grid.length - 1);
        for (let i = 0; i < conf.length; i++) {
            for (let j = 0; j < conf[i].cells.length; j++) {
                const cellSet = conf[i].cells[j];
                const cell = new Cellule();
                cell.fromSet(cellSet);
                newGrille.grid[i][j] = cell;
            }
        }
        setGrille(newGrille);
    };

    useEffect(() => {
        const config = new Configuration(grille.grid[0].length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            config.cells[i] = grille.grid[0][i].toSet();
        }
        for (let i = 0; i < regles.length; i++) {
            setActiveRule((prevRules) => {
                let newRules = [...prevRules];
                newRules[i] = false;
                return newRules;
            });
        }

        for (let i = 0; i < grille.grid[0].length; i++) {
            const neighborhood = config.getNeighborhood(i, -2, 2);
            for (let j = 0; j < regles.length; j++) {
                if (reglesbool[j].condition.eval(neighborhood)) {
                    let newRules = [...activeRules];
                    newRules[j] = true;
                    setActiveRule(newRules);
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
        applyRulesGrid
    };
};

export default ManagerGrilleInteractive;
