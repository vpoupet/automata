import { useRef } from "react";
import Regle from "./Regle.tsx";
import Cellule from "../../Objets/Cellule.ts";
import { Rule } from "../../../classes/Automaton.ts";

type ListeReglesProps = {
    regles: Cellule[][][];
    reglesbools: Rule[];
    onLoadRule: (index: number) => void;
    onDeleteRule: (index: number) => void;
    onUpdateRule: (index: number) => void;
    activeRules: boolean[];
    printReglesConsole: () => void;
    addRuleFromString: (rule: string) => void;
};

const ListeRegles = ({
    regles,
    reglesbools,
    onLoadRule,
    onDeleteRule,
    onUpdateRule,
    activeRules,
    printReglesConsole,
    addRuleFromString,
}: ListeReglesProps): JSX.Element => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
                <div key={index} style={{ marginBottom: "10px" }}>
                    <Regle
                        grille={regle}
                        activeRule={activeRules[index]}
                        onLoadRule={() => onLoadRule(index)}
                        onDeleteRule={() => onDeleteRule(index)}
                        onUpdateRule={() => onUpdateRule(index)}
                    />
                    {reglesbools[index] !== null &&
                    reglesbools[index] !== undefined
                        ? reglesbools[index].toString()
                        : ""}
                </div>
            ))}
            <button onClick={printReglesConsole}>Sortir règles en texte</button>
            <textarea
                id="rulesText"
                rows={10}
                cols={50}
                ref={textAreaRef}
                placeholder="Mettez votre règle ici"
            />
            <button onClick={handleAddRule}>Ajouter règle depuis texte</button>
        </div>
    );
};

export default ListeRegles;
