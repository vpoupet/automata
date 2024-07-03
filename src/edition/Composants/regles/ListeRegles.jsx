import React, {useRef} from 'react';
import Regle from "./Regle";

const ListeRegles = ({
                         regles,
                         reglesbools,
                         onLoadRule,
                         onDeleteRule,
                         onUpdateRule,
                         activeRules,
                         printReglesConsole,
                         addRuleFromString
                     }) => {
    const textAreaRef = useRef(null);

    const handleAddRule = () => {
        if (textAreaRef.current) {
            const ruleText = textAreaRef.current.value;
            addRuleFromString(ruleText);
        }
    };

    return (
        <div>
            <h2>Règles enregistrées</h2>
            {regles.map((regle, index) => (
                <div key={index} style={{marginBottom: '10px'}}>
                    <Regle
                        grille={regle}
                        activeRule={activeRules[index]}
                        onLoadRule={() => onLoadRule(index)}
                        onDeleteRule={() => onDeleteRule(index)}
                        onUpdateRule={() => onUpdateRule(index)}
                    />
                    {reglesbools[index] !== null && reglesbools[index] !== undefined ? reglesbools[index].toString() : ''}
                </div>
            ))}
            <button onClick={printReglesConsole}>Sortir règles en texte</button>
            <textarea
                id="rulesText"
                rows="10"
                cols="50"
                ref={textAreaRef}
                placeholder="Mettez votre règle ici"
            />
            <button onClick={handleAddRule}>Ajouter règle depuis texte</button>
        </div>
    );
}

export default ListeRegles;
