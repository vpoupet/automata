import React from 'react';
import Cell from '../../../components/Diagram.tsx';
import '../../../style/Cell.css';

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
                        <Cell
                            key={`${rowIndex}-${colIndex}`}
                            cell={cell.signals}
                            className=''
                        />
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
