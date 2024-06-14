import React from 'react';
import Regle from "./Regle";

const ListeRegles = ({regles, onLoadRule, onDeleteRule, onUpdateRule}) => {


    return (
        <div>
            <h2>Règles enregistrées</h2>
            {regles.map((regle, index) => (
                <div key={index} style={{marginBottom: '10px'}}>
                    <Regle
                        grille={regle}
                        onLoadRule={() => onLoadRule(index)}
                        onDeleteRule={() => onDeleteRule(index)}
                        onUpdateRule={() => onUpdateRule(index)}
                    />
                </div>
            ))}
        </div>
    );
}

export default ListeRegles;
