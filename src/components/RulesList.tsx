import Automaton from "../classes/Automaton";
import { SettingsInterface, Signal } from "../types";
import RuleComponent from "./RuleComponent";

interface RulesListProps {
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
    settings: SettingsInterface;
    colorMap: Map<Signal, string>;
}

export default function RulesList(props: RulesListProps): JSX.Element {
    const { automaton, setAutomaton, settings, colorMap } = props;
    return (
        <div className="flex flex-col gap-2 m-2">
            {automaton.rules.map((rule) => (
                <RuleComponent
                    key={rule.toString()}
                    rule={rule}
                    settings={settings}
                    deleteRule={(rule) => setAutomaton(automaton.deleteRule(rule))}
                    colorMap={colorMap}
                />
            ))}
        </div>
    );
}
