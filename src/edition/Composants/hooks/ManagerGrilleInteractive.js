import { useState } from 'react';
import Grille from "../../Objets/Grille";
import Cellule from "../../Objets/Cellule";
import Signal from "../../Objets/Signal";

const ManagerGrilleInteractive = (rows, cols) => {
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
        if (event.ctrlKey) {
            setActiveCells((prev) => {
                const alreadySelected = prev.some(cell => cell.row === rowIndex && cell.col === colIndex);
                if (alreadySelected) {
                    return prev.filter(cell => !(cell.row === rowIndex && cell.col === colIndex));
                } else {
                    return [...prev, { row: rowIndex, col: colIndex }];
                }
            });
        } else {
            setActiveCells([{ row: rowIndex, col: colIndex }]);
        }
    };

    const handleRemoveSignal = (signalValue) => {
        updateGrille((caseObj) => caseObj.removeSignal(signalValue));
    };

    const handleAddSignal = (signalValue) => {
        if (typeof signalValue !== 'string') {
            console.error('Invalid signal value:', signalValue);
            return;
        }
        updateGrille((caseObj) => caseObj.addSignal(signalValue));
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
            row.map((signals, colIndex) => {
                const newCase = new Cellule();
                if (Array.isArray(signals)) {
                    signals.forEach(signal => newCase.addSignal(String(signal)));  // Convertir en chaîne de caractères
                } else {
                    newCase.addSignal(String(signals));
                }
                return newCase;
            })
        );
        setGrille(newGrille);
    };


    const handleAddAllSignals = (listeSignaux) => {
        updateGrille((caseObj) => {
            if (Array.isArray(listeSignaux)) {
                listeSignaux.forEach(signal => {
                    if (signal instanceof Signal) {
                        caseObj.addSignal(signal.value);
                    } else {
                        console.error('Invalid signal in listeSignaux:', signal);
                    }
                });
            } else {
                console.error('Invalid listeSignaux:', listeSignaux);
            }
        });
    };


    const updateSignalInGrid = (oldValue, newValue) => {
        const newGrille = new Grille(grille.grid.length, grille.grid[0].length);
        newGrille.grid = grille.grid.map(row =>
            row.map(cell => {
                const newCase = new Cellule();
                cell.signals.forEach(signal => {
                    if (signal.value === oldValue) {
                        newCase.addSignal(newValue);
                    } else if (signal.value === '!' + oldValue) {
                        newCase.addSignal('!' + newValue);
                    } else {
                        newCase.addSignal(signal.value);
                    }
                });
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    const deleteSignalInGrid = (signalValue) => {
        const newGrille = new Grille(grille.grid.length, grille.grid[0].length);
        newGrille.grid = grille.grid.map(row =>
            row.map(cell => {
                const newCase = new Cellule();
                cell.signals.forEach(signal => {
                    if (signal.value !== signalValue && signal.value !== '!' + signalValue) {
                        newCase.addSignal(signal.value);
                    }
                });
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    return { grille, activeCells, setActiveCells, handleAddSignal, handleRemoveSignal, handleAddAllSignals, handleRemoveAllSignals, handleRemoveAllSignalsFromGrid, handleCaseClick, updateGrilleFromRule, updateSignalInGrid, deleteSignalInGrid };
};

export default ManagerGrilleInteractive;
