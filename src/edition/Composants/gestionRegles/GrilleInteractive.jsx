import React from 'react';
import GestionnaireSignauxGrille from './GestionnaireSignauxGrille';

const GrilleInteractive = ({
                               grille,
                               activeCells,
                               listeSignaux,
                               handleAddSignal,
                               handleRemoveSignal,
                               handleAddAllSignals,
                               handleRemoveAllSignals,
                               handleRemoveAllSignalsFromGrid,
                               handleCaseClick,
                               handleSaveRule
                           }) => {

    const setActiveSignals = (grille) => {
        if (activeCells.length === 0) {
            return [];
        }
        const signals = [];
        activeCells.forEach(cell => {
            grille.getCase(cell.row, cell.col).signals.forEach(signal => {
                if (!signals.includes(signal.value)) {
                    signals.push(signal.value);
                }
            });
        });
        return signals.filter(signal =>
            activeCells.every(cell => grille.getCase(cell.row, cell.col).signals.map(s => s.value).includes(signal))
        );
    };

    return (
        <div style={{display: 'flex'}}>
            <div>
                <h1>Grille Interactive</h1>
                <div>
                    {grille.grid.map((row, rowIndex) => (
                        <div key={rowIndex} style={{ display: 'flex', alignItems: 'center' }}>
                            {/* Affichage de l'indice de ligne à gauche */}
                            <div style={{ width: '30px', textAlign: 'center' }}>
                                {/* la valeur affichée sera grid length/2 ARRONDIE AU Superieur */}
                                {Math.floor(grille.grid.length /2)- rowIndex}
                            </div>
                            {row.map((caseObj, colIndex) => {
                                const isActive = activeCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
                                return (
                                    <button
                                        key={colIndex}
                                        style={{
                                            backgroundColor: isActive ? 'blue' : 'white',
                                            color: isActive ? 'white' : 'black',
                                            margin: '5px',
                                            padding: '10px'
                                        }}
                                        onClick={(event) => handleCaseClick(rowIndex, colIndex, event)}
                                    >
                                        {caseObj.signals.map((signal, idx) => (
                                            <span key={idx}>{signal.value} </span>
                                        ))}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div>
                    <button onClick={handleRemoveAllSignalsFromGrid}>Supprimer tous les signaux de la grille</button>
                </div>
                {activeCells.length > 0 && (
                    <GestionnaireSignauxGrille
                        signals={setActiveSignals(grille)}
                        allSignals={listeSignaux}
                        onAddSignal={handleAddSignal}
                        onRemoveSignal={handleRemoveSignal}
                        onAddAllSignals={handleAddAllSignals}
                        onRemoveAllSignals={handleRemoveAllSignals}
                    />
                )}
                <button onClick={handleSaveRule}>Ajouter règle</button>
            </div>
        </div>
    );
};

export default GrilleInteractive;
