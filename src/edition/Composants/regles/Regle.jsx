import React from 'react';

const Regle = ({ grille, onLoadRule, onDeleteRule, onUpdateRule, activeRule }) => {
    return (
        <div style={{ display: 'inline-block' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${grille[0].length}, 1fr)`,
                gap: '0px',
                backgroundColor: activeRule ? 'blue' : 'white'
            }}>
                {grille.slice().reverse().map((row, rowIndex) => (
                    row.map((cell, colIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: cell.signals.length > 0 ? 'blue' : 'white',
                            border: '1px solid black',
                            margin: '0px',
                            padding: '0px'
                        }}>
                            {cell.signals.length > 0 &&
                                <span style={{
                                    color: 'red',
                                    margin: '0px',
                                    padding: '0px'
                                }}>
                                    {cell.signals.map(signal => {
                                        return signal.length > 1 ? signal.substring(1) : signal.description;
                                    })}
                                </span>}
                        </div>
                    ))
                ))}
            </div>
            <div>
                <button onClick={onLoadRule}>Mettre dans grille</button>
                <button onClick={onDeleteRule}>Supprimer</button>
                <button onClick={onUpdateRule}>Mettre à jour</button>
            </div>
        </div>
    );
};

export default Regle;
