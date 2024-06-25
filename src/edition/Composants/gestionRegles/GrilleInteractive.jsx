import React from 'react';
import GestionnaireSignauxGrille from './GestionnaireSignauxGrille';
import Cell from '../../../components/Diagram.tsx';
import '../../../style/Cell.css';

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
                               handleSaveRule,
                               applyRules
                           }) => {
    const setActiveSignals = () => {
        if (activeCells.length === 0) {
            return [];
        }
        const signals = [];
        activeCells.forEach(cell => {
            grille.getCase(cell.row, cell.col).signals.forEach(signal => {
                if (!signals.includes(signal.getValue())) {
                    signals.push(signal.getValue());
                }
            });
        });
        return signals.filter(signal =>
            activeCells.every(cell => grille.getCase(cell.row, cell.col).signals.map(s => s.getValue()).includes(signal))
        );
    };

    return (
        <div style={{ display: 'flex' }}>
            <div>
                <h1>Grille Interactive</h1>
                <div className="grid-container">
                    {Array.from({ length: grille.grid[0].length }).map((_, colIndex) => (
                        <div key={colIndex} className="row">
                            <div style={{ width: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                                {colIndex + 1}
                            </div>
                            {Array.from({ length: grille.grid.length }).map((_, rowIndex) => {
                                const caseObj = grille.getCase(grille.grid.length - 1 - rowIndex, colIndex);
                                const isActive = activeCells.some(cell => cell.row === (grille.grid.length - 1 - rowIndex) && cell.col === colIndex);
                                return (
                                    <Cell
                                        key={rowIndex}
                                        cell={caseObj.signals}
                                        onClick={(event) => handleCaseClick(grille.grid.length - 1 - rowIndex, colIndex, event)}
                                        className={isActive ? 'active' : ''}
                                    />
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
                        signals={setActiveSignals()}
                        allSignals={listeSignaux}
                        onAddSignal={handleAddSignal}
                        onRemoveSignal={handleRemoveSignal}
                        onAddAllSignals={handleAddAllSignals}
                        onRemoveAllSignals={handleRemoveAllSignals}
                    />
                )}
                <button onClick={handleSaveRule}>Ajouter règle</button>
                <button onClick={applyRules}>Appliquer règles</button>
            </div>
        </div>
    );
};

export default GrilleInteractive;
