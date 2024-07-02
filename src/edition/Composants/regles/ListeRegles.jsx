import React from 'react';
import Regle from "./Regle";

const ListeRegles = ({regles,reglesbools, onLoadRule, onDeleteRule, onUpdateRule, activeRules, printReglesConsole}) => {


    return (
        <div>
            <h2>Règles enregistrées</h2>
            {regles.map((regle, index) => (
                <div key={index} style={{marginBottom: '10px'}}>
                    {reglesbools[index] !== null && reglesbools[index] !== undefined ? reglesbools[index].toString() : ''}
                    <Regle
                        grille={regle}
                        activeRule={activeRules[index]}
                        onLoadRule={() => onLoadRule(index)}
                        onDeleteRule={() => onDeleteRule(index)}
                        onUpdateRule={() => onUpdateRule(index)}
                    />
                </div>
            ))}
            <button onClick={printReglesConsole}>Sortir règles en texte</button>
        </div>
    );
}

export default ListeRegles;
