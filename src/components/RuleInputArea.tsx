import { useRef } from "react";
import Button from "./Button";
import Automaton from "../classes/Automaton";

interface RuleInputAreaProps {
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
}

export default function RuleInputArea(props: RuleInputAreaProps) {
    const { automaton, setAutomaton } = props;
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    function printRules() {
        let stringRule = "";
        for (const [signal, subSignals] of automaton.multiSignals.entries()) {
            stringRule += `${signal.description} = ${Array.from(subSignals).map(s => s.description).join(" ")}\n`;
        }
        for (const rule of automaton.rules) {
            stringRule += rule.toString();
            stringRule += "\n";
        }
        console.log(stringRule);
    }

    function addRules() {
        if (textAreaRef.current) {
            const rulesText = textAreaRef.current.value;
            const newAutomaton = automaton.parseRules(rulesText);
            setAutomaton(newAutomaton);
        }
    }

    function clearRules() {
        setAutomaton(new Automaton());
    }

    return (
        <div>
            <textarea
                id="rulesText"
                className="font-mono p-2 border border-gray-400 shadow-md"
                rows={12}
                cols={60}
                ref={textAreaRef}
                placeholder="Mettez votre règle ici"
            />
            <div className="flex gap-2">
                <Button onClick={printRules}>
                    Sortir règles en texte
                </Button>
                <Button onClick={addRules}>
                    Ajouter règle depuis texte
                </Button>
                <Button onClick={clearRules}>Effacer les règles</Button>
            </div>
        </div>
    );
}
