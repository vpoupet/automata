import Automaton from "../classes/Automaton";
import { Signal } from "../types";
import RuleComponent from "./RuleComponent";

interface RulesListProps {
    automaton: Automaton;
    colorMap: Map<Signal, string>;
}

export default function RulesList(props: RulesListProps): JSX.Element {
    const { automaton, colorMap } = props;
    return (
        <div className="flex flex-col gap-2">
            {automaton.rules.map((rule) => (
                <RuleComponent
                    key={rule.toString()}
                    rule={rule}
                    colorMap={colorMap}
                />
            ))}
        </div>
    );
}
