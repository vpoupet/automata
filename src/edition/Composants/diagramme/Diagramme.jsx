import React, { useState, useEffect } from 'react';
import Cellule from '../../Objets/Cellule.js';

const Diagramme = ({ heightMax = 15, widthMax = 10, initialValues = [] }) => {
    const createEmptyGrid = (height, width) => {
        let grid = [];
        for (let i = 0; i < height; i++) {
            let row = [];
            for (let j = 0; j < width; j++) {
                row.push(new Cellule());
            }
            grid.push(row);
        }
        return grid;
    };

    useEffect(() => {
        let newGrid = createEmptyGrid(heightMax, widthMax);

        for (let i = 0; i < initialValues.length && i < heightMax; i++) {
            for (let j = 0; j < initialValues[i].length && j < widthMax; j++) {
                newGrid[i][j].addSignal(initialValues[i][j]);
            }
        }

        setGrid(newGrid);
    }, [initialValues, heightMax, widthMax]);

    const [grid, setGrid] = useState(createEmptyGrid(heightMax, widthMax));

    return (
        <div>
            <h2>Diagramme</h2>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${widthMax}, 20px)` }}>
                {grid.map((row, rowIndex) => (
                    row.map((cell, cellIndex) => (
                        <div
                            key={`${rowIndex}-${cellIndex}`}
                            style={{
                                border: '1px solid black',
                                height: '20px',
                                width: '20px',
                                ...(rowIndex < initialValues.length ? { border: '1px solid red' } : {})
                            }}
                        ></div>
                    ))
                ))}
            </div>
        </div>
    );
};

export default Diagramme;
