import { MdRedo, MdUndo } from "react-icons/md";
import Automaton from "../classes/Automaton";
import { SettingsInterface, Signal } from "../types";
import Button from "./Common/Button";
import Heading from "./Common/Heading";
import RuleComponent from "./RuleComponent";
import { IoMdClipboard } from "react-icons/io";
import { useState } from "react";
import { FaCircleDown, FaCircleUp } from "react-icons/fa6";

interface RulesListProps {
    automaton: Automaton;
    automatonIndex: number;
    automataHistoryLength: number;
    setAutomaton: (automaton: Automaton) => void;
    changeIndexAutomaton: (index: number) => void;
    exportRules: () => void;
    settings: SettingsInterface;
    colorMap: Map<Signal, string>;
}

export default function RulesList(props: RulesListProps): JSX.Element {
    const {
        automaton,
        automatonIndex,
        automataHistoryLength,
        setAutomaton,
        changeIndexAutomaton,
        exportRules,
        settings,
        colorMap,
    } = props;
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="my-4">
            <span className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <Heading className="flex flex-row gap-4 items-center" level={2}>Rules {isExpanded ? <FaCircleUp color="#AAA"/> : <FaCircleDown color="#AAA" />}</Heading>
            </span>
            <span className="flex flex-row gap-1">
                <Button
                    onClick={() => changeIndexAutomaton(-1)}
                    disabled={automatonIndex === 0}
                    className="flex flex-row items-center gap-2"
                >
                    <MdUndo />({automatonIndex})
                </Button>
                <Button
                    onClick={() => changeIndexAutomaton(1)}
                    disabled={automatonIndex >= automataHistoryLength - 1}
                    className="flex flex-row items-center gap-2"
                >
                    <MdRedo /> ({automataHistoryLength - automatonIndex - 1})
                </Button>
                <Button onClick={() => setAutomaton(new Automaton())}>
                    Clear rules
                </Button>
                <Button onClick={exportRules}>
                    <IoMdClipboard />
                </Button>
            </span>
            {isExpanded && (
                <div className="flex flex-col gap-2 m-2">
                    {automaton.rules.map((rule) => (
                        <RuleComponent
                            key={rule.toString()}
                            rule={rule}
                            settings={settings}
                            deleteRule={(rule) =>
                                setAutomaton(automaton.deleteRule(rule))
                            }
                            colorMap={colorMap}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
