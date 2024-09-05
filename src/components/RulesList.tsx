import Automaton from "../classes/Automaton";
import RuleComponent from "./RuleComponent";

interface RulesListProps {
    automaton: Automaton;
}

export default function RulesList(props: RulesListProps): JSX.Element {
    const { automaton } = props;
    return (
        <div>
            {automaton.rules.map((rule) => (
                <RuleComponent key={rule.toString()} rule={rule} />
            ))}
        </div>
    );
}
