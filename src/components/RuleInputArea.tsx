import { useRef } from "react";
import Button from "./Common/Button";
import Automaton from "../classes/Automaton";

interface RuleInputAreaProps {
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
}

export default function RuleInputArea(props: RuleInputAreaProps) {
    const { automaton, setAutomaton } = props;
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    function addRules() {
        if (textAreaRef.current) {
            const rulesText = textAreaRef.current.value;
            setAutomaton(automaton.addRulesFromString(rulesText));
        }
    }

    function clearTextArea() {
        if (textAreaRef.current) {
            textAreaRef.current.value = "";
        }
    }

    return (
        <div>
            <textarea
                id="rulesText"
                className="font-mono p-2 border border-gray-400 shadow-md w-full"
                cols={60}
                rows={12}
                ref={textAreaRef}
                placeholder="Enter rules here"
            />
            <div className="w-full flex flex-row gap-2 justify-center">
                <Button variant="secondary" onClick={clearTextArea}>Clear</Button>
                <Button onClick={addRules}>
                    Add rules
                </Button>
            </div>
        </div>
    );
}
