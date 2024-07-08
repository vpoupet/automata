import { useState } from "react";
import { Automaton, Rule } from "../classes/Automaton.ts";
import { Diagram } from "../components/Diagram.tsx";
import "./App.css";
import GrilleInteractive from "./Composants/gestionCreationRegles/GrilleInteractive.tsx";
import GestionSignaux from "./Composants/gestionSignaux/GestionSignaux.js";
import ManagerGrilleInteractive from "./Composants/hooks/ManagerGrilleInteractive.ts";
import ManagerRegles from "./Composants/hooks/ManagerRegles.ts";
import ManagerSignaux from "./Composants/hooks/ManagerSignaux.ts";
import ListeRegles from "./Composants/regles/ListeRegles.js";
import Cellule from "./Objets/Cellule.ts";
import { Signal } from "../classes/types.ts";

type SettingsInterface = {
    nbCells: number;
    nbSteps: number;
    timeGoesUp: boolean;
};

function App() {
    const [rows] = useState<number>(2);
    const [cols] = useState<number>(5);
    const [regles, setRegles] = useState<Cellule[][][]>([]);
    const [reglesbools, setReglesbools] = useState<Rule[]>([]);
    const [activeRules, setActiveRules] = useState<boolean[]>([]);

    const [automaton, setAutomaton] = useState<Automaton>(new Automaton());
    const [settings] = useState<SettingsInterface>({
        nbCells: 40,
        nbSteps: 60,
        timeGoesUp: true,
    });

    const {
        grille,
        activeCells,
        deleteSignalInGrid,
        updateGrilleFromRule,
        handleCaseClick,
        handleAddAllSignals,
        handleRemoveAllSignals,
        handleRemoveAllSignalsFromGrid,
        handleAddSignal,
        handleRemoveSignal,
        updateSignalInGrid,
        handleUpdateFromDiagramme,
        applyRulesGrid,
    } = ManagerGrilleInteractive(
        rows,
        cols,
        automaton,
        reglesbools,
        setAutomaton,
        setActiveRules,
        regles,
        activeRules
    );

    const { listeSignaux, handleAddNewSignal, deleteSignal, updateSignal } =
        ManagerSignaux();

    const {
        deleteSignalInRules,
        handleSaveRule,
        updateRule,
        deleteRule,
        updateRuleSignal,
        modifyRule,
        printReglesConsole,
        addRuleFromString,
    } = ManagerRegles(
        grille,
        setAutomaton,
        setReglesbools,
        reglesbools,
        regles,
        setRegles,
    );

    const sendLoadRuleToGrid = (index: number) => {
        const configuration = regles[index];
        updateGrilleFromRule(configuration);
    };

    const handleUpdateSignal = (index: number, newValue: Signal) => {
        const {
            oldValue,
            newValue: updatedValue,
        } = updateSignal(index, newValue);

        if (oldValue && updatedValue) {
            updateRuleSignal(oldValue, updatedValue);
            updateSignalInGrid(oldValue, updatedValue);
        }
    };

    const handleDeleteSignal = (index: number) => {
        const signal = deleteSignal(index);
        if (signal) {
            deleteSignalInRules(signal);
            deleteSignalInGrid(signal);
        }
    };

    const handleAddAllToCell = () => {
        handleAddAllSignals(listeSignaux);
    };

    const handleCellClick = (cells: Cellule[]) => {
        handleUpdateFromDiagramme(cells);
    };

    return (
        <div className="App">
            <div className="top-section">
                <div className="grille-interactive">
                    <GrilleInteractive
                        grille={grille}
                        activeCells={activeCells}
                        listeSignaux={listeSignaux}
                        handleAddSignal={handleAddSignal}
                        handleRemoveSignal={handleRemoveSignal}
                        handleAddAllSignals={handleAddAllToCell}
                        handleRemoveAllSignals={handleRemoveAllSignals}
                        handleRemoveAllSignalsFromGrid={
                            handleRemoveAllSignalsFromGrid
                        }
                        handleCaseClick={handleCaseClick}
                        handleSaveRule={handleSaveRule}
                        applyRules={applyRulesGrid}
                        modifyRule={modifyRule}
                    />
                </div>
                <div className="gestion-signaux">
                    <GestionSignaux
                        listeSignaux={listeSignaux}
                        onAddSignal={handleAddNewSignal}
                        onUpdateSignal={handleUpdateSignal}
                        onDeleteSignal={handleDeleteSignal}
                    />
                </div>
            </div>
            <div className="middle-section">
                <div className="liste-regles">
                    <ListeRegles
                        regles={regles}
                        reglesbools={reglesbools}
                        onLoadRule={sendLoadRuleToGrid}
                        onUpdateRule={updateRule}
                        onDeleteRule={deleteRule}
                        activeRules={activeRules}
                        printReglesConsole={printReglesConsole}
                        addRuleFromString={addRuleFromString}
                    />
                </div>
            </div>
            <div className="diagram">
                <Diagram
                    automaton={automaton}
                    settings={settings}
                    onCellClick={handleCellClick}
                />
            </div>
        </div>
    );
}

export default App;
