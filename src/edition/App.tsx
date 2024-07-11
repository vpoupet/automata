import { useState } from "react";
import { Automaton, Rule } from "../classes/Automaton.ts";
import { Diagram } from "../components/Diagram.tsx";
import "./App.css";
import GrilleInteractive from "./Composants/gestionCreationRegles/GrilleInteractive.tsx";
import GestionSignaux from "./Composants/gestionSignaux/GestionSignaux.js";
import ManagerRegles from "./Composants/hooks/ManagerRegles.ts";
import ManagerSignaux from "./Composants/hooks/ManagerSignaux.ts";
import ManagerGrilleInteractive from "./Composants/hooks/ManagerGrilleInteractive.ts";
import ListeRegles from "./Composants/regles/ListeRegles.js";
import { Cell } from "../classes/Cell.ts";
import { Configuration } from "../classes/Configuration.ts";
import { Signal } from "../classes/types.ts";
import RuleGrid from "./Objets/RuleGrid.ts";

type SettingsInterface = {
    nbCells: number;
    nbSteps: number;
    timeGoesUp: boolean;
};

function App() {
    const [rows] = useState<number>(2);
    const [cols] = useState<number>(5);
    const [rulesGrid, setrulesGrid] = useState<RuleGrid[]>([]);
    const [reglesbools, setReglesbools] = useState<Rule[]>([]);
    const [activeRules, setActiveRules] = useState<boolean[]>([]);

    const [automaton, setAutomaton] = useState<Automaton>(new Automaton());
    const [settings] = useState<SettingsInterface>({
        nbCells: 40,
        nbSteps: 60,
        timeGoesUp: true,
    });

    const {
        grid,
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
        handleAddNegatedSignal,
    } = ManagerGrilleInteractive(
        rows,
        cols,
        automaton,
        reglesbools,
        setAutomaton,
        // setActiveRules,
        // rulesGrid,
        // activeRules
    );

    const { listeSignaux, handleAddNewSignal, deleteSignal, updateSignal } =
        ManagerSignaux();

    const {
        deleteSignalInRules,
        handleSaveRule,
        updateRule,
        deleteRule,
        updateSignalInRule,
        modifyRule,
        printReglesConsole,
        addRuleFromString,
    } = ManagerRegles(
        grid,
        setAutomaton,
        setReglesbools,
        reglesbools,
        rulesGrid,
        setrulesGrid,
    );

    const sendLoadRuleToGrid = (index: number) => {
        const configuration = rulesGrid[index];
        updateGrilleFromRule(configuration);
    };

    const handleUpdateSignal = (index: number, newValue: Signal) => {
        const {
            oldValue,
            newValue: updatedValue,
        } = updateSignal(index, newValue);

        if (oldValue && updatedValue) {
            updateSignalInRule(oldValue, updatedValue);
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

    const handleCellClick = (cells: Cell[]) => {
        handleUpdateFromDiagramme(cells);
    };

    const initialConfiguration = new Configuration(settings.nbCells);
    initialConfiguration.cells[0].addSignal(Symbol.for("Init"));

    return (
        <div className="App">
            <div className="top-section">
                <div className="grille-interactive">
                    <GrilleInteractive
                        grid={grid}
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
                        handleAddNegatedSignal={handleAddNegatedSignal}
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
                        rulesGrid={rulesGrid}
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
                    initialConfiguration={initialConfiguration}
                    nbSteps={settings.nbSteps}
                />
            </div>
        </div>
    );
}

export default App;
