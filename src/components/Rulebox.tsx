import { useRef } from "react";
import { Automaton } from "../classes/Automaton";
import styles from "../style/Rulebox.module.scss";


interface RuleboxProps {
    rules: string;
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
}
export function Rulebox({ rules, automaton, setAutomaton }: RuleboxProps) {
    const ruleboxRef = useRef<HTMLTextAreaElement>(null);
    function updateRules() {
        const newRules = ruleboxRef.current?.value;
        if (newRules !== undefined) {
            setAutomaton(new Automaton(newRules));
        }
    }

    return <div className={styles.rulesContainer}>
        <textarea className={styles.rulebox} defaultValue={rules} ref={ruleboxRef}></textarea>
        <button onClick={updateRules}>Update</button>
    </div>;
}
