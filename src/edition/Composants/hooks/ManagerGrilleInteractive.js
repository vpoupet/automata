import {useState} from 'react';
import Grille from "../../Objets/Grille";
import Cellule from "../../Objets/Cellule";
import Signal from "../../Objets/Signal";
import {Configuration} from "../../../classes/Configuration.ts";

const ManagerGrilleInteractive = (rows, cols, automaton, reglesArithmetiques, setAutomaton) => {
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
                    return [...prev, {row: rowIndex, col: colIndex}];
                }
            });
        } else {
            setActiveCells([{row: rowIndex, col: colIndex}]);
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
                        caseObj.addSignal(signal.getValue());
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
                    if (signal.getValue() === oldValue) {
                        newCase.addSignal(newValue);
                    } else if (signal.getValue() === '!' + oldValue) {
                        newCase.addSignal('!' + newValue);
                    } else {
                        newCase.addSignal(signal.getValue());
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
                    if (signal.getValue() !== signalValue && signal.getValue() !== '!' + signalValue) {
                        newCase.addSignal(signal.getValue());
                    }
                });
                return newCase;
            })
        );
        setGrille(newGrille);
    };

    const handleUpdateFromDiagramme = (cells) => {
        console.log("les cells de manager : ", cells);
        const newGrille = new Grille(rows, cols);

        cells.forEach((cell, index) => {
            cell.cell.forEach(signal => {
                newGrille.grid[0][index].addSignal(Symbol.keyFor(signal));
            });
        });
        setGrille(newGrille);
    };


    const applyRulesGrid = () => {
        //applique les règles sur la grille, pour l'instant 4 step max
        const newGrille = new Grille(rows, cols);
        const conffromgrid = new Configuration(grille.grid.length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            conffromgrid.cells[i] = grille.grid[0][i].toSet()
        }
        console.log("la ligne initiale", conffromgrid)

        automaton.setRules(reglesArithmetiques);
        automaton.updateParameters();
        setAutomaton(automaton);
        const conf = automaton.makeDiagram(conffromgrid, 4);

        console.log("conf pas confiant", conf,'taille : ', conf.length)
        //passer de tableaux de tableau contenant des sets de Symbol
        //à des tableaux de tableaux contenant des tableaux de Signal

        for (let i = 0; i < conf.length; i++) {
            console.log("confis de canard",conf[i])
            for (let j = 0; j < conf[i].cells.length; j++) {
                console.log("confiji de figue", conf[i][j])
                const cellSet = conf[i].cells[j];
                const cell = new Cellule();
                cell.fromSet(cellSet);
                newGrille.grid[i][j] = cell;
            }
        }

        console.log('la grille a update', newGrille);
        setGrille(newGrille);
    }

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
