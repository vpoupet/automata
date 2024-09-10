import Automaton from "../classes/Automaton";
import { SettingsInterface, Signal } from "../types";
import RuleComponent from "./RuleComponent";

interface RulesListProps {
    automaton: Automaton;
    settings: SettingsInterface;
    colorMap: Map<Signal, string>;
}

export default function RulesList(props: RulesListProps): JSX.Element {
    const { automaton, settings, colorMap } = props;
    return (
        <div className="flex flex-col gap-2 m-2">
            {automaton.rules.map((rule) => (
                <RuleComponent
                    key={rule.toString()}
                    rule={rule}
                    settings={settings}
                    colorMap={colorMap}
                />
            ))}
        </div>
    );
}
