import GrilleInteractive from './Composants/gestionRegles/GrilleInteractive.jsx';
import ListeRegles from './Composants/regles/ListeRegles';
import {useEffect, useState} from "react";

import GestionSignaux from "./Composants/gestionSignaux/GestionSignaux";
import ManagerGrilleInteractive from "./Composants/hooks/ManagerGrilleInteractive";
import ManagerSignaux from "./Composants/hooks/ManagerSignaux";
import ManagerRegles from "./Composants/hooks/ManagerRegles";
import {Diagram} from "../components/Diagram.tsx";
import {Automaton} from "../classes/Automaton.ts";

function App() {



    const [rows] = useState(5);
    const [cols] = useState(5);

    const [automaton, setAutomaton] = useState(new Automaton());
    const [settings, setSettings] = useState({
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
    } = ManagerGrilleInteractive(5, 5);

    const {
        listeSignaux,
        handleAddNewSignal,
        deleteSignal,
        updateSignal
    } = ManagerSignaux();

    const {
        regles,
        reglesArithmetiques,
        deleteSignalInRules,
        handleSaveRule,
        updateRule,
        deleteRule,
        updateRuleSignal,
    } = ManagerRegles(grille, setAutomaton);

    const sendLoadRuleToGrid = (index) => {
        const configuration = regles[index];
        updateGrilleFromRule(configuration);
    };

    const handleUpdateSignal = (index, newValue) => {
        const { success, oldValue, newValue: updatedValue } = updateSignal(index, newValue);

        if (success) {
            updateRuleSignal(oldValue, updatedValue);
            updateSignalInGrid(oldValue, updatedValue);
        }
    };

    const handleDeleteSignal = (index) => {
        const signalValue = deleteSignal(index);
        deleteSignalInRules(signalValue);
        deleteSignalInGrid(signalValue);
    };

    const handleAddAllToCell = () => {
        handleAddAllSignals(listeSignaux);
    }

    return (
        <div className="App">
            <div>
                <GrilleInteractive
                    grille={grille}
                    activeCells={activeCells}
                    regles={regles}
                    listeSignaux={listeSignaux}
                    handleAddSignal={handleAddSignal}
                    handleRemoveSignal={handleRemoveSignal}
                    handleAddAllSignals={handleAddAllToCell}
                    handleRemoveAllSignals={handleRemoveAllSignals}
                    handleRemoveAllSignalsFromGrid={handleRemoveAllSignalsFromGrid}
                    handleCaseClick={handleCaseClick}
                    handleSaveRule={handleSaveRule}
                />
            </div>
            <div>
                <ListeRegles
                    regles={regles}
                    reglesArithmetiques={reglesArithmetiques}
                    onLoadRule={sendLoadRuleToGrid}
                    onUpdateRule={updateRule}
                    onDeleteRule={deleteRule}
                />
            </div>
            <div>
                <GestionSignaux
                    listeSignaux={listeSignaux}
                    onAddSignal={handleAddNewSignal}
                    onUpdateSignal={handleUpdateSignal}
                    onDeleteSignal={handleDeleteSignal}
                />
            </div>
            <Diagram automaton={automaton} settings={settings} />
        </div>
    );
}

export default App;