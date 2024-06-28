import React from 'react';

const Regle = ({ grille, onLoadRule, onDeleteRule, onUpdateRule, activeRule}) => {

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grille[0].length}, 1fr)`, gap: '2px' , backgroundColor: activeRule ? 'blue' : 'white'
            }}>
                {grille.slice().reverse().map((row, rowIndex) => (
                    row.map((cell, colIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} style={{ width: '20px', height: '20px', backgroundColor: cell.length > 0 ? 'blue' : 'white', border: '1px solid black' }}>
                            {cell.length > 0 && <span style={{ fontSize: '10px', color: 'white' }}>{cell.join(',')}</span>}
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
